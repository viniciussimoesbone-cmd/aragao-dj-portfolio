import type { Db } from "./db";

/**
 * Numeração legível (ex: CTR-2026-0001 / ORC-2026-0001), sequencial por ano.
 * Simples e suficiente para o volume de uso interno da Fase 0 — não há
 * garantia de atomicidade sob concorrência (duas criações simultâneas
 * poderiam gerar o mesmo número); revisar se o volume crescer.
 */
async function gerarNumeroSequencialAno(db: Db, prefixo: string, ano: number, contar: () => Promise<number>) {
  const total = await contar();
  const sequencial = String(total + 1).padStart(4, "0");
  return `${prefixo}-${ano}-${sequencial}`;
}

export async function gerarNumeroContrato(db: Db, dataReferencia: Date): Promise<string> {
  const ano = dataReferencia.getUTCFullYear();
  const inicioAno = new Date(Date.UTC(ano, 0, 1));
  const inicioProximoAno = new Date(Date.UTC(ano + 1, 0, 1));
  return gerarNumeroSequencialAno(db, "CTR", ano, () =>
    db.contrato.count({ where: { criadoEm: { gte: inicioAno, lt: inicioProximoAno } } })
  );
}

export async function gerarNumeroOrcamento(db: Db, dataReferencia: Date): Promise<string> {
  const ano = dataReferencia.getUTCFullYear();
  const inicioAno = new Date(Date.UTC(ano, 0, 1));
  const inicioProximoAno = new Date(Date.UTC(ano + 1, 0, 1));
  return gerarNumeroSequencialAno(db, "ORC", ano, () =>
    db.orcamento.count({ where: { criadoEm: { gte: inicioAno, lt: inicioProximoAno } } })
  );
}
