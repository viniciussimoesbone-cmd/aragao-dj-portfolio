import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FormaPagamento } from "@/lib/enums";
import { lerCorpoJson, responderErro } from "@/lib/http";
import { criarOrcamento, listarOrcamentos, type ItemOrcamentoInput } from "@/lib/services/orcamentos";

export async function GET(request: NextRequest) {
  try {
    const clienteId = request.nextUrl.searchParams.get("clienteId") ?? undefined;
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const orcamentos = await listarOrcamentos(prisma, { clienteId, status });
    return NextResponse.json({ orcamentos });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao listar orçamentos.");
  }
}

export async function POST(request: NextRequest) {
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const orcamento = await criarOrcamento(prisma, {
      clienteId: String(corpo.body.clienteId ?? ""),
      itens: (Array.isArray(corpo.body.itens) ? corpo.body.itens : []) as ItemOrcamentoInput[],
      formaPagamento: corpo.body.formaPagamento as FormaPagamento | undefined,
      observacoes: corpo.body.observacoes !== undefined ? String(corpo.body.observacoes) : undefined,
    });
    return NextResponse.json(orcamento, { status: 201 });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao criar orçamento.");
  }
}
