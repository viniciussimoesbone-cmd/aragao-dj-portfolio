import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aprovarOrcamento } from "@/lib/services/orcamentos";
import { ErroNegocio } from "@/lib/services/erros";

interface CorpoRequisicao {
  dataInicio?: string;
  diaVencimento?: number;
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
      aprovarOrcamento(tx, {
        orcamentoId: id,
        dataInicio: body.dataInicio ? new Date(body.dataInicio) : undefined,
        diaVencimento: body.diaVencimento,
      })
    );
    return NextResponse.json(resultado, { status: 201 });
  } catch (erro) {
    if (erro instanceof ErroNegocio) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error(erro);
    return NextResponse.json({ erro: "Erro interno ao aprovar orçamento." }, { status: 500 });
  }
}
