import type { Prisma } from "@prisma/client";
import type { Db } from "../db";
import { FORMAS_PAGAMENTO, STATUS_ORCAMENTO_EDITAVEIS, type FormaPagamento, type StatusOrcamentoEditavel } from "../enums";
import { arredondar } from "../moeda";
import { gerarNumeroContrato, gerarNumeroOrcamento } from "../numero";
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

function validarFormaPagamento(valor: unknown): asserts valor is FormaPagamento {
  if (typeof valor !== "string" || !(FORMAS_PAGAMENTO as readonly string[]).includes(valor)) {
    throw new ErroNegocio(`formaPagamento deve ser um de: ${FORMAS_PAGAMENTO.join(", ")}.`, 422);
  }
}

export interface ItemOrcamentoInput {
  produtoServicoId: string;
  /** Se omitido, usa o precoBase atual do catálogo. */
  precoNegociado?: number;
  /** Só aplicável a itens de modelo IMPLANTACAO_MAIS_MENSAL. */
  valorImplantacao?: number;
  quantidade?: number;
}

/**
 * Valida os itens de entrada, busca o retrato atual de cada produto/serviço
 * no catálogo e monta os dados prontos para gravar em OrcamentoItem — com o
 * snapshot (nome, modelo, preço-base do momento) e o subtotal já calculado.
 */
async function construirItensOrcamento(db: Db, itensInput: ItemOrcamentoInput[]) {
  if (itensInput.length === 0) {
    throw new ErroNegocio("Orçamento precisa de pelo menos um item.", 422);
  }

  const itens = [];
  for (const itemInput of itensInput) {
    const quantidade = itemInput.quantidade ?? 1;
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      throw new ErroNegocio("quantidade deve ser um inteiro maior ou igual a 1.", 422);
    }

    const produtoServico = await db.produtoServico.findUnique({ where: { id: itemInput.produtoServicoId } });
    if (!produtoServico) {
      throw new ErroNegocio(`Produto/serviço ${itemInput.produtoServicoId} não encontrado.`, 404);
    }
    if (!produtoServico.ativo) {
      throw new ErroNegocio(`Produto/serviço "${produtoServico.nome}" está inativo.`, 422);
    }

    const precoNegociado = itemInput.precoNegociado ?? Number(produtoServico.precoBase);
    if (typeof precoNegociado !== "number" || !Number.isFinite(precoNegociado) || precoNegociado <= 0) {
      throw new ErroNegocio("precoNegociado deve ser um número positivo.", 422);
    }

    if (itemInput.valorImplantacao !== undefined && produtoServico.modeloCobranca !== "IMPLANTACAO_MAIS_MENSAL") {
      throw new ErroNegocio(
        `valorImplantacao só é aplicável a itens de modelo IMPLANTACAO_MAIS_MENSAL (item "${produtoServico.nome}").`,
        422
      );
    }
    const valorImplantacao =
      produtoServico.modeloCobranca === "IMPLANTACAO_MAIS_MENSAL" ? itemInput.valorImplantacao ?? 0 : undefined;

    const subtotal = arredondar((precoNegociado + (valorImplantacao ?? 0)) * quantidade);

    itens.push({
      produtoServicoId: produtoServico.id,
      nomeItem: produtoServico.nome,
      modeloCobranca: produtoServico.modeloCobranca,
      precoBaseNoMomento: produtoServico.precoBase,
      precoNegociado,
      valorImplantacao,
      quantidade,
      subtotal,
    });
  }

  return itens;
}

export interface CriarOrcamentoInput {
  clienteId: string;
  itens: ItemOrcamentoInput[];
  formaPagamento?: FormaPagamento;
  observacoes?: string;
}

/** Cria o orçamento com seus itens e calcula o valor total automaticamente (soma dos subtotais). */
export async function criarOrcamento(db: Db, input: CriarOrcamentoInput) {
  if (!input.clienteId) {
    throw new ErroNegocio("clienteId é obrigatório.", 422);
  }
  const cliente = await db.cliente.findUnique({ where: { id: input.clienteId } });
  if (!cliente) {
    throw new ErroNegocio("Cliente não encontrado.", 404);
  }
  if (input.formaPagamento !== undefined) {
    validarFormaPagamento(input.formaPagamento);
  }

  const itens = await construirItensOrcamento(db, input.itens ?? []);
  const valorTotal = arredondar(itens.reduce((total, item) => total + Number(item.subtotal), 0));
  const numero = await gerarNumeroOrcamento(db, new Date());

  return db.orcamento.create({
    data: {
      numero,
      clienteId: input.clienteId,
      formaPagamento: input.formaPagamento,
      observacoes: input.observacoes,
      valorTotal,
      itens: { create: itens },
    },
    include: { itens: true },
  });
}

export async function listarOrcamentos(db: Db, filtro?: { clienteId?: string; status?: string }) {
  const where: Prisma.OrcamentoWhereInput = {};
  if (filtro?.clienteId) {
    where.clienteId = filtro.clienteId;
  }
  if (filtro?.status) {
    where.status = filtro.status as Prisma.OrcamentoWhereInput["status"];
  }

  return db.orcamento.findMany({
    where,
    include: { itens: true },
    orderBy: { criadoEm: "desc" },
  });
}

export async function obterOrcamento(db: Db, id: string) {
  const orcamento = await db.orcamento.findUnique({
    where: { id },
    include: { itens: true, contrato: true },
  });
  if (!orcamento) {
    throw new ErroNegocio("Orçamento não encontrado.", 404);
  }
  return orcamento;
}

export interface AtualizarOrcamentoInput {
  formaPagamento?: FormaPagamento;
  observacoes?: string;
  status?: StatusOrcamentoEditavel;
  /** Quando informado, substitui a lista de itens por inteiro e recalcula o valorTotal. */
  itens?: ItemOrcamentoInput[];
}

/**
 * Atualiza campos do orçamento e, opcionalmente, substitui a lista de itens
 * (recalculando o valor total). Só permitido enquanto o orçamento não foi
 * aprovado — depois disso ele é imutável (ver aprovarOrcamento).
 */
export async function atualizarOrcamento(tx: Prisma.TransactionClient, id: string, input: AtualizarOrcamentoInput) {
  const orcamento = await tx.orcamento.findUnique({ where: { id } });
  if (!orcamento) {
    throw new ErroNegocio("Orçamento não encontrado.", 404);
  }
  if (orcamento.status === "APROVADO") {
    throw new ErroNegocio("Orçamento aprovado não pode mais ser editado.", 409);
  }
  if (input.formaPagamento !== undefined) {
    validarFormaPagamento(input.formaPagamento);
  }
  if (input.status !== undefined && !(STATUS_ORCAMENTO_EDITAVEIS as readonly string[]).includes(input.status)) {
    throw new ErroNegocio(`status deve ser um de: ${STATUS_ORCAMENTO_EDITAVEIS.join(", ")}.`, 422);
  }

  let valorTotal: number | undefined;
  if (input.itens !== undefined) {
    const novosItens = await construirItensOrcamento(tx, input.itens);
    await tx.orcamentoItem.deleteMany({ where: { orcamentoId: id } });
    await tx.orcamentoItem.createMany({
      data: novosItens.map((item) => ({ ...item, orcamentoId: id })),
    });
    valorTotal = arredondar(novosItens.reduce((total, item) => total + Number(item.subtotal), 0));
  }

  return tx.orcamento.update({
    where: { id },
    data: {
      ...(input.formaPagamento !== undefined ? { formaPagamento: input.formaPagamento } : {}),
      ...(input.observacoes !== undefined ? { observacoes: input.observacoes } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(valorTotal !== undefined ? { valorTotal } : {}),
    },
    include: { itens: true },
  });
}
