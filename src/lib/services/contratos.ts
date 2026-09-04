import type { Prisma } from "@prisma/client";
import { calcularUltimaParcelaDevida } from "../financeiro";
import { ErroNegocio } from "./erros";

function proximoVencimentoMensal(dataVencimentoAtual: Date, diaVencimento: number): Date {
  const ano = dataVencimentoAtual.getUTCFullYear();
  const mesSeguinte = dataVencimentoAtual.getUTCMonth() + 1;
  const ultimoDiaMesSeguinte = new Date(Date.UTC(ano, mesSeguinte + 1, 0)).getUTCDate();
  return new Date(Date.UTC(ano, mesSeguinte, Math.min(diaVencimento, ultimoDiaMesSeguinte)));
}

export interface SolicitarCancelamentoInput {
  contratoId: string;
  dataSolicitacao?: Date;
}

/**
 * Registra o pedido de cancelamento e calcula (uma única vez, e congelado em
 * `dataUltimaParcelaDevida`) qual é a última parcela ainda devida, seguindo a
 * regra dos 15 dias de aviso mínimo. Contratos sem cobrança recorrente (só
 * implantação/parcela única) são encerrados imediatamente — não há parcela
 * mensal a cortar. O encerramento efetivo de um contrato mensal acontece
 * depois, quando essa última parcela devida for paga (ver confirmarPagamentoParcela).
 */
export async function solicitarCancelamentoContrato(tx: Prisma.TransactionClient, input: SolicitarCancelamentoInput) {
  const contrato = await tx.contrato.findUnique({
    where: { id: input.contratoId },
    include: { parcelas: true },
  });

  if (!contrato) {
    throw new ErroNegocio("Contrato não encontrado.", 404);
  }
  if (contrato.statusAdministrativo === "ENCERRADO") {
    throw new ErroNegocio("Este contrato já está encerrado.", 409);
  }
  if (contrato.dataSolicitacaoCancelamento) {
    throw new ErroNegocio("Cancelamento já foi solicitado para este contrato.", 409);
  }

  const dataSolicitacao = input.dataSolicitacao ?? new Date();

  const mensalidades = [...contrato.parcelas]
    .filter((p) => p.tipo === "MENSALIDADE")
    .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());

  if (mensalidades.length === 0) {
    return tx.contrato.update({
      where: { id: contrato.id },
      data: {
        dataSolicitacaoCancelamento: dataSolicitacao,
        dataUltimaParcelaDevida: null,
        statusAdministrativo: "ENCERRADO",
        dataEncerramento: dataSolicitacao,
      },
    });
  }

  const pendente = mensalidades.find((p) => !p.dataPagamento);
  const ultimaPaga = [...mensalidades].reverse().find((p) => p.dataPagamento);
  const proximaDataVencimento = pendente
    ? pendente.dataVencimento
    : ultimaPaga
    ? proximoVencimentoMensal(ultimaPaga.dataVencimento, contrato.diaVencimento)
    : null;

  if (!proximaDataVencimento) {
    throw new ErroNegocio("Não foi possível determinar a próxima parcela do contrato.", 500);
  }

  const ultimaDevida = calcularUltimaParcelaDevida({
    proximaDataVencimento,
    diaVencimento: contrato.diaVencimento,
    dataSolicitacaoCancelamento: dataSolicitacao,
  });

  if (!ultimaDevida) {
    // Aviso com antecedência suficiente: nem a parcela em aberto é mais devida.
    return tx.contrato.update({
      where: { id: contrato.id },
      data: {
        dataSolicitacaoCancelamento: dataSolicitacao,
        dataUltimaParcelaDevida: null,
        statusAdministrativo: "ENCERRADO",
        dataEncerramento: dataSolicitacao,
      },
    });
  }

  return tx.contrato.update({
    where: { id: contrato.id },
    data: {
      dataSolicitacaoCancelamento: dataSolicitacao,
      dataUltimaParcelaDevida: ultimaDevida,
    },
  });
}
