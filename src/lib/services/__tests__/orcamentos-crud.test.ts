import { describe, expect, it, vi } from "vitest";
import { atualizarOrcamento, criarOrcamento } from "../orcamentos";
import { ErroNegocio } from "../erros";

function criarProdutoServicoFake(overrides: Partial<Record<string, any>> = {}) {
  return {
    id: "prod-1",
    nome: "Gestão de tráfego",
    categoria: "Tráfego pago",
    precoBase: 800,
    modeloCobranca: "MENSAL",
    ativo: true,
    ...overrides,
  };
}

function criarDbFake(options: {
  cliente?: Record<string, any> | null;
  produtosServicos?: Record<string, Record<string, any>>;
}) {
  const { cliente = { id: "cli-1", nome: "Ana" }, produtosServicos = {} } = options;

  const tx = {
    cliente: { findUnique: vi.fn().mockResolvedValue(cliente) },
    produtoServico: {
      findUnique: vi.fn().mockImplementation(async ({ where }: any) => produtosServicos[where.id] ?? null),
    },
    orcamento: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: "orc-1", ...data, itens: data.itens.create })),
      findUnique: vi.fn(),
      update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: "orc-1", ...data })),
    },
    orcamentoItem: {
      deleteMany: vi.fn().mockResolvedValue(undefined),
      createMany: vi.fn().mockResolvedValue(undefined),
    },
  };
  return tx;
}

describe("criarOrcamento", () => {
  it("calcula o valorTotal somando os subtotais dos itens", async () => {
    const tx = criarDbFake({
      produtosServicos: {
        "prod-unico": criarProdutoServicoFake({ id: "prod-unico", modeloCobranca: "UNICO", precoBase: 1000 }),
        "prod-mensal": criarProdutoServicoFake({ id: "prod-mensal", modeloCobranca: "MENSAL", precoBase: 500 }),
      },
    });

    const orcamento = await criarOrcamento(tx as any, {
      clienteId: "cli-1",
      itens: [{ produtoServicoId: "prod-unico" }, { produtoServicoId: "prod-mensal", quantidade: 2 }],
    });

    // 1000 (único) + 500*2 (mensal, quantidade 2) = 2000
    expect(orcamento.valorTotal).toBe(2000);
  });

  it("usa precoBase do catálogo quando precoNegociado não é informado", async () => {
    const tx = criarDbFake({
      produtosServicos: { "prod-1": criarProdutoServicoFake({ precoBase: 800 }) },
    });

    const orcamento = await criarOrcamento(tx as any, {
      clienteId: "cli-1",
      itens: [{ produtoServicoId: "prod-1" }],
    });

    expect(orcamento.valorTotal).toBe(800);
  });

  it("soma implantação + mensal no subtotal do item IMPLANTACAO_MAIS_MENSAL", async () => {
    const tx = criarDbFake({
      produtosServicos: {
        "prod-1": criarProdutoServicoFake({ modeloCobranca: "IMPLANTACAO_MAIS_MENSAL", precoBase: 300 }),
      },
    });

    const orcamento = await criarOrcamento(tx as any, {
      clienteId: "cli-1",
      itens: [{ produtoServicoId: "prod-1", precoNegociado: 300, valorImplantacao: 1500 }],
    });

    expect(orcamento.valorTotal).toBe(1800);
  });

  it("rejeita cliente inexistente", async () => {
    const tx = criarDbFake({ cliente: null, produtosServicos: {} });
    await expect(
      criarOrcamento(tx as any, { clienteId: "inexistente", itens: [{ produtoServicoId: "prod-1" }] })
    ).rejects.toThrow(ErroNegocio);
  });

  it("rejeita produto/serviço inexistente", async () => {
    const tx = criarDbFake({ produtosServicos: {} });
    await expect(
      criarOrcamento(tx as any, { clienteId: "cli-1", itens: [{ produtoServicoId: "inexistente" }] })
    ).rejects.toThrow(ErroNegocio);
  });

  it("rejeita produto/serviço inativo", async () => {
    const tx = criarDbFake({
      produtosServicos: { "prod-1": criarProdutoServicoFake({ ativo: false }) },
    });
    await expect(
      criarOrcamento(tx as any, { clienteId: "cli-1", itens: [{ produtoServicoId: "prod-1" }] })
    ).rejects.toThrow(/inativo/);
  });

  it("rejeita valorImplantacao em item que não é IMPLANTACAO_MAIS_MENSAL", async () => {
    const tx = criarDbFake({
      produtosServicos: { "prod-1": criarProdutoServicoFake({ modeloCobranca: "MENSAL" }) },
    });
    await expect(
      criarOrcamento(tx as any, {
        clienteId: "cli-1",
        itens: [{ produtoServicoId: "prod-1", valorImplantacao: 100 }],
      })
    ).rejects.toThrow(/valorImplantacao/);
  });

  it("rejeita orçamento sem itens", async () => {
    const tx = criarDbFake({});
    await expect(criarOrcamento(tx as any, { clienteId: "cli-1", itens: [] })).rejects.toThrow(/pelo menos um item/);
  });
});

describe("atualizarOrcamento", () => {
  it("rejeita edição de orçamento já aprovado", async () => {
    const tx = criarDbFake({});
    tx.orcamento.findUnique = vi.fn().mockResolvedValue({ id: "orc-1", status: "APROVADO" });

    await expect(atualizarOrcamento(tx as any, "orc-1", { observacoes: "novo texto" })).rejects.toThrow(ErroNegocio);
  });

  it("substitui os itens e recalcula o valorTotal", async () => {
    const tx = criarDbFake({
      produtosServicos: { "prod-1": criarProdutoServicoFake({ precoBase: 400 }) },
    });
    tx.orcamento.findUnique = vi.fn().mockResolvedValue({ id: "orc-1", status: "RASCUNHO" });

    await atualizarOrcamento(tx as any, "orc-1", {
      itens: [{ produtoServicoId: "prod-1", quantidade: 3 }],
    });

    expect(tx.orcamentoItem.deleteMany).toHaveBeenCalledWith({ where: { orcamentoId: "orc-1" } });
    expect(tx.orcamentoItem.createMany).toHaveBeenCalled();
    const chamada = tx.orcamento.update.mock.calls[0][0];
    expect(chamada.data.valorTotal).toBe(1200); // 400 * 3
  });
});
