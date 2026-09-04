import type { Prisma } from "@prisma/client";
import { calcularSituacaoFinanceira, determinarStatusSuspensao } from "../financeiro";
import { ErroNegocio } from "./erros";

function competenciaDe(data: Date): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

function proximoVencimentoMensal(dataVencimentoAtual: Date, diaVencimento: number): Date {
  const ano = dataVencimentoAtual.getUTCFullYear();
  const mesSeguinte = dataVencimentoAtual.getUTCMonth() + 1;
  const ultimoDiaMesSeguinte = new Date(Date.UTC(ano, mesSeguinte + 1, 0)).getUTCDate();
  return new Date(Date.UTC(ano, mesSeguinte, Math.min(diaVencimento, ultimoDiaMesSeguinte)));
}

export interface ConfirmarPagamentoInput {
  parcelaId: string;
  dataPagamento?: Date;
  valorPago?: number;
}

/**
 * Confirma o pagamento de uma parcela. A partir daí:
 * - reavalia se o contrato deve sair de SUSPENSO (sem mais atraso crítico em aberto);
 * - libera o projeto para EM_EXECUCAO na primeira confirmação de pagamento;
 * - se a parcela paga era do tipo MENSALIDADE, gera a próxima mensalidade —
 *   a menos que esta já fosse a última devida (cancelamento processado), caso
 *   em que o contrato é encerrado em vez de gerar uma nova cobrança.
 */
export async function confirmarPagamentoParcela(tx: Prisma.TransactionClient, input: ConfirmarPagamentoInput) {
  const parcela = await tx.parcela.findUnique({
    where: { id: input.parcelaId },
    include: { contrato: { include: { parcelas: true, projeto: true } } },
  });

  if (!parcela) {
    throw new ErroNegocio("Parcela não encontrada.", 404);
  }
  if (parcela.dataPagamento) {
    throw new ErroNegocio("Esta parcela já está paga.", 409);
  }
  if (input.valorPago !== undefined && input.valorPago <= 0) {
    throw new ErroNegocio("valorPago deve ser positivo.", 422);
  }

  const dataPagamento = input.dataPagamento ?? new Date();
  const situacao = calcularSituacaoFinanceira(
    { valorOriginal: Number(parcela.valorOriginal), dataVencimento: parcela.dataVencimento },
    dataPagamento
  );
  const valorPago = input.valorPago ?? situacao.valorAtualizado;

  const parcelaPaga = await tx.parcela.update({
    where: { id: parcela.id },
    data: { dataPagamento, valorPago, status: "PAGO" },
  });

  const contrato = parcela.contrato;

  if (contrato.statusAdministrativo !== "ENCERRADO") {
    const parcelasEmAberto = contrato.parcelas
      .filter((p) => p.id !== parcela.id && !p.dataPagamento)
      .map((p) => ({ valorOriginal: Number(p.valorOriginal), dataVencimento: p.dataVencimento }));
    const novoStatusSuspensao = determinarStatusSuspensao(parcelasEmAberto, dataPagamento);
    if (novoStatusSuspensao !== contrato.statusAdministrativo) {
      await tx.contrato.update({
        where: { id: contrato.id },
        data: { statusAdministrativo: novoStatusSuspensao },
      });
    }
  }

  if (contrato.projeto && contrato.projeto.status === "AGUARDANDO_PAGAMENTO") {
    await tx.projeto.update({
      where: { id: contrato.projeto.id },
      data: { status: "EM_EXECUCAO", dataLiberacao: dataPagamento },
    });
  }

  let proximaParcela = null;

  if (parcela.tipo === "MENSALIDADE" && contrato.statusAdministrativo !== "ENCERRADO") {
    const eraUltimaDevida =
      contrato.dataUltimaParcelaDevida != null &&
      parcela.dataVencimento.getTime() >= contrato.dataUltimaParcelaDevida.getTime();

    if (eraUltimaDevida) {
      await tx.contrato.update({
        where: { id: contrato.id },
        data: { statusAdministrativo: "ENCERRADO", dataEncerramento: dataPagamento },
      });
    } else {
      const dataVencimento = proximoVencimentoMensal(parcela.dataVencimento, contrato.diaVencimento);
      proximaParcela = await tx.parcela.create({
        data: {
          contratoId: contrato.id,
          tipo: "MENSALIDADE",
          valorOriginal: parcela.valorOriginal,
          dataVencimento,
          competencia: competenciaDe(dataVencimento),
        },
      });
    }
  }

  return { parcela: parcelaPaga, proximaParcela };
}
