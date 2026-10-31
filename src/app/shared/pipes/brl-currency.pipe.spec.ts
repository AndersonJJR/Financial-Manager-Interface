import { BrlCurrencyPipe } from './brl-currency.pipe';
import { DateBrPipe } from './date-br.pipe';

describe('Pipes de Formatação (BrlCurrencyPipe & DateBrPipe)', () => {
  const currencyPipe = new BrlCurrencyPipe();
  const datePipe = new DateBrPipe();

  it('deve formatar valores monetários em BRL nos modos default, RECEITA, DESPESA, signed e compact', () => {
    expect(currencyPipe.transform(1500)).toBe('R$ 1.500,00');
    expect(currencyPipe.transform(8450, 'RECEITA')).toBe('+ R$ 8.450,00');
    expect(currencyPipe.transform(2400, 'DESPESA')).toBe('- R$ 2.400,00');
    expect(currencyPipe.transform(4139.75, 'signed')).toBe('+ R$ 4.139,75');
    expect(currencyPipe.transform(-250, 'signed')).toBe('- R$ 250,00');
    expect(currencyPipe.transform(6150.75, 'compact')).toBe('R$ 6,15k');
  });

  it('deve formatar datas ISO YYYY-MM-DD para o padrão brasileiro DD/MM/YYYY', () => {
    expect(datePipe.transform('2026-10-31')).toBe('31/10/2026');
    expect(datePipe.transform(null)).toBe('');
  });
});
