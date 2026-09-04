import { describe, expect, it } from "vitest";
import {
  calcularSituacaoFinanceira,
  calcularUltimaParcelaDevida,
  determinarStatusSuspensao,
} from "../financeiro";

const data = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("calcularSituacaoFinanceira", () => {
  it("fica PENDENTE quando ainda não venceu", () => {
    const situacao = calcularSituacaoFinanceira(
      { valorOriginal: 1000, dataVencimento: data("2026-09-20") },
      data("2026-09-10")
    );
    expect(situacao.status).toBe("PENDENTE");
    expect(situacao.multa).toBe(0);
    expect(situacao.juros).toBe(0);
    expect(situacao.valorAtualizado).toBe(1000);
  });

  it("fica PENDENTE no próprio dia do vencimento", () => {
    const situacao = calcularSituacaoFinanceira(
      { valorOriginal: 1000, dataVencimento: data("2026-09-20") },
      data("2026-09-20")
    );
    expect(situacao.status).toBe("PENDENTE");
  });

  it("aplica multa de 10% + juros de 0,33% ao dia quando atrasada", () => {
    const situacao = calcularSituacaoFinanceira(
      { valorOriginal: 1000, dataVencimento: data("2026-09-01") },
      data("2026-09-06") // 5 dias de atraso
    );
    expect(situacao.status).toBe("ATRASADO");
    expect(situacao.diasAtraso).toBe(5);
    expect(situacao.multa).toBe(100); // 10% de 1000
    expect(situacao.juros).toBe(16.5); // 0,33% * 5 * 1000
    expect(situacao.valorAtualizado).toBe(1116.5);
  });

  it("congela o cálculo na data de pagamento quando a parcela já foi paga", () => {
    const situacao = calcularSituacaoFinanceira(
      {
        valorOriginal: 1000,
        dataVencimento: data("2026-09-01"),
        dataPagamento: data("2026-09-04"),
      },
      data("2026-10-30") // referência bem depois, não deve importar
    );
    expect(situacao.status).toBe("PAGO");
    expect(situacao.diasAtraso).toBe(3);
  });
});

describe("determinarStatusSuspensao", () => {
  it("mantém ATIVO com exatamente 10 dias de atraso", () => {
    const status = determinarStatusSuspensao(
      [{ valorOriginal: 500, dataVencimento: data("2026-09-01") }],
      data("2026-09-11")
    );
    expect(status).toBe("ATIVO");
  });

  it("suspende com mais de 10 dias de atraso", () => {
    const status = determinarStatusSuspensao(
      [{ valorOriginal: 500, dataVencimento: data("2026-09-01") }],
      data("2026-09-12")
    );
    expect(status).toBe("SUSPENSO");
  });

  it("ignora parcelas já pagas", () => {
    const status = determinarStatusSuspensao(
      [
        {
          valorOriginal: 500,
          dataVencimento: data("2026-09-01"),
          dataPagamento: data("2026-09-20"),
        },
      ],
      data("2026-09-25")
    );
    expect(status).toBe("ATIVO");
  });
});

describe("calcularUltimaParcelaDevida", () => {
  it("quando o aviso tem exatamente 15 dias de antecedência, a próxima parcela NÃO é devida", () => {
    const ultima = calcularUltimaParcelaDevida({
      proximaDataVencimento: data("2026-10-10"),
      diaVencimento: 10,
      dataSolicitacaoCancelamento: data("2026-09-25"), // 15 dias antes
    });
    expect(ultima).toBeNull();
  });

  it("quando o aviso tem menos de 15 dias, a próxima parcela ainda é devida (e só ela)", () => {
    const ultima = calcularUltimaParcelaDevida({
      proximaDataVencimento: data("2026-10-10"),
      diaVencimento: 10,
      dataSolicitacaoCancelamento: data("2026-09-28"), // 12 dias antes
    });
    expect(ultima?.toISOString().slice(0, 10)).toBe("2026-10-10");
  });

  it("quando o aviso é dado com bastante antecedência, nenhuma parcela futura é devida", () => {
    const ultima = calcularUltimaParcelaDevida({
      proximaDataVencimento: data("2026-10-10"),
      diaVencimento: 10,
      dataSolicitacaoCancelamento: data("2026-09-01"), // 39 dias antes
    });
    expect(ultima).toBeNull();
  });

  it("respeita o dia de vencimento fixo ao clampar em fevereiro", () => {
    const ultima = calcularUltimaParcelaDevida({
      proximaDataVencimento: data("2026-01-31"),
      diaVencimento: 31,
      dataSolicitacaoCancelamento: data("2026-01-20"), // 11 dias antes de 31/01 -> devida
    });
    // 31/01 é devida (11 dias de aviso); fevereiro/2026 tem 28 dias -> clamp pro dia 28,
    // que fica além do limite de 15 dias -> não é devida.
    expect(ultima?.toISOString().slice(0, 10)).toBe("2026-01-31");
  });
});
