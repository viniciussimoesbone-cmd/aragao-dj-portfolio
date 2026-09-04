import type { Db } from "../db";
import { ErroNegocio } from "./erros";

export interface CriarClienteInput {
  nome: string;
  contato?: string | null;
  whatsapp?: string | null;
  empresa?: string | null;
}

export async function criarCliente(db: Db, input: CriarClienteInput) {
  if (!input.nome?.trim()) {
    throw new ErroNegocio("nome é obrigatório.", 422);
  }

  return db.cliente.create({
    data: {
      nome: input.nome.trim(),
      contato: input.contato ?? null,
      whatsapp: input.whatsapp ?? null,
      empresa: input.empresa ?? null,
    },
  });
}

export async function listarClientes(db: Db) {
  return db.cliente.findMany({ orderBy: { criadoEm: "desc" } });
}

export async function obterCliente(db: Db, id: string) {
  const cliente = await db.cliente.findUnique({ where: { id } });
  if (!cliente) {
    throw new ErroNegocio("Cliente não encontrado.", 404);
  }
  return cliente;
}

export interface AtualizarClienteInput {
  nome?: string;
  contato?: string | null;
  whatsapp?: string | null;
  empresa?: string | null;
}

export async function atualizarCliente(db: Db, id: string, input: AtualizarClienteInput) {
  await obterCliente(db, id);

  if (input.nome !== undefined && !input.nome.trim()) {
    throw new ErroNegocio("nome não pode ser vazio.", 422);
  }

  return db.cliente.update({
    where: { id },
    data: {
      ...(input.nome !== undefined ? { nome: input.nome.trim() } : {}),
      ...(input.contato !== undefined ? { contato: input.contato } : {}),
      ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
      ...(input.empresa !== undefined ? { empresa: input.empresa } : {}),
    },
  });
}

function ehErroDeChaveEstrangeira(erro: unknown): boolean {
  return typeof erro === "object" && erro !== null && "code" in erro && (erro as { code: unknown }).code === "P2003";
}

export async function removerCliente(db: Db, id: string) {
  await obterCliente(db, id);

  try {
    await db.cliente.delete({ where: { id } });
  } catch (erro) {
    if (ehErroDeChaveEstrangeira(erro)) {
      throw new ErroNegocio("Cliente possui orçamentos ou contratos vinculados e não pode ser removido.", 409);
    }
    throw erro;
  }
}
