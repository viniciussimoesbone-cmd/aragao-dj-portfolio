import type { Prisma, PrismaClient } from "@prisma/client";

/** Aceita tanto o client normal (leitura/escrita simples) quanto um client dentro de uma transação. */
export type Db = PrismaClient | Prisma.TransactionClient;
