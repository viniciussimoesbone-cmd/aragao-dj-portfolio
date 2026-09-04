import { describe, expect, it, vi } from "vitest";
import { confirmarPagamentoParcela } from "../parcelas";
import { ErroNegocio } from "../erros";

function criarTxFake(options: {
  parcela: Record<string, any>;
  contrato: Record<string, any>;
  outrasParcelas?: Record<string, any>[];
  projeto?: Record<string, any> | null;
}) {
  const { parcela, contrato, outrasParcelas = [], projeto = null } = options;

  const parcelaCompleta = {
    ...parcela,
    contrato: { ...contrato, parcelas: [parcela, ...outrasParcelas], projeto },
  };

  const parcelasCriadas: any[] = [];
  const atualizacoesContrato: any[] = [];
  const atualizacoesProjeto: any[] = [];

  const tx = {
    parcela: {
      findUnique: vi.fn().mockResolvedValue(parcelaCompleta),
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        ...parcela,
        ...data,
      })),
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        const nova = { id: `parcela-nova-${parcelasCriadas.length + 1}`, ...data };
        parcelasCriadas.push(nova);
        return nova;
      }),
    },
    contrato: {
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        atualizacoesContrato.push(data);
        return { ...contrato, ...data };
      }),
    },
    projeto: {
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        atualizacoesProjeto.push(data);
        return { ...projeto, ...data };
      }),
    },
  };

  return { tx, parcelasCriadas, atualizacoesContrato, atualizacoesProjeto };
}

describe("confirmarPagamentoParcela", () => {
  it("libera o projeto e não gera próxima parcela ao pagar uma parcela UNICO", async () => {
    const contrato = { id: "ctr-1", diaVencimento: 10, statusAdministrativo: "ATIVO", dataUltimaParcelaDevida: null };
    const parcela = {
      id: "parc-1",
      tipo: "UNICO",
      valorOriginal: 1000,
      dataVencimento: new Date("2026-09-10T00:00:00.000Z"),
      dataPagamento: null,
    };
    const projeto = { id: "proj-1", status: "AGUARDANDO_PAGAMENTO" };

    const { tx, parcelasCriadas, atualizacoesProjeto } = criarTxFake({ parcela, contrato, projeto });

    const resultado = await confirmarPagamentoParcela(tx as any, {
      parcelaId: "parc-1",
      dataPagamento: new Date("2026-09-12T00:00:00.000Z"),
    });

    expect(resultado.parcela.status).toBe("PAGO");
    expect(atualizacoesProjeto[0].status).toBe("EM_EXECUCAO");
    expect(parcelasCriadas).toHaveLength(0);
  });

  it("gera a próxima mensalidade no mesmo dia do mês seguinte, com o mesmo valor", async () => {
    const contrato = { id: "ctr-1", diaVencimento: 10, statusAdministrativo: "ATIVO", dataUltimaParcelaDevida: null };
    const parcela = {
      id: "parc-1",
      tipo: "MENSALIDADE",
      valorOriginal: 500,
      dataVencimento: new Date("2026-09-10T00:00:00.000Z"),
      dataPagamento: null,
    };

    const { tx, parcelasCriadas } = criarTxFake({ parcela, contrato });

    await confirmarPagamentoParcela(tx as any, {
      parcelaId: "parc-1",
      dataPagamento: new Date("2026-09-11T00:00:00.000Z"),
    });

    expect(parcelasCriadas).toHaveLength(1);
    expect(parcelasCriadas[0].tipo).toBe("MENSALIDADE");
    expect(parcelasCriadas[0].competencia).toBe("2026-10");
    expect(parcelasCriadas[0].valorOriginal).toBe(500);
  });

  it("encerra o contrato em vez de gerar próxima parcela quando esta era a última devida (cancelamento)", async () => {
    const contrato = {
      id: "ctr-1",
      diaVencimento: 10,
      statusAdministrativo: "ATIVO",
      dataUltimaParcelaDevida: new Date("2026-09-10T00:00:00.000Z"),
    };
    const parcela = {
      id: "parc-1",
      tipo: "MENSALIDADE",
      valorOriginal: 500,
      dataVencimento: new Date("2026-09-10T00:00:00.000Z"),
      dataPagamento: null,
    };

    const { tx, parcelasCriadas, atualizacoesContrato } = criarTxFake({ parcela, contrato });

    await confirmarPagamentoParcela(tx as any, { parcelaId: "parc-1" });

    expect(parcelasCriadas).toHaveLength(0);
    expect(atualizacoesContrato.some((d) => d.statusAdministrativo === "ENCERRADO")).toBe(true);
  });

  it("reativa contrato suspenso quando não há mais parcelas em atraso crítico", async () => {
    const contrato = {
      id: "ctr-1",
      diaVencimento: 10,
      statusAdministrativo: "SUSPENSO",
      dataUltimaParcelaDevida: null,
    };
    const parcela = {
      id: "parc-1",
      tipo: "MENSALIDADE",
      valorOriginal: 500,
      dataVencimento: new Date("2026-08-01T00:00:00.000Z"),
      dataPagamento: null,
    };

    const { tx, atualizacoesContrato } = criarTxFake({ parcela, contrato });

    await confirmarPagamentoParcela(tx as any, {
      parcelaId: "parc-1",
      dataPagamento: new Date("2026-08-15T00:00:00.000Z"),
    });

    expect(atualizacoesContrato.some((d) => d.statusAdministrativo === "ATIVO")).toBe(true);
  });

  it("mantém contrato suspenso se ainda houver outra parcela em atraso crítico", async () => {
    const contrato = {
      id: "ctr-1",
      diaVencimento: 10,
      statusAdministrativo: "SUSPENSO",
      dataUltimaParcelaDevida: null,
    };
    const parcela = {
      id: "parc-1",
      tipo: "MENSALIDADE",
      valorOriginal: 500,
      dataVencimento: new Date("2026-08-01T00:00:00.000Z"),
      dataPagamento: null,
    };
    const outraParcelaAtrasada = {
      id: "parc-2",
      tipo: "MENSALIDADE",
      valorOriginal: 500,
      dataVencimento: new Date("2026-07-01T00:00:00.000Z"),
      dataPagamento: null,
    };

    const { tx, atualizacoesContrato } = criarTxFake({
      parcela,
      contrato,
      outrasParcelas: [outraParcelaAtrasada],
    });

    await confirmarPagamentoParcela(tx as any, {
      parcelaId: "parc-1",
      dataPagamento: new Date("2026-08-15T00:00:00.000Z"),
    });

    expect(atualizacoesContrato.some((d) => d.statusAdministrativo === "ATIVO")).toBe(false);
  });

  it("rejeita pagamento de parcela já paga", async () => {
    const contrato = { id: "ctr-1", diaVencimento: 10, statusAdministrativo: "ATIVO", dataUltimaParcelaDevida: null };
    const parcela = {
      id: "parc-1",
      tipo: "UNICO",
      valorOriginal: 100,
      dataVencimento: new Date("2026-09-01T00:00:00.000Z"),
      dataPagamento: new Date("2026-09-01T00:00:00.000Z"),
    };
    const { tx } = criarTxFake({ parcela, contrato });

    await expect(confirmarPagamentoParcela(tx as any, { parcelaId: "parc-1" })).rejects.toThrow(ErroNegocio);
  });

  it("rejeita parcela não encontrada", async () => {
    const tx = { parcela: { findUnique: vi.fn().mockResolvedValue(null) } };
    await expect(confirmarPagamentoParcela(tx as any, { parcelaId: "inexistente" })).rejects.toThrow(ErroNegocio);
  });
});
