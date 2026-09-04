import { describe, expect, it, vi } from "vitest";
import { atualizarCliente, criarCliente, obterCliente, removerCliente } from "../clientes";
import { ErroNegocio } from "../erros";

function criarDbFake(cliente: Record<string, any> | null) {
  const tx = {
    cliente: {
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: "cli-1", ...data })),
      findUnique: vi.fn().mockResolvedValue(cliente),
      update: vi.fn().mockImplementation(async ({ data }: any) => ({ ...cliente, ...data })),
      delete: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue(cliente ? [cliente] : []),
    },
  };
  return tx;
}

describe("criarCliente", () => {
  it("cria com os campos informados", async () => {
    const tx = criarDbFake(null);
    const cliente = await criarCliente(tx as any, { nome: "Ana", whatsapp: "11999999999" });
    expect(cliente.nome).toBe("Ana");
    expect(cliente.whatsapp).toBe("11999999999");
  });

  it("rejeita nome vazio", async () => {
    const tx = criarDbFake(null);
    await expect(criarCliente(tx as any, { nome: "   " })).rejects.toThrow(ErroNegocio);
  });
});

describe("obterCliente", () => {
  it("lança 404 quando não encontrado", async () => {
    const tx = criarDbFake(null);
    await expect(obterCliente(tx as any, "inexistente")).rejects.toThrow(ErroNegocio);
  });
});

describe("atualizarCliente", () => {
  it("atualiza apenas os campos informados", async () => {
    const tx = criarDbFake({ id: "cli-1", nome: "Ana", empresa: null });
    const atualizado = await atualizarCliente(tx as any, "cli-1", { empresa: "Acme" });
    expect(atualizado.empresa).toBe("Acme");
    expect(atualizado.nome).toBe("Ana");
  });

  it("rejeita nome vazio", async () => {
    const tx = criarDbFake({ id: "cli-1", nome: "Ana" });
    await expect(atualizarCliente(tx as any, "cli-1", { nome: "  " })).rejects.toThrow(ErroNegocio);
  });
});

describe("removerCliente", () => {
  it("traduz violação de chave estrangeira em erro 409", async () => {
    const tx = criarDbFake({ id: "cli-1", nome: "Ana" });
    tx.cliente.delete = vi.fn().mockRejectedValue({ code: "P2003" });

    await expect(removerCliente(tx as any, "cli-1")).rejects.toMatchObject({ status: 409 });
  });
});
