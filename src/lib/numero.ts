import type { Prisma } from "@prisma/client";

/**
 * Numeração legível do contrato (ex: CTR-2026-0001), sequencial por ano.
 * Simples e suficiente para o volume de uso interno da Fase 0 — não há
 * garantia de atomicidade sob concorrência (dois "aprovar" simultâneos
 * poderiam gerar o mesmo número); revisar se o volume crescer.
 */
export async function gerarNumeroContrato(tx: Prisma.TransactionClient, dataReferencia: Date): Promise<string> {
  const ano = dataReferencia.getUTCFullYear();
  const inicioAno = new Date(Date.UTC(ano, 0, 1));
  const inicioProximoAno = new Date(Date.UTC(ano + 1, 0, 1));

  const totalNoAno = await tx.contrato.count({
    where: { criadoEm: { gte: inicioAno, lt: inicioProximoAno } },
  });

  const sequencial = String(totalNoAno + 1).padStart(4, "0");
  return `CTR-${ano}-${sequencial}`;
}
