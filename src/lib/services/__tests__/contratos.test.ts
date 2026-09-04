import { describe, expect, it, vi } from "vitest";
import { solicitarCancelamentoContrato } from "../contratos";
import { ErroNegocio } from "../erros";

function criarTxFake(contrato: Record<string, any>) {
  const atualizacoes: any[] = [];
  const tx = {
    contrato: {
      findUnique: vi.fn().mockResolvedValue(contrato),
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        atualizacoes.push(data);
        return { ...contrato, ...data };
      }),
    },
  };
  return { tx, atualizacoes };
}

describe("solicitarCancelamentoContrato", () => {
  it("encerra imediatamente um contrato sem cobrança recorrente", async () => {
    const contrato = {
      id: "ctr-1",
      diaVencimento: 10,
      statusAdministrativo: "ATIVO",
      dataSolicitacaoCancelamento: null,
      parcelas: [
        {
          tipo: "UNICO",
          dataVencimento: new Date("2026-09-01T00:00:00.000Z"),
          dataPagamento: new Date("2026-09-01T00:00:00.000Z"),
        },
      ],
    };
    const { tx, atualizacoes } = criarTxFake(contrato);

    await solicitarCancelamentoContrato(tx as any, {
      contratoId: "ctr-1",
      dataSolicitacao: new Date("2026-09-15T00:00:00.000Z"),
    });

    expect(atualizacoes[0].statusAdministrativo).toBe("ENCERRADO");
    expect(atualizacoes[0].dataUltimaParcelaDevida).toBeNull();
  });

  it("com menos de 15 dias de aviso, mantém a parcela em aberto como última devida e NÃO encerra ainda", async () => {
    const contrato = {
      id: "ctr-1",
      diaVencimento: 10,
      statusAdministrativo: "ATIVO",
      dataSolicitacaoCancelamento: null,
      parcelas: [
        { tipo: "MENSALIDADE", dataVencimento: new Date("2026-10-10T00:00:00.000Z"), dataPagamento: null },
      ],
    };
    const { tx, atualizacoes } = criarTxFake(contrato);

    await solicitarCancelamentoContrato(tx as any, {
      contratoId: "ctr-1",
      dataSolicitacao: new Date("2026-09-28T00:00:00.000Z"), // 12 dias antes
    });

    const data = atualizacoes[0];
    expect(data.dataUltimaParcelaDevida.toISOString().slice(0, 10)).toBe("2026-10-10");
    expect(data.statusAdministrativo).toBeUndefined();
  });

  it("com 15+ dias de aviso, encerra imediatamente mesmo com parcela pendente", async () => {
    const contrato = {
      id: "ctr-1",
      diaVencimento: 10,
      statusAdministrativo: "ATIVO",
      dataSolicitacaoCancelamento: null,
      parcelas: [
        { tipo: "MENSALIDADE", dataVencimento: new Date("2026-10-10T00:00:00.000Z"), dataPagamento: null },
      ],
    };
    const { tx, atualizacoes } = criarTxFake(contrato);

    await solicitarCancelamentoContrato(tx as any, {
      contratoId: "ctr-1",
      dataSolicitacao: new Date("2026-09-01T00:00:00.000Z"), // 39 dias antes
    });

    expect(atualizacoes[0].statusAdministrativo).toBe("ENCERRADO");
    expect(atualizacoes[0].dataUltimaParcelaDevida).toBeNull();
  });

  it("rejeita contrato já encerrado", async () => {
    const contrato = {
      id: "ctr-1",
      diaVencimento: 10,
      statusAdministrativo: "ENCERRADO",
      dataSolicitacaoCancelamento: null,
      parcelas: [],
    };
    const { tx } = criarTxFake(contrato);

    await expect(solicitarCancelamentoContrato(tx as any, { contratoId: "ctr-1" })).rejects.toThrow(ErroNegocio);
  });

  it("rejeita solicitação duplicada de cancelamento", async () => {
    const contrato = {
      id: "ctr-1",
      diaVencimento: 10,
      statusAdministrativo: "ATIVO",
      dataSolicitacaoCancelamento: new Date("2026-09-01T00:00:00.000Z"),
      parcelas: [],
    };
    const { tx } = criarTxFake(contrato);

    await expect(solicitarCancelamentoContrato(tx as any, { contratoId: "ctr-1" })).rejects.toThrow(ErroNegocio);
  });

  it("rejeita contrato não encontrado", async () => {
    const tx = { contrato: { findUnique: vi.fn().mockResolvedValue(null) } };
    await expect(solicitarCancelamentoContrato(tx as any, { contratoId: "inexistente" })).rejects.toThrow(
      ErroNegocio
    );
  });
});
