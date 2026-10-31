import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  GastoPorCategoriaDto,
  ResumoMensalResponse,
  TransacaoResponse,
} from '../../../../core/models/transacao.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { TransacaoService } from '../../../../core/services/transacao.service';
import { BrlCurrencyPipe } from '../../../../shared/pipes/brl-currency.pipe';
import { DateBrPipe } from '../../../../shared/pipes/date-br.pipe';

const PALETA_PADRAO_CATEGORIAS: readonly string[] = [
  '#6366f1',
  '#f59e0b',
  '#3b82f6',
  '#ec4899',
  '#10b981',
  '#64748b',
  '#a78bfa',
];

const CIRCUNFERENCIA_DONUT = 2 * Math.PI * 39; // ~245.04

export interface SegmentoDonut extends GastoPorCategoriaDto {
  readonly cor: string;
  readonly dashArray: string;
  readonly dashOffset: string;
}

@Component({
  selector: 'app-visao-geral-page',
  standalone: true,
  imports: [RouterLink, BrlCurrencyPipe, DateBrPipe],
  templateUrl: './visao-geral-page.component.html',
  styleUrl: './visao-geral-page.component.css',
})
export class VisaoGeralPageComponent {
  readonly periodoService = inject(PeriodoService);
  private readonly transacaoService = inject(TransacaoService);
  private readonly notification = inject(NotificationService);

  readonly carregando = signal(false);
  readonly exportando = signal(false);

  readonly resumo = signal<ResumoMensalResponse>({
    ano: this.periodoService.ano(),
    mes: this.periodoService.mes(),
    totalEntradasRealizadas: 0,
    totalEntradasPrevistas: 0,
    totalSaidasPagas: 0,
    totalSaidasPrevistas: 0,
    totalSaidasConsolidado: 0,
    saldoLiquidoRealizado: 0,
    saldoLiquidoPrevisto: 0,
    gastosPorCategoria: [],
  });

  readonly ultimosLancamentos = signal<TransacaoResponse[]>([]);

  readonly segmentosDonut = computed<SegmentoDonut[]>(() => {
    const gastos = this.resumo().gastosPorCategoria ?? [];
    let offsetAcumulado = 0;

    return gastos.map((gasto, idx) => {
      const cor =
        gasto.corHex && gasto.corHex.trim().length > 0
          ? gasto.corHex
          : PALETA_PADRAO_CATEGORIAS[idx % PALETA_PADRAO_CATEGORIAS.length];
      const comprimento = (Number(gasto.percentual ?? 0) / 100) * CIRCUNFERENCIA_DONUT;
      const dashArray = `${comprimento.toFixed(1)} ${CIRCUNFERENCIA_DONUT.toFixed(1)}`;
      const dashOffset = `${(-offsetAcumulado).toFixed(1)}`;
      offsetAcumulado += comprimento;

      return {
        ...gasto,
        cor,
        dashArray,
        dashOffset,
      };
    });
  });

  readonly maiorCategoria = computed<SegmentoDonut | null>(() => {
    const segs = this.segmentosDonut();
    return segs.length > 0 ? segs[0] : null;
  });

  readonly resumoConcentracaoTexto = computed(() => {
    const segs = this.segmentosDonut();
    if (segs.length === 0) {
      return 'Nenhuma despesa registrada no período selecionado.';
    }
    if (segs.length === 1) {
      return `100% do orçamento de saídas concentrado em ${segs[0].categoriaNome}.`;
    }
    const somaTop2 = Number(segs[0].percentual) + Number(segs[1].percentual);
    return `Concentração de ${this.formatarPercentual(somaTop2)}% do orçamento mensal distribuída nas principais categorias (${segs[0].categoriaNome} e ${segs[1].categoriaNome}).`;
  });

  constructor() {
    effect(() => {
      const ano = this.periodoService.ano();
      const mes = this.periodoService.mes();
      const dataInicio = this.periodoService.dataInicioMes();
      const dataFim = this.periodoService.dataFimMes();
      this.carregarDadosMes(ano, mes, dataInicio, dataFim);
    });
  }

  mesAnterior(): void {
    this.periodoService.mesAnterior();
  }

  proximoMes(): void {
    this.periodoService.proximoMes();
  }

  carregarDadosMes(ano: number, mes: number, dataInicio: string, dataFim: string): void {
    this.carregando.set(true);
    forkJoin({
      resumo: this.transacaoService.obterResumoMensal(ano, mes),
      lancamentos: this.transacaoService.listar({ dataInicio, dataFim }),
    }).subscribe({
      next: ({ resumo, lancamentos }) => {
        this.resumo.set(resumo);
        this.ultimosLancamentos.set(lancamentos.slice(0, 5));
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }

  exportarExtratoMes(): void {
    const dataInicio = this.periodoService.dataInicioMes();
    const dataFim = this.periodoService.dataFimMes();
    this.exportando.set(true);
    this.transacaoService.exportarExtrato(dataInicio, dataFim, 'CSV').subscribe({
      next: (blob) => {
        this.exportando.set(false);
        this.transacaoService.dispararDownloadArquivo(blob, dataInicio, dataFim, 'CSV');
        this.notification.sucesso('Extrato mensal exportado em CSV com sucesso!');
      },
      error: () => {
        this.exportando.set(false);
      },
    });
  }

  formatarPercentual(valor: number | null | undefined): string {
    return Number(valor ?? 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
  }
}
