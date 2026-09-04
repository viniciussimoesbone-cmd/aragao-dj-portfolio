import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FormaPagamento, StatusOrcamentoEditavel } from "@/lib/enums";
import { lerCorpoJson, responderErro } from "@/lib/http";
import { atualizarOrcamento, obterOrcamento, type ItemOrcamentoInput } from "@/lib/services/orcamentos";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const orcamento = await obterOrcamento(prisma, id);
    return NextResponse.json(orcamento);
  } catch (erro) {
    return responderErro(erro, "Erro interno ao buscar orçamento.");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const orcamento = await prisma.$transaction((tx) =>
      atualizarOrcamento(tx, id, {
        formaPagamento: corpo.body.formaPagamento as FormaPagamento | undefined,
        observacoes: corpo.body.observacoes !== undefined ? String(corpo.body.observacoes) : undefined,
        status: corpo.body.status as StatusOrcamentoEditavel | undefined,
        itens: corpo.body.itens !== undefined ? (corpo.body.itens as ItemOrcamentoInput[]) : undefined,
      })
    );
    return NextResponse.json(orcamento);
  } catch (erro) {
    return responderErro(erro, "Erro interno ao atualizar orçamento.");
  }
}
