import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lerCorpoJson, responderErro } from "@/lib/http";
import { aprovarOrcamento } from "@/lib/services/orcamentos";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const resultado = await prisma.$transaction((tx) =>
      aprovarOrcamento(tx, {
        orcamentoId: id,
        dataInicio: corpo.body.dataInicio ? new Date(String(corpo.body.dataInicio)) : undefined,
        diaVencimento: corpo.body.diaVencimento !== undefined ? Number(corpo.body.diaVencimento) : undefined,
      })
    );
    return NextResponse.json(resultado, { status: 201 });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao aprovar orçamento.");
  }
}
