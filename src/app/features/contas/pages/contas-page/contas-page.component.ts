import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContaRequest, ContaResponse, TipoConta } from '../../../../core/models/conta.model';
import { ContaService } from '../../../../core/services/conta.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinancialValidators } from '../../../../core/validators/financial.validators';
import { BrlCurrencyPipe } from '../../../../shared/pipes/brl-currency.pipe';
import {
  obterMetaTipoConta,
  TIPOS_CONTA_META,
  TipoContaMeta,
} from '../../../../shared/utils/domain-labels.util';

export type FiltroStatusConta = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-contas-page',
  standalone: true,
  imports: [ReactiveFormsModule, BrlCurrencyPipe],
  templateUrl: './contas-page.component.html',
  styleUrl: './contas-page.component.css',
})
export class ContasPageComponent implements OnInit {
  private readonly contaService = inject(ContaService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly tiposConta = TIPOS_CONTA_META;
  readonly contas = signal<ContaResponse[]>([]);
  readonly filtroStatus = signal<FiltroStatusConta>('all');
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly modalAberto = signal(false);
  readonly contaEmEdicao = signal<ContaResponse | null>(null);

  readonly totalContasCount = computed(() => this.contas().length);
  readonly contasAtivasCount = computed(() => this.contas().filter((c) => c.ativa).length);
  readonly contasInativasCount = computed(() => this.contas().filter((c) => !c.ativa).length);

  readonly baseInicialConsolidada = computed(() =>
    this.contas()
      .filter((c) => c.ativa)
      .reduce((acc, item) => acc + Number(item.saldoInicial ?? 0), 0)
  );

  readonly contasFiltradas = computed(() => {
    const status = this.filtroStatus();
    const lista = this.contas();
    if (status === 'active') {
      return lista.filter((c) => c.ativa);
    }
    if (status === 'inactive') {
      return lista.filter((c) => !c.ativa);
    }
    return lista;
  });

  readonly contaForm = this.fb.nonNullable.group({
    nome: ['', [FinancialValidators.notBlank(), FinancialValidators.trimmedSize(2, 100)]],
    instituicao: ['', [Validators.maxLength(100)]],
    tipo: ['CONTA_CORRENTE' as TipoConta, [Validators.required]],
    saldoInicial: [0],
  });

  ngOnInit(): void {
    this.carregarContas();
  }

  carregarContas(): void {
    this.carregando.set(true);
    this.contaService.listarTodas().subscribe({
      next: (lista) => {
        this.contas.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }

  selecionarFiltro(filtro: FiltroStatusConta): void {
    this.filtroStatus.set(filtro);
  }

  obterMetaTipo(tipo: TipoConta): TipoContaMeta {
    return obterMetaTipoConta(tipo);
  }

  abrirModalNovaConta(): void {
    this.contaEmEdicao.set(null);
    this.contaForm.reset({
      nome: '',
      instituicao: '',
      tipo: 'CONTA_CORRENTE',
      saldoInicial: 0,
    });
    this.modalAberto.set(true);
  }

  abrirModalEditarConta(conta: ContaResponse): void {
    this.contaEmEdicao.set(conta);
    this.contaForm.reset({
      nome: conta.nome,
      instituicao: conta.instituicao ?? '',
      tipo: conta.tipo,
      saldoInicial: Number(conta.saldoInicial ?? 0),
    });
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.contaEmEdicao.set(null);
  }

  salvarConta(): void {
    if (this.contaForm.invalid) {
      this.contaForm.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const valores = this.contaForm.getRawValue();
    const edicao = this.contaEmEdicao();

    const payload: ContaRequest = {
      nome: valores.nome.trim(),
      instituicao: valores.instituicao.trim() ? valores.instituicao.trim() : null,
      tipo: valores.tipo,
      saldoInicial: Number(valores.saldoInicial ?? 0),
      ativa: edicao ? edicao.ativa : true,
    };

    const operacao$ = edicao
      ? this.contaService.atualizar(edicao.id, payload)
      : this.contaService.criar(payload);

    operacao$.subscribe({
      next: (contaSalva) => {
        this.salvando.set(false);
        this.fecharModal();
        this.carregarContas();
        this.notification.sucesso(
          edicao
            ? `Conta "${contaSalva.nome}" atualizada com sucesso!`
            : `Conta "${contaSalva.nome}" cadastrada com sucesso!`
        );
      },
      error: () => {
        this.salvando.set(false);
      },
    });
  }

  inativarConta(conta: ContaResponse): void {
    this.contaService.excluir(conta.id).subscribe({
      next: () => {
        this.carregarContas();
        this.notification.sucesso(
          'Conta inativada. Seus registros passados foram mantidos intactos.'
        );
      },
    });
  }

  reativarConta(conta: ContaResponse): void {
    this.contaService.reativar(conta).subscribe({
      next: () => {
        this.carregarContas();
        this.notification.sucesso(
          'Conta reativada com sucesso! Novos lançamentos liberados.'
        );
      },
    });
  }
}
