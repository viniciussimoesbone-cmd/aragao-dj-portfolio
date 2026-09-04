import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lerCorpoJson, responderErro } from "@/lib/http";
import { confirmarPagamentoParcela } from "@/lib/services/parcelas";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const resultado = await prisma.$transaction((tx) =>
      confirmarPagamentoParcela(tx, {
        parcelaId: id,
        dataPagamento: corpo.body.dataPagamento ? new Date(String(corpo.body.dataPagamento)) : undefined,
        valorPago: corpo.body.valorPago !== undefined ? Number(corpo.body.valorPago) : undefined,
      })
    );
    return NextResponse.json(resultado, { status: 200 });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao confirmar pagamento.");
  }
}
