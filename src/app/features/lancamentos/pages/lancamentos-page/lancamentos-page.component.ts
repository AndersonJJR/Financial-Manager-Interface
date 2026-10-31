import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoriaResponse } from '../../../../core/models/categoria.model';
import { ContaResponse } from '../../../../core/models/conta.model';
import {
  FormatoExportacao,
  StatusTransacao,
  TipoTransacao,
  TransacaoFiltro,
  TransacaoRequest,
  TransacaoResponse,
} from '../../../../core/models/transacao.model';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ContaService } from '../../../../core/services/conta.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { TransacaoService } from '../../../../core/services/transacao.service';
import { FinancialValidators } from '../../../../core/validators/financial.validators';
import { BrlCurrencyPipe } from '../../../../shared/pipes/brl-currency.pipe';
import { DateBrPipe } from '../../../../shared/pipes/date-br.pipe';
import { obterRotuloModalidade } from '../../../../shared/utils/domain-labels.util';
import { formatarDataIsoParaBr } from '../../../../shared/utils/parcelamento-calculator.util';

@Component({
  selector: 'app-lancamentos-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, BrlCurrencyPipe, DateBrPipe],
  templateUrl: './lancamentos-page.component.html',
  styleUrl: './lancamentos-page.component.css',
})
export class LancamentosPageComponent implements OnInit {
  readonly periodoService = inject(PeriodoService);
  private readonly transacaoService = inject(TransacaoService);
  private readonly contaService = inject(ContaService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly hojeIso = new Date().toISOString().slice(0, 10);

  readonly lancamentos = signal<TransacaoResponse[]>([]);
  readonly contas = signal<ContaResponse[]>([]);
  readonly categorias = signal<CategoriaResponse[]>([]);
  readonly carregando = signal(false);
  readonly processandoAcao = signal(false);

  // Filters
  readonly dataInicioFiltro = signal<string>(this.periodoService.dataInicioMes());
  readonly dataFimFiltro = signal<string>(this.periodoService.dataFimMes());
  readonly filtroTipo = signal<'' | TipoTransacao>('');
  readonly filtroStatus = signal<'' | StatusTransacao>('');
  readonly filtroContaId = signal<string>('');
  readonly filtroCategoriaId = signal<string>('');

  // Popovers & Modals
  readonly menuExportarAberto = signal(false);
  readonly popoverDatasAberto = signal(false);
  readonly transacaoParaEfetivar = signal<TransacaoResponse | null>(null);
  readonly dataPagamentoEfetivacao = signal<string>(this.hojeIso);
  readonly grupoModalAberto = signal(false);
  readonly grupoAtualId = signal<string | null>(null);
  readonly lancamentosDoGrupo = signal<TransacaoResponse[]>([]);
  readonly transacaoEmEdicao = signal<TransacaoResponse | null>(null);

  readonly intervaloCompetenciaTexto = computed(() => {
    const ini = formatarDataIsoParaBr(this.dataInicioFiltro());
    const fim = formatarDataIsoParaBr(this.dataFimFiltro());
    return `${ini} até ${fim}`;
  });

  // KPIs from filtered transactions (excluding CANCELADA)
  readonly receitasFiltradasValor = computed(() =>
    this.lancamentos()
      .filter((t) => t.tipo === 'RECEITA' && t.status !== 'CANCELADA')
      .reduce((acc, t) => acc + Number(t.valor ?? 0), 0)
  );

  readonly receitasFiltradasCount = computed(
    () =>
      this.lancamentos().filter((t) => t.tipo === 'RECEITA' && t.status !== 'CANCELADA').length
  );

  readonly despesasFiltradasValor = computed(() =>
    this.lancamentos()
      .filter((t) => t.tipo === 'DESPESA' && t.status !== 'CANCELADA')
      .reduce((acc, t) => acc + Number(t.valor ?? 0), 0)
  );

  readonly despesasFiltradasCount = computed(
    () =>
      this.lancamentos().filter((t) => t.tipo === 'DESPESA' && t.status !== 'CANCELADA').length
  );

  readonly saldoPeriodoFiltrado = computed(
    () => this.receitasFiltradasValor() - this.despesasFiltradasValor()
  );

  readonly pendentesAPagarValor = computed(() =>
    this.lancamentos()
      .filter((t) => t.tipo === 'DESPESA' && t.status === 'PENDENTE')
      .reduce((acc, t) => acc + Number(t.valor ?? 0), 0)
  );

  readonly pendentesAPagarCount = computed(
    () => this.lancamentos().filter((t) => t.tipo === 'DESPESA' && t.status === 'PENDENTE').length
  );

  readonly possuiPendentesNoGrupo = computed(() =>
    this.lancamentosDoGrupo().some((t) => t.status === 'PENDENTE')
  );

  readonly categoriasCompativeisEdicao = computed(() => {
    const tx = this.transacaoEmEdicao();
    if (!tx) {
      return this.categorias();
    }
    return this.categorias().filter((c) => c.tipo === tx.tipo);
  });

  readonly edicaoForm = this.fb.nonNullable.group(
    {
      descricao: ['', [FinancialValidators.notBlank(), FinancialValidators.trimmedSize(2, 150)]],
      valor: [0, [FinancialValidators.positiveAmount()]],
      dataCompetencia: ['', [Validators.required]],
      dataPagamento: [''],
      status: ['PENDENTE' as StatusTransacao, [Validators.required]],
      contaId: ['', [Validators.required]],
      categoriaId: ['', [Validators.required]],
      observacao: ['', [Validators.maxLength(500)]],
    },
    {
      validators: [FinancialValidators.statusPaymentConsistency('status', 'dataPagamento')],
    }
  );

  constructor() {
    effect(() => {
      const inicioMes = this.periodoService.dataInicioMes();
      const fimMes = this.periodoService.dataFimMes();
      this.dataInicioFiltro.set(inicioMes);
      this.dataFimFiltro.set(fimMes);
      this.carregarLancamentos();
    });
  }

  ngOnInit(): void {
    this.contaService.listarTodas().subscribe({
      next: (lista) => this.contas.set(lista),
    });
    this.categoriaService.listarTodas().subscribe({
      next: (lista) => this.categorias.set(lista),
    });
  }

  carregarLancamentos(): void {
    this.carregando.set(true);
    const filtro: TransacaoFiltro = {
      dataInicio: this.dataInicioFiltro() || undefined,
      dataFim: this.dataFimFiltro() || undefined,
      tipo: this.filtroTipo() || undefined,
      status: this.filtroStatus() || undefined,
      contaId: this.filtroContaId() || undefined,
      categoriaId: this.filtroCategoriaId() || undefined,
    };

    this.transacaoService.listar(filtro).subscribe({
      next: (lista) => {
        this.lancamentos.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }

  alterarFiltroTipo(valor: string): void {
    this.filtroTipo.set((valor as '' | TipoTransacao) || '');
    this.carregarLancamentos();
  }

  alterarFiltroStatus(valor: string): void {
    this.filtroStatus.set((valor as '' | StatusTransacao) || '');
    this.carregarLancamentos();
  }

  alterarFiltroConta(valor: string): void {
    this.filtroContaId.set(valor || '');
    this.carregarLancamentos();
  }

  alterarFiltroCategoria(valor: string): void {
    this.filtroCategoriaId.set(valor || '');
    this.carregarLancamentos();
  }

  atualizarDataInicio(valor: string): void {
    this.dataInicioFiltro.set(valor);
  }

  atualizarDataFim(valor: string): void {
    this.dataFimFiltro.set(valor);
  }

  alternarPopoverDatas(): void {
    this.popoverDatasAberto.update((v) => !v);
  }

  fecharPopoverDatas(): void {
    this.popoverDatasAberto.set(false);
  }

  aplicarFiltroDatas(): void {
    this.fecharPopoverDatas();
    this.carregarLancamentos();
  }

  limparFiltros(): void {
    this.dataInicioFiltro.set(this.periodoService.dataInicioMes());
    this.dataFimFiltro.set(this.periodoService.dataFimMes());
    this.filtroTipo.set('');
    this.filtroStatus.set('');
    this.filtroContaId.set('');
    this.filtroCategoriaId.set('');
    this.carregarLancamentos();
  }

  formatarModalidade(tx: TransacaoResponse): string {
    return obterRotuloModalidade(tx.modalidade, tx.referenciaParcela, tx.periodicidade);
  }

  alternarMenuExportar(): void {
    this.menuExportarAberto.update((v) => !v);
  }

  exportarExtrato(formato: FormatoExportacao): void {
    this.menuExportarAberto.set(false);
    const dataInicio = this.dataInicioFiltro();
    const dataFim = this.dataFimFiltro();
    const contasIds = this.filtroContaId() ? [this.filtroContaId()] : undefined;

    this.transacaoService.exportarExtrato(dataInicio, dataFim, formato, contasIds).subscribe({
      next: (blob) => {
        this.transacaoService.dispararDownloadArquivo(blob, dataInicio, dataFim, formato);
        this.notification.sucesso(`Extrato exportado em formato ${formato} com sucesso!`);
      },
    });
  }

  abrirModalEfetivar(tx: TransacaoResponse): void {
    this.transacaoParaEfetivar.set(tx);
    this.dataPagamentoEfetivacao.set(this.hojeIso);
  }

  fecharModalEfetivar(): void {
    this.transacaoParaEfetivar.set(null);
  }

  confirmarEfetivacao(event: Event): void {
    event.preventDefault();
    const tx = this.transacaoParaEfetivar();
    if (!tx) {
      return;
    }

    this.processandoAcao.set(true);
    this.transacaoService.efetivar(tx.id, this.dataPagamentoEfetivacao()).subscribe({
      next: () => {
        this.processandoAcao.set(false);
        this.fecharModalEfetivar();
        this.carregarLancamentos();
        this.notification.sucesso(`Lançamento "${tx.descricao}" efetivado com sucesso!`);
      },
      error: () => {
        this.processandoAcao.set(false);
      },
    });
  }

  abrirModalGrupo(grupoId: string): void {
    this.grupoAtualId.set(grupoId);
    this.grupoModalAberto.set(true);
    this.transacaoService.listarPorGrupo(grupoId).subscribe({
      next: (lista) => this.lancamentosDoGrupo.set(lista),
    });
  }

  fecharModalGrupo(): void {
    this.grupoModalAberto.set(false);
    this.grupoAtualId.set(null);
    this.lancamentosDoGrupo.set([]);
  }

  cancelarPendentesGrupo(): void {
    const grupoId = this.grupoAtualId();
    if (!grupoId) {
      return;
    }

    this.processandoAcao.set(true);
    this.transacaoService.cancelarPendentesDoGrupo(grupoId).subscribe({
      next: (atualizadas) => {
        this.processandoAcao.set(false);
        this.lancamentosDoGrupo.set(atualizadas);
        this.carregarLancamentos();
        this.notification.sucesso(
          'Todas as parcelas/ocorrências pendentes do grupo foram canceladas.'
        );
      },
      error: () => {
        this.processandoAcao.set(false);
      },
    });
  }

  abrirModalDetalhes(tx: TransacaoResponse): void {
    this.transacaoEmEdicao.set(tx);
    this.edicaoForm.reset({
      descricao: tx.descricao,
      valor: Number(tx.valor),
      dataCompetencia: tx.dataCompetencia,
      dataPagamento: tx.dataPagamento ?? '',
      status: tx.status,
      contaId: tx.contaId,
      categoriaId: tx.categoriaId,
      observacao: tx.observacao ?? '',
    });
  }

  fecharModalDetalhes(): void {
    this.transacaoEmEdicao.set(null);
  }

  salvarEdicao(): void {
    const tx = this.transacaoEmEdicao();
    if (!tx || this.edicaoForm.invalid) {
      this.edicaoForm.markAllAsTouched();
      return;
    }

    this.processandoAcao.set(true);
    const val = this.edicaoForm.getRawValue();
    const request: TransacaoRequest = {
      descricao: val.descricao.trim(),
      valor: Number(val.valor),
      dataCompetencia: val.dataCompetencia,
      dataPagamento:
        val.status === 'CANCELADA'
          ? null
          : val.dataPagamento.trim()
            ? val.dataPagamento.trim()
            : null,
      tipo: tx.tipo,
      status: val.status,
      contaId: val.contaId,
      categoriaId: val.categoriaId,
      observacao: val.observacao.trim() ? val.observacao.trim() : null,
    };

    this.transacaoService.atualizar(tx.id, request).subscribe({
      next: () => {
        this.processandoAcao.set(false);
        this.fecharModalDetalhes();
        this.carregarLancamentos();
        this.notification.sucesso('Lançamento atualizado com sucesso!');
      },
      error: () => {
        this.processandoAcao.set(false);
      },
    });
  }

  excluirLancamento(tx: TransacaoResponse): void {
    this.transacaoService.excluir(tx.id).subscribe({
      next: () => {
        this.carregarLancamentos();
        this.notification.sucesso(`Lançamento "${tx.descricao}" excluído permanentemente.`);
      },
    });
  }
}
