import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lerCorpoJson, responderErro } from "@/lib/http";
import { atualizarCliente, obterCliente, removerCliente } from "@/lib/services/clientes";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const cliente = await obterCliente(prisma, id);
    return NextResponse.json(cliente);
  } catch (erro) {
    return responderErro(erro, "Erro interno ao buscar cliente.");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const cliente = await atualizarCliente(prisma, id, {
      nome: corpo.body.nome !== undefined ? String(corpo.body.nome) : undefined,
      contato:
        corpo.body.contato !== undefined ? (corpo.body.contato === null ? null : String(corpo.body.contato)) : undefined,
      whatsapp:
        corpo.body.whatsapp !== undefined
          ? corpo.body.whatsapp === null
            ? null
            : String(corpo.body.whatsapp)
          : undefined,
      empresa:
        corpo.body.empresa !== undefined ? (corpo.body.empresa === null ? null : String(corpo.body.empresa)) : undefined,
    });
    return NextResponse.json(cliente);
  } catch (erro) {
    return responderErro(erro, "Erro interno ao atualizar cliente.");
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await removerCliente(prisma, id);
    return new NextResponse(null, { status: 204 });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao remover cliente.");
  }
}
