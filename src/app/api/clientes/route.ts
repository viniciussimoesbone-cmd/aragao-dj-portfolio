import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lerCorpoJson, responderErro } from "@/lib/http";
import { criarCliente, listarClientes } from "@/lib/services/clientes";

export async function GET() {
  try {
    const clientes = await listarClientes(prisma);
    return NextResponse.json({ clientes });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao listar clientes.");
  }
}

export async function POST(request: NextRequest) {
  const corpo = await lerCorpoJson(request);
  if (!corpo.ok) return corpo.resposta;

  try {
    const cliente = await criarCliente(prisma, {
      nome: String(corpo.body.nome ?? ""),
      contato: corpo.body.contato != null ? String(corpo.body.contato) : null,
      whatsapp: corpo.body.whatsapp != null ? String(corpo.body.whatsapp) : null,
      empresa: corpo.body.empresa != null ? String(corpo.body.empresa) : null,
    });
    return NextResponse.json(cliente, { status: 201 });
  } catch (erro) {
    return responderErro(erro, "Erro interno ao criar cliente.");
  }
}
