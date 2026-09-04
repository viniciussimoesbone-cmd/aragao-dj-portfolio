import type { Db } from "../db";
import { MODELOS_COBRANCA, type ModeloCobranca } from "../enums";
import { ErroNegocio } from "./erros";

function validarModeloCobranca(valor: unknown): asserts valor is ModeloCobranca {
  if (typeof valor !== "string" || !(MODELOS_COBRANCA as readonly string[]).includes(valor)) {
    throw new ErroNegocio(`modeloCobranca deve ser um de: ${MODELOS_COBRANCA.join(", ")}.`, 422);
  }
}

export interface CriarProdutoServicoInput {
  nome: string;
  categoria: string;
  precoBase: number;
  modeloCobranca: ModeloCobranca;
}

export async function criarProdutoServico(db: Db, input: CriarProdutoServicoInput) {
  if (!input.nome?.trim()) {
    throw new ErroNegocio("nome é obrigatório.", 422);
  }
  if (!input.categoria?.trim()) {
    throw new ErroNegocio("categoria é obrigatória.", 422);
  }
  if (typeof input.precoBase !== "number" || !Number.isFinite(input.precoBase) || input.precoBase <= 0) {
    throw new ErroNegocio("precoBase deve ser um número positivo.", 422);
  }
  validarModeloCobranca(input.modeloCobranca);

  return db.produtoServico.create({
    data: {
      nome: input.nome.trim(),
      categoria: input.categoria.trim(),
      precoBase: input.precoBase,
      modeloCobranca: input.modeloCobranca,
    },
  });
}

export async function listarProdutosServicos(db: Db, filtro?: { ativo?: boolean }) {
  return db.produtoServico.findMany({
    where: filtro?.ativo !== undefined ? { ativo: filtro.ativo } : undefined,
    orderBy: { criadoEm: "desc" },
  });
}

export async function obterProdutoServico(db: Db, id: string) {
  const produtoServico = await db.produtoServico.findUnique({ where: { id } });
  if (!produtoServico) {
    throw new ErroNegocio("Produto/serviço não encontrado.", 404);
  }
  return produtoServico;
}

export interface AtualizarProdutoServicoInput {
  nome?: string;
  categoria?: string;
  precoBase?: number;
  modeloCobranca?: ModeloCobranca;
  ativo?: boolean;
}

/**
 * Não há remoção de item de catálogo — só desativação (ativo=false), já que
 * itens antigos de orçamento guardam um retrato do produto/serviço e não
 * dependem dele continuar existindo/ativo.
 */
export async function atualizarProdutoServico(db: Db, id: string, input: AtualizarProdutoServicoInput) {
  await obterProdutoServico(db, id);

  if (input.nome !== undefined && !input.nome.trim()) {
    throw new ErroNegocio("nome não pode ser vazio.", 422);
  }
  if (input.categoria !== undefined && !input.categoria.trim()) {
    throw new ErroNegocio("categoria não pode ser vazia.", 422);
  }
  if (
    input.precoBase !== undefined &&
    (typeof input.precoBase !== "number" || !Number.isFinite(input.precoBase) || input.precoBase <= 0)
  ) {
    throw new ErroNegocio("precoBase deve ser um número positivo.", 422);
  }
  if (input.modeloCobranca !== undefined) {
    validarModeloCobranca(input.modeloCobranca);
  }

  return db.produtoServico.update({
    where: { id },
    data: {
      ...(input.nome !== undefined ? { nome: input.nome.trim() } : {}),
      ...(input.categoria !== undefined ? { categoria: input.categoria.trim() } : {}),
      ...(input.precoBase !== undefined ? { precoBase: input.precoBase } : {}),
      ...(input.modeloCobranca !== undefined ? { modeloCobranca: input.modeloCobranca } : {}),
      ...(input.ativo !== undefined ? { ativo: input.ativo } : {}),
    },
  });
}
