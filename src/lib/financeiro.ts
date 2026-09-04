/**
 * Fonte única das regras financeiras do contrato (multa, juros, suspensão
 * administrativa e cálculo de cancelamento). Nenhuma outra parte do sistema
 * deve reimplementar estas fórmulas — sempre importar e usar estas funções.
 */

import { arredondar } from "./moeda";

export const PERCENTUAL_MULTA = 0.1; // 10% sobre o valor original
export const PERCENTUAL_JUROS_DIARIO = 0.0033; // 0,33% ao dia
export const DIAS_PARA_SUSPENSAO_CONTRATO = 10;
export const DIAS_MINIMOS_AVISO_CANCELAMENTO = 15;

const UM_DIA_MS = 1000 * 60 * 60 * 24;

function paraDataUTC(data: Date): number {
  return Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
}

/** Diferença em dias inteiros entre duas datas (dataA - dataB), ignorando hora. */
function diasEntre(dataA: Date, dataB: Date): number {
  return Math.round((paraDataUTC(dataA) - paraDataUTC(dataB)) / UM_DIA_MS);
}

function adicionarDias(data: Date, dias: number): Date {
  return new Date(paraDataUTC(data) + dias * UM_DIA_MS);
}

export interface DadosParcela {
  valorOriginal: number;
  dataVencimento: Date;
  dataPagamento?: Date | null;
}

export type StatusParcelaCalculado = "PENDENTE" | "ATRASADO" | "PAGO";

export interface SituacaoFinanceiraParcela {
  status: StatusParcelaCalculado;
  diasAtraso: number;
  multa: number;
  juros: number;
  valorAtualizado: number;
}

/**
 * Calcula status, multa, juros e valor atualizado de UMA parcela.
 * Se a parcela já foi paga, usa a data de pagamento como referência (o
 * atraso fica congelado no que foi de fato cobrado). Caso contrário, usa
 * `dataReferencia` (padrão: hoje) — por isso o valor de uma parcela em
 * atraso muda a cada novo dia que passa sem pagamento.
 */
export function calcularSituacaoFinanceira(
  parcela: DadosParcela,
  dataReferencia: Date = new Date()
): SituacaoFinanceiraParcela {
  const referenciaEfetiva = parcela.dataPagamento ?? dataReferencia;
  const diasAtraso = Math.max(0, diasEntre(referenciaEfetiva, parcela.dataVencimento));

  if (diasAtraso === 0) {
    return {
      status: parcela.dataPagamento ? "PAGO" : "PENDENTE",
      diasAtraso: 0,
      multa: 0,
      juros: 0,
      valorAtualizado: arredondar(parcela.valorOriginal),
    };
  }

  const multa = arredondar(parcela.valorOriginal * PERCENTUAL_MULTA);
  const juros = arredondar(parcela.valorOriginal * PERCENTUAL_JUROS_DIARIO * diasAtraso);

  return {
    status: parcela.dataPagamento ? "PAGO" : "ATRASADO",
    diasAtraso,
    multa,
    juros,
    valorAtualizado: arredondar(parcela.valorOriginal + multa + juros),
  };
}

export type StatusSuspensao = "ATIVO" | "SUSPENSO";

/**
 * Deriva se o contrato deve estar SUSPENSO a partir das parcelas em aberto
 * (não pagas). Reusa `calcularSituacaoFinanceira` — nunca reimplementar a
 * regra dos 10 dias aqui. Não decide ENCERRADO: isso é acionado
 * separadamente pelo fluxo de cancelamento/conclusão.
 */
export function determinarStatusSuspensao(
  parcelasEmAberto: DadosParcela[],
  dataReferencia: Date = new Date()
): StatusSuspensao {
  const emAtrasoCritico = parcelasEmAberto.some((parcela) => {
    const situacao = calcularSituacaoFinanceira(parcela, dataReferencia);
    return situacao.status === "ATRASADO" && situacao.diasAtraso > DIAS_PARA_SUSPENSAO_CONTRATO;
  });
  return emAtrasoCritico ? "SUSPENSO" : "ATIVO";
}

/** Avança uma data de vencimento em um mês, mantendo o dia fixo do contrato (com clamp no fim do mês, ex: dia 31 em fevereiro). */
function proximoVencimentoMensal(dataVencimentoAtual: Date, diaVencimento: number): Date {
  const ano = dataVencimentoAtual.getUTCFullYear();
  const mesSeguinte = dataVencimentoAtual.getUTCMonth() + 1;
  const ultimoDiaMesSeguinte = new Date(Date.UTC(ano, mesSeguinte + 1, 0)).getUTCDate();
  const dia = Math.min(diaVencimento, ultimoDiaMesSeguinte);
  return new Date(Date.UTC(ano, mesSeguinte, dia));
}

export interface DadosCancelamento {
  /** Vencimento da próxima parcela na sequência (já existente e pendente, ou a que seria gerada em seguida). */
  proximaDataVencimento: Date;
  diaVencimento: number;
  dataSolicitacaoCancelamento: Date;
}

/**
 * Regra de cancelamento: o cliente precisa avisar com no mínimo 15 dias de
 * antecedência do vencimento de uma parcela para que ela deixe de ser
 * devida. Retorna a data de vencimento da ÚLTIMA parcela ainda devida
 * (a que deve continuar sendo cobrada normalmente), avançando mês a mês a
 * partir de `proximaDataVencimento`. Retorna `null` quando nem a próxima
 * parcela já é mais devida (aviso dado com bastante antecedência).
 */
export function calcularUltimaParcelaDevida(dados: DadosCancelamento): Date | null {
  const limite = adicionarDias(dados.dataSolicitacaoCancelamento, DIAS_MINIMOS_AVISO_CANCELAMENTO);

  let candidata = dados.proximaDataVencimento;
  let ultimaDevida: Date | null = null;

  // Teto de segurança (20 anos de mensalidades) para nunca laçar infinito.
  for (let i = 0; i < 240; i++) {
    if (diasEntre(candidata, limite) >= 0) break;
    ultimaDevida = candidata;
    candidata = proximoVencimentoMensal(candidata, dados.diaVencimento);
  }

  return ultimaDevida;
}
