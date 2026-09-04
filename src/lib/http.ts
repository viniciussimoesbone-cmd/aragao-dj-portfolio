import { NextResponse, type NextRequest } from "next/server";
import { ErroNegocio } from "./services/erros";

/** Faz parse defensivo do corpo JSON da requisição. Corpo vazio vira objeto vazio. */
export async function lerCorpoJson(
  request: NextRequest
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; resposta: NextResponse }> {
  try {
    const texto = await request.text();
    return { ok: true, body: texto ? JSON.parse(texto) : {} };
  } catch {
    return {
      ok: false,
      resposta: NextResponse.json({ erro: "Corpo da requisição inválido (JSON malformado)." }, { status: 400 }),
    };
  }
}

/** Traduz ErroNegocio para a resposta HTTP correspondente; qualquer outro erro vira 500. */
export function responderErro(erro: unknown, mensagemPadrao: string): NextResponse {
  if (erro instanceof ErroNegocio) {
    return NextResponse.json({ erro: erro.message }, { status: erro.status });
  }
  console.error(erro);
  return NextResponse.json({ erro: mensagemPadrao }, { status: 500 });
}
