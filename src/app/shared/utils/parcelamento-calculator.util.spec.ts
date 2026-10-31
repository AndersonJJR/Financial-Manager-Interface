import {
  avancarDataPorPeriodicidade,
  calcularPreviaParcelamento,
} from './parcelamento-calculator.util';

describe('parcelamento-calculator.util', () => {
  it('deve absorver resíduos de centavos na 1ª parcela quando modoValor for VALOR_TOTAL', () => {
    const resultado = calcularPreviaParcelamento(
      100,
      'VALOR_TOTAL',
      3,
      'MENSAL',
      '2026-11-10',
      true
    );

    expect(resultado.valorTotalConsolidado).toBe(100);
    expect(resultado.valorPrimeiraParcela).toBe(33.34);
    expect(resultado.valorParcelaPadrao).toBe(33.33);
    expect(resultado.quantidadePagas).toBe(1);
    expect(resultado.quantidadePendentes).toBe(2);
    expect(resultado.itensVisiveis[0].paga).toBe(true);
    expect(resultado.itensVisiveis[1].paga).toBe(false);
  });

  it('deve multiplicar o valor informado pelo número de parcelas quando modoValor for VALOR_PARCELA', () => {
    const resultado = calcularPreviaParcelamento(
      250,
      'VALOR_PARCELA',
      4,
      'MENSAL',
      '2026-01-15',
      false
    );

    expect(resultado.valorTotalConsolidado).toBe(1000);
    expect(resultado.valorPrimeiraParcela).toBe(250);
    expect(resultado.valorParcelaPadrao).toBe(250);
    expect(resultado.quantidadePagas).toBe(0);
    expect(resultado.quantidadePendentes).toBe(4);
  });

  it('deve avançar datas corretamente para todas as periodicidades', () => {
    expect(avancarDataPorPeriodicidade('2026-01-10', 'SEMANAL', 1)).toBe('2026-01-17');
    expect(avancarDataPorPeriodicidade('2026-01-10', 'QUINZENAL', 1)).toBe('2026-01-25');
    expect(avancarDataPorPeriodicidade('2026-01-10', 'MENSAL', 1)).toBe('2026-02-10');
    expect(avancarDataPorPeriodicidade('2026-01-10', 'BIMESTRAL', 1)).toBe('2026-03-10');
    expect(avancarDataPorPeriodicidade('2026-01-10', 'TRIMESTRAL', 1)).toBe('2026-04-10');
    expect(avancarDataPorPeriodicidade('2026-01-10', 'SEMESTRAL', 1)).toBe('2026-07-10');
    expect(avancarDataPorPeriodicidade('2026-01-10', 'ANUAL', 1)).toBe('2027-01-10');
  });
});
