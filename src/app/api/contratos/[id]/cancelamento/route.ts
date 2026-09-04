import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lerCorpoJson, responderErro } from "@/lib/http";
import { solicitarCancelamentoContrato } from "@/lib/services/contratos";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const contrato = await prisma.$transaction((tx) =>
      solicitarCancelamentoContrato(tx, {
        contratoId: id,
        dataSolicitacao: corpo.body.dataSolicitacao ? new Date(String(corpo.body.dataSolicitacao)) : undefined,
      })
    );
    return NextResponse.json({ contrato }, { status: 200 });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao processar cancelamento.");
  }
}
