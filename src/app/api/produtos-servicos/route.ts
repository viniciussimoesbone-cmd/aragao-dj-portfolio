import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lerCorpoJson, responderErro } from "@/lib/http";
import type { ModeloCobranca } from "@/lib/enums";
import { criarProdutoServico, listarProdutosServicos } from "@/lib/services/produtosServicos";

export async function GET(request: NextRequest) {
  try {
    const ativoParam = request.nextUrl.searchParams.get("ativo");
    const filtro = ativoParam !== null ? { ativo: ativoParam === "true" } : undefined;
    const produtosServicos = await listarProdutosServicos(prisma, filtro);
    return NextResponse.json({ produtosServicos });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao listar produtos/serviços.");
  }
}

export async function POST(request: NextRequest) {
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const produtoServico = await criarProdutoServico(prisma, {
      nome: String(corpo.body.nome ?? ""),
      categoria: String(corpo.body.categoria ?? ""),
      precoBase: Number(corpo.body.precoBase),
      modeloCobranca: corpo.body.modeloCobranca as ModeloCobranca,
    });
    return NextResponse.json(produtoServico, { status: 201 });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao criar produto/serviço.");
  }
}
