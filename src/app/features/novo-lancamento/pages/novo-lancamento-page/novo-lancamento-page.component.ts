import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { CategoriaResponse } from '../../../../core/models/categoria.model';
import { ContaResponse } from '../../../../core/models/conta.model';
import {
  DespesaParceladaRequest,
  ModalidadeTransacao,
  ModoValorParcelamento,
  Periodicidade,
  TipoTransacao,
  TransacaoRecorrenteRequest,
  TransacaoRequest,
} from '../../../../core/models/transacao.model';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ContaService } from '../../../../core/services/conta.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TransacaoService } from '../../../../core/services/transacao.service';
import { FinancialValidators } from '../../../../core/validators/financial.validators';
import { BrlCurrencyPipe } from '../../../../shared/pipes/brl-currency.pipe';
import {
  obterRotuloPeriodicidade,
  PERIODICIDADES_META,
} from '../../../../shared/utils/domain-labels.util';
import { calcularPreviaParcelamento } from '../../../../shared/utils/parcelamento-calculator.util';

@Component({
  selector: 'app-novo-lancamento-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, BrlCurrencyPipe],
  templateUrl: './novo-lancamento-page.component.html',
  styleUrl: './novo-lancamento-page.component.css',
})
export class NovoLancamentoPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contaService = inject(ContaService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly transacaoService = inject(TransacaoService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly periodicidades = PERIODICIDADES_META;
  readonly hojeIso = new Date().toISOString().slice(0, 10);

  readonly modalidade = signal<ModalidadeTransacao>('PARCELADA');
  readonly contas = signal<ContaResponse[]>([]);
  readonly categorias = signal<CategoriaResponse[]>([]);
  readonly salvando = signal(false);

  readonly lancamentoForm = this.fb.nonNullable.group(
    {
      descricao: [
        '',
        [FinancialValidators.notBlank(), FinancialValidators.trimmedSize(2, 150)],
      ],
      tipo: ['DESPESA' as TipoTransacao, [Validators.required]],
      modoValor: ['VALOR_TOTAL' as ModoValorParcelamento, [Validators.required]],
      valorInformado: [0, [FinancialValidators.positiveAmount()]],
      totalParcelas: [10, [Validators.required, Validators.min(1), Validators.max(240)]],
      periodicidade: ['MENSAL' as Periodicidade, [Validators.required]],
      dataPrimeiraParcela: [this.hojeIso, [Validators.required]],
      primeiraParcelaPaga: [true],
      contaId: ['', [Validators.required]],
      categoriaId: ['', [Validators.required]],
      observacao: ['', [Validators.maxLength(500)]],
    },
    {
      validators: [
        FinancialValidators.installmentMinimumValue(
          'valorInformado',
          'modoValor',
          'totalParcelas'
        ),
      ],
    }
  );

  private readonly formValueSignal = toSignal(
    this.lancamentoForm.valueChanges.pipe(startWith(this.lancamentoForm.getRawValue())),
    { initialValue: this.lancamentoForm.getRawValue() }
  );

  readonly descricaoLength = computed(
    () => (this.formValueSignal().descricao ?? '').length
  );

  readonly tipoEfetivo = computed<TipoTransacao>(() => {
    if (this.modalidade() === 'PARCELADA') {
      return 'DESPESA';
    }
    return (this.formValueSignal().tipo as TipoTransacao) ?? 'DESPESA';
  });

  readonly contasAtivas = computed(() => this.contas().filter((c) => c.ativa));

  readonly categoriasCompativeis = computed(() => {
    const tipo = this.tipoEfetivo();
    return this.categorias().filter((c) => c.ativa && c.tipo === tipo);
  });

  readonly rotuloPeriodicidadeAtual = computed(() =>
    obterRotuloPeriodicidade(this.formValueSignal().periodicidade as Periodicidade)
  );

  readonly previa = computed(() => {
    const val = this.formValueSignal();
    const mod = this.modalidade();
    const parcelas = mod === 'UNICA' ? 1 : Number(val.totalParcelas ?? 1);
    const modoValor: ModoValorParcelamento =
      mod === 'PARCELADA'
        ? ((val.modoValor as ModoValorParcelamento) ?? 'VALOR_TOTAL')
        : 'VALOR_PARCELA';

    return calcularPreviaParcelamento(
      Number(val.valorInformado ?? 0),
      modoValor,
      parcelas,
      (val.periodicidade as Periodicidade) ?? 'MENSAL',
      val.dataPrimeiraParcela ?? this.hojeIso,
      Boolean(val.primeiraParcelaPaga)
    );
  });

  ngOnInit(): void {
    this.contaService.listarTodas().subscribe({
      next: (lista) => {
        this.contas.set(lista);
        const primeiraAtiva = lista.find((c) => c.ativa);
        if (primeiraAtiva && !this.lancamentoForm.controls.contaId.value) {
          this.lancamentoForm.controls.contaId.setValue(primeiraAtiva.id);
        }
      },
    });

    this.categoriaService.listarTodas().subscribe({
      next: (lista) => {
        this.categorias.set(lista);
        this.sincronizarCategoriaSelecionada();
      },
    });
  }

  selecionarModalidade(novaModalidade: ModalidadeTransacao): void {
    this.modalidade.set(novaModalidade);
    if (novaModalidade === 'PARCELADA') {
      this.lancamentoForm.controls.tipo.setValue('DESPESA');
      if (this.lancamentoForm.controls.totalParcelas.value < 2) {
        this.lancamentoForm.controls.totalParcelas.setValue(10);
      }
    } else if (novaModalidade === 'UNICA') {
      this.lancamentoForm.controls.totalParcelas.setValue(1);
    } else if (novaModalidade === 'RECORRENTE') {
      if (this.lancamentoForm.controls.totalParcelas.value > 60) {
        this.lancamentoForm.controls.totalParcelas.setValue(12);
      }
    }
    this.aplicarValidadoresTotalParcelas(novaModalidade);
    this.sincronizarCategoriaSelecionada();
  }

  definirModoValor(modo: ModoValorParcelamento): void {
    this.lancamentoForm.controls.modoValor.setValue(modo);
  }

  definirTipoTransacao(tipo: TipoTransacao): void {
    this.lancamentoForm.controls.tipo.setValue(tipo);
    this.sincronizarCategoriaSelecionada();
  }

  /**
   * BUG-001: re-registra os validadores do controle `totalParcelas` em cada troca de
   * modalidade. O template aplica MinValidator/MaxValidator nativos via atributos
   * [min]/[max] no input de parcelas; ao alternar para a modalidade UNICA o input é
   * desmontado (@if) e o validador capturado com o limite da modalidade anterior fica
   * órfão no FormControl, deixando o formulário permanentemente inválido e
   * bloqueando o salvamento sem mensagem de erro visível. Reatribuindo os validadores
   * via setValidators(), o validador órfão é descartado e os limites voltam a refletir
   * a modalidade atual.
   */
  private aplicarValidadoresTotalParcelas(modalidade: ModalidadeTransacao): void {
    const limites =
      modalidade === 'PARCELADA' ? { minimo: 2, maximo: 240 } : { minimo: 1, maximo: 60 };
    const controle = this.lancamentoForm.controls.totalParcelas;
    controle.setValidators([
      Validators.required,
      Validators.min(limites.minimo),
      Validators.max(limites.maximo),
    ]);
    controle.updateValueAndValidity({ emitEvent: false });
  }

  private sincronizarCategoriaSelecionada(): void {
    const compativeis = this.categoriasCompativeis();
    const atual = this.lancamentoForm.controls.categoriaId.value;
    if (!compativeis.some((c) => c.id === atual)) {
      this.lancamentoForm.controls.categoriaId.setValue(compativeis[0]?.id ?? '');
    }
  }

  salvarLancamento(): void {
    if (this.lancamentoForm.invalid) {
      this.lancamentoForm.markAllAsTouched();
      this.notification.erro(
        'Não foi possível salvar o lançamento. Verifique os campos obrigatórios do formulário.'
      );
      return;
    }

    const raw = this.lancamentoForm.getRawValue();
    const mod = this.modalidade();

    if (mod === 'PARCELADA' && (raw.totalParcelas < 2 || raw.totalParcelas > 240)) {
      this.notification.erro('Uma compra parcelada deve ter entre 2 e 240 parcelas.');
      return;
    }

    if (mod === 'RECORRENTE' && (raw.totalParcelas < 1 || raw.totalParcelas > 60)) {
      this.notification.erro('Uma recorrência deve projetar entre 1 e 60 ocorrências.');
      return;
    }

    this.salvando.set(true);

    if (mod === 'PARCELADA') {
      const request: DespesaParceladaRequest = {
        descricao: raw.descricao.trim(),
        valorInformado: Number(raw.valorInformado),
        modoValor: raw.modoValor,
        totalParcelas: Number(raw.totalParcelas),
        periodicidade: raw.periodicidade,
        dataPrimeiraParcela: raw.dataPrimeiraParcela,
        primeiraParcelaPaga: Boolean(raw.primeiraParcelaPaga),
        contaId: raw.contaId,
        categoriaId: raw.categoriaId,
        observacao: raw.observacao.trim() ? raw.observacao.trim() : null,
      };

      this.transacaoService.criarDespesaParcelada(request).subscribe({
        next: (res) => {
          this.salvando.set(false);
          this.notification.sucesso(
            `Compra parcelada "${res.descricaoBase}" (${res.totalLancamentos}x) criada com sucesso!`
          );
          void this.router.navigate(['/lancamentos']);
        },
        error: () => {
          this.salvando.set(false);
        },
      });
      return;
    }

    if (mod === 'RECORRENTE') {
      const request: TransacaoRecorrenteRequest = {
        descricao: raw.descricao.trim(),
        valor: Number(raw.valorInformado),
        tipo: raw.tipo,
        periodicidade: raw.periodicidade,
        dataInicio: raw.dataPrimeiraParcela,
        quantidadeOcorrencias: Number(raw.totalParcelas),
        primeiraOcorrenciaEfetivada: Boolean(raw.primeiraParcelaPaga),
        contaId: raw.contaId,
        categoriaId: raw.categoriaId,
        observacao: raw.observacao.trim() ? raw.observacao.trim() : null,
      };

      this.transacaoService.criarTransacaoRecorrente(request).subscribe({
        next: (res) => {
          this.salvando.set(false);
          this.notification.sucesso(
            `Transação recorrente "${res.descricaoBase}" (${res.totalLancamentos} ocorrências) registrada!`
          );
          void this.router.navigate(['/lancamentos']);
        },
        error: () => {
          this.salvando.set(false);
        },
      });
      return;
    }

    const isEfetivada = Boolean(raw.primeiraParcelaPaga);
    const request: TransacaoRequest = {
      descricao: raw.descricao.trim(),
      valor: Number(raw.valorInformado),
      dataCompetencia: raw.dataPrimeiraParcela,
      dataPagamento: isEfetivada ? raw.dataPrimeiraParcela : null,
      tipo: raw.tipo,
      status: isEfetivada ? 'EFETIVADA' : 'PENDENTE',
      contaId: raw.contaId,
      categoriaId: raw.categoriaId,
      observacao: raw.observacao.trim() ? raw.observacao.trim() : null,
    };

    this.transacaoService.criar(request).subscribe({
      next: (res) => {
        this.salvando.set(false);
        this.notification.sucesso(`Lançamento "${res.descricao}" cadastrado com sucesso!`);
        void this.router.navigate(['/lancamentos']);
      },
      error: () => {
        this.salvando.set(false);
      },
    });
  }
}
