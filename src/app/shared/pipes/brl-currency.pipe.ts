import { Pipe, PipeTransform } from '@angular/core';
import { TipoTransacao } from '../../core/models/transacao.model';

const FORMATADOR_BRL = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type BrlCurrencyMode = 'default' | 'signed' | 'compact' | TipoTransacao;

@Pipe({
  name: 'brlCurrency',
})
export class BrlCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, mode: BrlCurrencyMode = 'default'): string {
    const numeric = Number(value ?? 0);
    const safeVal = Number.isNaN(numeric) ? 0 : numeric;
    const absFormatted = `R$ ${FORMATADOR_BRL.format(Math.abs(safeVal))}`;

    if (mode === 'compact') {
      if (Math.abs(safeVal) >= 1000) {
        const kVal = (Math.abs(safeVal) / 1000).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `R$ ${kVal}k`;
      }
      return absFormatted;
    }

    if (mode === 'RECEITA') {
      return `+ ${absFormatted}`;
    }

    if (mode === 'DESPESA') {
      return `- ${absFormatted}`;
    }

    if (mode === 'signed') {
      return safeVal >= 0 ? `+ ${absFormatted}` : `- ${absFormatted}`;
    }

    return safeVal < 0 ? `- ${absFormatted}` : absFormatted;
  }
}
