import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmarPagamentoParcela } from "@/lib/services/parcelas";
import { ErroNegocio } from "@/lib/services/erros";

interface CorpoRequisicao {
  dataPagamento?: string;
  valorPago?: number;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: CorpoRequisicao = {};
  try {
    const texto = await request.text();
    body = texto ? JSON.parse(texto) : {};
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido (JSON malformado)." }, { status: 400 });
  }

  try {
    const resultado = await prisma.$transaction((tx) =>
      confirmarPagamentoParcela(tx, {
        parcelaId: id,
        dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : undefined,
        valorPago: body.valorPago,
      })
    );
    return NextResponse.json(resultado, { status: 200 });
  } catch (erro) {
    if (erro instanceof ErroNegocio) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error(erro);
    return NextResponse.json({ erro: "Erro interno ao confirmar pagamento." }, { status: 500 });
  }
}
