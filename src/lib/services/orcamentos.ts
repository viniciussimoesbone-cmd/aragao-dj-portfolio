import type { Prisma } from "@prisma/client";
import { arredondar } from "../moeda";
import { gerarNumeroContrato } from "../numero";
import { ErroNegocio } from "./erros";

function diaDoMes(data: Date): number {
  return data.getUTCDate();
}

function competenciaDe(data: Date): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

/** Primeira ocorrência de `diaVencimento` que cai em ou após `dataInicio`. */
function primeiroVencimentoMensal(dataInicio: Date, diaVencimento: number): Date {
  const ano = dataInicio.getUTCFullYear();
  const mes = dataInicio.getUTCMonth();
  const ultimoDiaMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const candidato = new Date(Date.UTC(ano, mes, Math.min(diaVencimento, ultimoDiaMes)));

  if (candidato.getTime() >= Date.UTC(ano, mes, dataInicio.getUTCDate())) {
    return candidato;
  }

  const mesSeguinte = mes + 1;
  const ultimoDiaMesSeguinte = new Date(Date.UTC(ano, mesSeguinte + 1, 0)).getUTCDate();
  return new Date(Date.UTC(ano, mesSeguinte, Math.min(diaVencimento, ultimoDiaMesSeguinte)));
}

export interface AprovarOrcamentoInput {
  orcamentoId: string;
  dataInicio?: Date;
  diaVencimento?: number;
}

/**
 * Aprova um orçamento e gera o contrato correspondente, herdando cliente,
 * valor e forma de pagamento. Também cria as parcelas iniciais a partir dos
 * itens (agrupados por modelo de cobrança) e o registro de Projeto
 * (AGUARDANDO_PAGAMENTO). O orçamento passa a ser tratado como imutável a
 * partir daqui.
 */
export async function aprovarOrcamento(tx: Prisma.TransactionClient, input: AprovarOrcamentoInput) {
  const orcamento = await tx.orcamento.findUnique({
    where: { id: input.orcamentoId },
    include: { itens: true },
  });

  if (!orcamento) {
    throw new ErroNegocio("Orçamento não encontrado.", 404);
  }
  if (orcamento.status === "APROVADO") {
    throw new ErroNegocio("Este orçamento já foi aprovado.", 409);
  }
  if (orcamento.status === "REJEITADO") {
    throw new ErroNegocio("Orçamento rejeitado não pode ser aprovado.", 409);
  }
  if (!orcamento.formaPagamento) {
    throw new ErroNegocio("Orçamento sem forma de pagamento definida.", 422);
  }
  if (orcamento.itens.length === 0) {
    throw new ErroNegocio("Orçamento sem itens não pode ser aprovado.", 422);
  }
  if (input.diaVencimento !== undefined && (input.diaVencimento < 1 || input.diaVencimento > 31)) {
    throw new ErroNegocio("diaVencimento deve estar entre 1 e 31.", 422);
  }

  const agora = new Date();
  const dataInicio = input.dataInicio ?? agora;
  const diaVencimento = input.diaVencimento ?? diaDoMes(dataInicio);

  await tx.orcamento.update({
    where: { id: orcamento.id },
    data: { status: "APROVADO", dataAprovacao: agora },
  });

  const numero = await gerarNumeroContrato(tx, dataInicio);

  const contrato = await tx.contrato.create({
    data: {
      numero,
      orcamentoId: orcamento.id,
      clienteId: orcamento.clienteId,
      valorTotal: orcamento.valorTotal,
      formaPagamento: orcamento.formaPagamento,
      dataInicio,
      diaVencimento,
      statusAdministrativo: "ATIVO",
    },
  });

  const projeto = await tx.projeto.create({
    data: { contratoId: contrato.id, status: "AGUARDANDO_PAGAMENTO" },
  });

  const itensUnico = orcamento.itens.filter((item) => item.modeloCobranca === "UNICO");
  const itensImplantacaoMaisMensal = orcamento.itens.filter(
    (item) => item.modeloCobranca === "IMPLANTACAO_MAIS_MENSAL"
  );
  const itensMensal = orcamento.itens.filter((item) => item.modeloCobranca === "MENSAL");

  const parcelas = [];

  const valorUnico = arredondar(
    itensUnico.reduce((total, item) => total + Number(item.precoNegociado) * item.quantidade, 0)
  );
  if (valorUnico > 0) {
    parcelas.push(
      await tx.parcela.create({
        data: {
          contratoId: contrato.id,
          tipo: "UNICO",
          valorOriginal: valorUnico,
          dataVencimento: dataInicio,
        },
      })
    );
  }

  const valorImplantacao = arredondar(
    itensImplantacaoMaisMensal.reduce(
      (total, item) => total + Number(item.valorImplantacao ?? 0) * item.quantidade,
      0
    )
  );
  if (valorImplantacao > 0) {
    parcelas.push(
      await tx.parcela.create({
        data: {
          contratoId: contrato.id,
          tipo: "IMPLANTACAO",
          valorOriginal: valorImplantacao,
          dataVencimento: dataInicio,
        },
      })
    );
  }

  const valorMensal = arredondar(
    [...itensMensal, ...itensImplantacaoMaisMensal].reduce(
      (total, item) => total + Number(item.precoNegociado) * item.quantidade,
      0
    )
  );
  if (valorMensal > 0) {
    const dataVencimento = primeiroVencimentoMensal(dataInicio, diaVencimento);
    parcelas.push(
      await tx.parcela.create({
        data: {
          contratoId: contrato.id,
          tipo: "MENSALIDADE",
          valorOriginal: valorMensal,
          dataVencimento,
          competencia: competenciaDe(dataVencimento),
        },
      })
    );
  }

  return { contrato, projeto, parcelas };
}
