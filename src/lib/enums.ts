/** Listas fechadas usadas para validar entrada nas rotas de API. */

export const FORMAS_PAGAMENTO = ["PIX", "BOLETO", "CARTAO", "TRANSFERENCIA"] as const;
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

export const MODELOS_COBRANCA = ["UNICO", "MENSAL", "IMPLANTACAO_MAIS_MENSAL"] as const;
export type ModeloCobranca = (typeof MODELOS_COBRANCA)[number];

/** Status que podem ser definidos manualmente via PATCH. APROVADO só acontece via POST /aprovar. */
export const STATUS_ORCAMENTO_EDITAVEIS = ["RASCUNHO", "ENVIADO", "REJEITADO"] as const;
export type StatusOrcamentoEditavel = (typeof STATUS_ORCAMENTO_EDITAVEIS)[number];
