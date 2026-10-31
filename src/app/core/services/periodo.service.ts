import { computed, Injectable, signal } from '@angular/core';

const MESES_PT_BR: readonly string[] = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

@Injectable({
  providedIn: 'root',
})
export class PeriodoService {
  private readonly hoje = new Date();
  private readonly anoSignal = signal<number>(this.hoje.getFullYear());
  private readonly mesSignal = signal<number>(this.hoje.getMonth() + 1);

  readonly ano = this.anoSignal.asReadonly();
  readonly mes = this.mesSignal.asReadonly();

  readonly nomeMes = computed(() => MESES_PT_BR[this.mesSignal() - 1] ?? 'Janeiro');

  readonly labelCurto = computed(() => `${this.nomeMes()} ${this.anoSignal()}`);

  readonly labelExtenso = computed(() => `${this.nomeMes()} de ${this.anoSignal()}`);

  readonly codigoMesAno = computed(() => {
    const m = String(this.mesSignal()).padStart(2, '0');
    return `Mês ${m} / ${this.anoSignal()}`;
  });

  readonly dataInicioMes = computed(() => {
    const m = String(this.mesSignal()).padStart(2, '0');
    return `${this.anoSignal()}-${m}-01`;
  });

  readonly dataFimMes = computed(() => {
    const ultimoDia = new Date(this.anoSignal(), this.mesSignal(), 0).getDate();
    const m = String(this.mesSignal()).padStart(2, '0');
    const d = String(ultimoDia).padStart(2, '0');
    return `${this.anoSignal()}-${m}-${d}`;
  });

  readonly intervaloFormatadoBr = computed(() => {
    const ultimoDia = new Date(this.anoSignal(), this.mesSignal(), 0).getDate();
    const m = String(this.mesSignal()).padStart(2, '0');
    const d = String(ultimoDia).padStart(2, '0');
    const y = this.anoSignal();
    return `01/${m}/${y} até ${d}/${m}/${y}`;
  });

  mesAnterior(): void {
    const mesAtual = this.mesSignal();
    const anoAtual = this.anoSignal();
    if (mesAtual === 1) {
      if (anoAtual > 1970) {
        this.mesSignal.set(12);
        this.anoSignal.set(anoAtual - 1);
      }
    } else {
      this.mesSignal.set(mesAtual - 1);
    }
  }

  proximoMes(): void {
    const mesAtual = this.mesSignal();
    const anoAtual = this.anoSignal();
    if (mesAtual === 12) {
      if (anoAtual < 2100) {
        this.mesSignal.set(1);
        this.anoSignal.set(anoAtual + 1);
      }
    } else {
      this.mesSignal.set(mesAtual + 1);
    }
  }

  definirPeriodo(ano: number, mes: number): void {
    if (ano >= 1970 && ano <= 2100 && mes >= 1 && mes <= 12) {
      this.anoSignal.set(ano);
      this.mesSignal.set(mes);
    }
  }
}
