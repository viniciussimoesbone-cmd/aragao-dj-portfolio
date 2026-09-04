import { describe, expect, it, vi } from "vitest";
import { atualizarProdutoServico, criarProdutoServico } from "../produtosServicos";
import { ErroNegocio } from "../erros";

function criarDbFake(produtoServico: Record<string, any> | null) {
  const tx = {
    produtoServico: {
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: "prod-1", ativo: true, ...data })),
      findUnique: vi.fn().mockResolvedValue(produtoServico),
      update: vi.fn().mockImplementation(async ({ data }: any) => ({ ...produtoServico, ...data })),
    },
  };
  return tx;
}

describe("criarProdutoServico", () => {
  it("cria com os campos válidos", async () => {
    const tx = criarDbFake(null);
    const produto = await criarProdutoServico(tx as any, {
      nome: "Gestão de tráfego",
      categoria: "Tráfego pago",
      precoBase: 800,
      modeloCobranca: "MENSAL",
    });
    expect(produto.nome).toBe("Gestão de tráfego");
    expect(produto.ativo).toBe(true);
  });

  it("rejeita precoBase não positivo", async () => {
    const tx = criarDbFake(null);
    await expect(
      criarProdutoServico(tx as any, { nome: "X", categoria: "Y", precoBase: 0, modeloCobranca: "UNICO" })
    ).rejects.toThrow(ErroNegocio);
  });

  it("rejeita modeloCobranca inválido", async () => {
    const tx = criarDbFake(null);
    await expect(
      criarProdutoServico(tx as any, {
        nome: "X",
        categoria: "Y",
        precoBase: 100,
        modeloCobranca: "ANUAL" as never,
      })
    ).rejects.toThrow(ErroNegocio);
  });
});

describe("atualizarProdutoServico", () => {
  it("permite desativar (soft delete)", async () => {
    const tx = criarDbFake({ id: "prod-1", nome: "X", categoria: "Y", precoBase: 100, ativo: true });
    const atualizado = await atualizarProdutoServico(tx as any, "prod-1", { ativo: false });
    expect(atualizado.ativo).toBe(false);
  });

  it("rejeita quando produto não existe", async () => {
    const tx = criarDbFake(null);
    await expect(atualizarProdutoServico(tx as any, "inexistente", { ativo: false })).rejects.toThrow(ErroNegocio);
  });
});
