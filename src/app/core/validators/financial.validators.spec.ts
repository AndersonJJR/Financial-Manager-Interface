import { FormControl, FormGroup } from '@angular/forms';
import { FinancialValidators } from './financial.validators';

describe('FinancialValidators', () => {
  it('deve rejeitar valores em branco no validador notBlank', () => {
    const validator = FinancialValidators.notBlank();
    expect(validator(new FormControl('   '))).toEqual({
      notBlank: 'O campo não pode conter apenas espaços',
    });
    expect(validator(new FormControl('Nubank'))).toBeNull();
  });

  it('deve validar tamanho mínimo e máximo com trimmedSize', () => {
    const validator = FinancialValidators.trimmedSize(2, 10);
    expect(validator(new FormControl('A'))).toBeTruthy();
    expect(validator(new FormControl('Conta Ok'))).toBeNull();
    expect(validator(new FormControl('Texto muito longo demais'))).toBeTruthy();
  });

  it('deve validar valores positivos com positiveAmount', () => {
    const validator = FinancialValidators.positiveAmount();
    expect(validator(new FormControl(0))).toBeTruthy();
    expect(validator(new FormControl(-15))).toBeTruthy();
    expect(validator(new FormControl(120.5))).toBeNull();
  });

  it('deve validar cores hexadecimais (#RRGGBB ou #RGB)', () => {
    const validator = FinancialValidators.hexColor();
    expect(validator(new FormControl('#6366F1'))).toBeNull();
    expect(validator(new FormControl('#FFF'))).toBeNull();
    expect(validator(new FormControl('azul'))).toBeTruthy();
  });

  it('deve validar valor mínimo de parcela (R$ 0,01) no modo VALOR_TOTAL', () => {
    const group = new FormGroup(
      {
        valorInformado: new FormControl(0.05),
        modoValor: new FormControl('VALOR_TOTAL'),
        totalParcelas: new FormControl(10),
      },
      { validators: [FinancialValidators.installmentMinimumValue()] }
    );

    expect(group.errors?.['installmentMinimum']).toBeTruthy();

    group.patchValue({ valorInformado: 100, totalParcelas: 10 });
    expect(group.errors).toBeNull();
  });

  it('deve impedir dataPagamento quando o status for CANCELADA', () => {
    const group = new FormGroup(
      {
        status: new FormControl('CANCELADA'),
        dataPagamento: new FormControl('2026-10-31'),
      },
      { validators: [FinancialValidators.statusPaymentConsistency()] }
    );

    expect(group.errors?.['statusPaymentConsistency']).toBeTruthy();

    group.patchValue({ dataPagamento: '' });
    expect(group.errors).toBeNull();
  });

  it('deve validar intervalo de datas (dataInicio <= dataFim)', () => {
    const group = new FormGroup(
      {
        dataInicio: new FormControl('2026-11-10'),
        dataFim: new FormControl('2026-10-01'),
      },
      { validators: [FinancialValidators.dateRange()] }
    );

    expect(group.errors?.['dateRange']).toBeTruthy();

    group.patchValue({ dataInicio: '2026-10-01', dataFim: '2026-10-31' });
    expect(group.errors).toBeNull();
  });
});
