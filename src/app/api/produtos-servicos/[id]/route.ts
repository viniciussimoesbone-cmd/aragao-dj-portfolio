import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ModeloCobranca } from "@/lib/enums";
import { lerCorpoJson, responderErro } from "@/lib/http";
import { atualizarProdutoServico, obterProdutoServico } from "@/lib/services/produtosServicos";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const produtoServico = await obterProdutoServico(prisma, id);
    return NextResponse.json(produtoServico);
  } catch (erro) {
    return responderErro(erro, "Erro interno ao buscar produto/serviço.");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const produtoServico = await atualizarProdutoServico(prisma, id, {
      nome: corpo.body.nome !== undefined ? String(corpo.body.nome) : undefined,
      categoria: corpo.body.categoria !== undefined ? String(corpo.body.categoria) : undefined,
      precoBase: corpo.body.precoBase !== undefined ? Number(corpo.body.precoBase) : undefined,
      modeloCobranca: corpo.body.modeloCobranca as ModeloCobranca | undefined,
      ativo: corpo.body.ativo !== undefined ? Boolean(corpo.body.ativo) : undefined,
    });
    return NextResponse.json(produtoServico);
  } catch (erro) {
    return responderErro(erro, "Erro interno ao atualizar produto/serviço.");
  }
}
