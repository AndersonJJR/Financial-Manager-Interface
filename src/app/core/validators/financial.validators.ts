import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ModoValorParcelamento, StatusTransacao } from '../models/transacao.model';

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export class FinancialValidators {
  static trimmedEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const raw = control.value;
      if (raw === null || raw === undefined || String(raw).trim() === '') {
        return null;
      }
      const trimmedControl = { value: String(raw).trim() } as AbstractControl;
      return Validators.email(trimmedControl);
    };
  }

  static notBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined) {
        return { notBlank: 'Este campo é obrigatório' };
      }
      if (typeof value === 'string' && value.trim().length === 0) {
        return { notBlank: 'O campo não pode conter apenas espaços' };
      }
      return null;
    };
  }

  static trimmedSize(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const raw = control.value;
      if (raw === null || raw === undefined || raw === '') {
        return null;
      }
      const length = String(raw).trim().length;
      if (length < min || length > max) {
        return {
          trimmedSize: {
            min,
            max,
            actual: length,
            message: `Deve conter entre ${min} e ${max} caracteres`,
          },
        };
      }
      return null;
    };
  }

  static positiveAmount(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = Number(control.value);
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      if (Number.isNaN(val) || val <= 0) {
        return { positiveAmount: 'O valor deve ser estritamente maior que zero' };
      }
      return null;
    };
  }

  static hexColor(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || String(value).trim() === '') {
        return null;
      }
      if (!HEX_COLOR_REGEX.test(String(value).trim())) {
        return { hexColor: 'A cor deve estar no formato hexadecimal (#RRGGBB ou #RGB)' };
      }
      return null;
    };
  }

  static installmentMinimumValue(
    valorField = 'valorInformado',
    modoField = 'modoValor',
    parcelasField = 'totalParcelas'
  ): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const valor = Number(group.get(valorField)?.value);
      const modo = group.get(modoField)?.value as ModoValorParcelamento | null;
      const totalParcelas = Number(group.get(parcelasField)?.value);

      if (!valor || Number.isNaN(valor) || valor <= 0 || !totalParcelas || totalParcelas < 2) {
        return null;
      }

      if (modo === 'VALOR_TOTAL') {
        const valorBaseParcela = Math.floor((valor / totalParcelas) * 100) / 100;
        if (valorBaseParcela < 0.01) {
          return {
            installmentMinimum:
              'O valor total dividido pelo número de parcelas resulta em parcelas menores que R$ 0,01.',
          };
        }
      } else if (valor < 0.01) {
        return {
          installmentMinimum: 'O valor de cada parcela deve ser de no mínimo R$ 0,01.',
        };
      }

      return null;
    };
  }

  static statusPaymentConsistency(
    statusField = 'status',
    dataPagamentoField = 'dataPagamento'
  ): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const status = group.get(statusField)?.value as StatusTransacao | null;
      const dataPagamento = group.get(dataPagamentoField)?.value as string | null;

      if (status === 'CANCELADA' && dataPagamento && dataPagamento.trim().length > 0) {
        return {
          statusPaymentConsistency:
            'Uma transação cancelada não pode possuir data de pagamento/efetivação.',
        };
      }

      return null;
    };
  }

  static dateRange(startField = 'dataInicio', endField = 'dataFim'): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get(startField)?.value as string | null;
      const end = group.get(endField)?.value as string | null;

      if (start && end && start > end) {
        return {
          dateRange: 'A data inicial não pode ser posterior à data final.',
        };
      }

      return null;
    };
  }

  static passwordMatch(passwordField = 'senha', confirmField = 'confirmarSenha'): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordField)?.value as string | null;
      const confirm = group.get(confirmField)?.value as string | null;

      if (!password || !confirm) {
        return null;
      }

      if (password !== confirm) {
        return {
          passwordMismatch: 'A confirmação de senha não coincide com a senha informada.',
        };
      }

      return null;
    };
  }
}
