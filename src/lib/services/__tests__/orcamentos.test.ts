import { describe, expect, it, vi } from "vitest";
import { aprovarOrcamento } from "../orcamentos";
import { ErroNegocio } from "../erros";

interface ItemFake {
  modeloCobranca: "UNICO" | "MENSAL" | "IMPLANTACAO_MAIS_MENSAL";
  precoNegociado: number;
  quantidade: number;
  valorImplantacao?: number | null;
}

function criarOrcamentoBase(overrides: Partial<Record<string, unknown>> = {}, itens: ItemFake[] = []) {
  return {
    id: "orc-1",
    clienteId: "cli-1",
    status: "ENVIADO",
    formaPagamento: "PIX",
    valorTotal: 1000,
    itens,
    ...overrides,
  };
}

function criarTxFake(orcamento: ReturnType<typeof criarOrcamentoBase>) {
  const parcelasCriadas: any[] = [];

  const tx = {
    orcamento: {
      findUnique: vi.fn().mockResolvedValue(orcamento),
      update: vi.fn().mockResolvedValue({ ...orcamento, status: "APROVADO" }),
    },
    contrato: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: "ctr-1", numero: "CTR-2026-0001" }),
    },
    projeto: {
      create: vi.fn().mockResolvedValue({ id: "proj-1", status: "AGUARDANDO_PAGAMENTO" }),
    },
    parcela: {
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        const parcela = { id: `parcela-${parcelasCriadas.length + 1}`, ...data };
        parcelasCriadas.push(parcela);
        return parcela;
      }),
    },
  };

  return { tx, parcelasCriadas };
}

describe("aprovarOrcamento", () => {
  it("cria contrato + uma parcela UNICO quando só há itens de modelo único", async () => {
    const orcamento = criarOrcamentoBase({}, [
      { modeloCobranca: "UNICO", precoNegociado: 1000, quantidade: 1 },
    ]);
    const { tx, parcelasCriadas } = criarTxFake(orcamento);

    const resultado = await aprovarOrcamento(tx as any, {
      orcamentoId: "orc-1",
      dataInicio: new Date("2026-09-10T00:00:00.000Z"),
    });

    expect(resultado.contrato.id).toBe("ctr-1");
    expect(parcelasCriadas).toHaveLength(1);
    expect(parcelasCriadas[0].tipo).toBe("UNICO");
    expect(parcelasCriadas[0].valorOriginal).toBe(1000);
  });

  it("cria só a primeira mensalidade quando há itens de modelo MENSAL, no próximo dia de vencimento", async () => {
    const orcamento = criarOrcamentoBase({}, [
      { modeloCobranca: "MENSAL", precoNegociado: 500, quantidade: 1 },
    ]);
    const { tx, parcelasCriadas } = criarTxFake(orcamento);

    await aprovarOrcamento(tx as any, {
      orcamentoId: "orc-1",
      dataInicio: new Date("2026-09-25T00:00:00.000Z"), // depois do dia 10
      diaVencimento: 10,
    });

    expect(parcelasCriadas).toHaveLength(1);
    expect(parcelasCriadas[0].tipo).toBe("MENSALIDADE");
    expect(parcelasCriadas[0].competencia).toBe("2026-10");
  });

  it("cria parcela de implantação + primeira mensalidade para modelo IMPLANTACAO_MAIS_MENSAL", async () => {
    const orcamento = criarOrcamentoBase({}, [
      {
        modeloCobranca: "IMPLANTACAO_MAIS_MENSAL",
        precoNegociado: 300,
        valorImplantacao: 1500,
        quantidade: 1,
      },
    ]);
    const { tx, parcelasCriadas } = criarTxFake(orcamento);

    await aprovarOrcamento(tx as any, {
      orcamentoId: "orc-1",
      dataInicio: new Date("2026-09-10T00:00:00.000Z"),
      diaVencimento: 10,
    });

    expect(parcelasCriadas).toHaveLength(2);
    const implantacao = parcelasCriadas.find((p) => p.tipo === "IMPLANTACAO");
    const mensalidade = parcelasCriadas.find((p) => p.tipo === "MENSALIDADE");
    expect(implantacao.valorOriginal).toBe(1500);
    expect(mensalidade.valorOriginal).toBe(300);
    expect(mensalidade.competencia).toBe("2026-09"); // dia de início == diaVencimento -> mesmo mês
  });

  it("soma itens de modelos diferentes numa mesma parcela mensal", async () => {
    const orcamento = criarOrcamentoBase({}, [
      { modeloCobranca: "MENSAL", precoNegociado: 200, quantidade: 1 },
      { modeloCobranca: "IMPLANTACAO_MAIS_MENSAL", precoNegociado: 300, valorImplantacao: 1000, quantidade: 1 },
    ]);
    const { tx, parcelasCriadas } = criarTxFake(orcamento);

    await aprovarOrcamento(tx as any, {
      orcamentoId: "orc-1",
      dataInicio: new Date("2026-09-10T00:00:00.000Z"),
      diaVencimento: 10,
    });

    const mensalidade = parcelasCriadas.find((p) => p.tipo === "MENSALIDADE");
    expect(mensalidade.valorOriginal).toBe(500); // 200 + 300
  });

  it("rejeita orçamento não encontrado", async () => {
    const tx = {
      orcamento: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    await expect(aprovarOrcamento(tx as any, { orcamentoId: "inexistente" })).rejects.toThrow(ErroNegocio);
  });

  it("rejeita orçamento já aprovado", async () => {
    const orcamento = criarOrcamentoBase({ status: "APROVADO" }, [
      { modeloCobranca: "UNICO", precoNegociado: 100, quantidade: 1 },
    ]);
    const { tx } = criarTxFake(orcamento);

    await expect(aprovarOrcamento(tx as any, { orcamentoId: "orc-1" })).rejects.toThrow(ErroNegocio);
  });

  it("rejeita orçamento sem forma de pagamento", async () => {
    const orcamento = criarOrcamentoBase({ formaPagamento: null }, [
      { modeloCobranca: "UNICO", precoNegociado: 100, quantidade: 1 },
    ]);
    const { tx } = criarTxFake(orcamento);

    await expect(aprovarOrcamento(tx as any, { orcamentoId: "orc-1" })).rejects.toThrow(/forma de pagamento/);
  });

  it("rejeita orçamento sem itens", async () => {
    const orcamento = criarOrcamentoBase({}, []);
    const { tx } = criarTxFake(orcamento);

    await expect(aprovarOrcamento(tx as any, { orcamentoId: "orc-1" })).rejects.toThrow(/sem itens/);
  });
});
