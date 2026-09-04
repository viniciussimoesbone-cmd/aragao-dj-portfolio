import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { solicitarCancelamentoContrato } from "@/lib/services/contratos";
import { ErroNegocio } from "@/lib/services/erros";

interface CorpoRequisicao {
  dataSolicitacao?: string;
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
    const contrato = await prisma.$transaction((tx) =>
      solicitarCancelamentoContrato(tx, {
        contratoId: id,
        dataSolicitacao: body.dataSolicitacao ? new Date(body.dataSolicitacao) : undefined,
      })
    );
    return NextResponse.json({ contrato }, { status: 200 });
  } catch (erro) {
    if (erro instanceof ErroNegocio) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error(erro);
    return NextResponse.json({ erro: "Erro interno ao processar cancelamento." }, { status: 500 });
  }
}
