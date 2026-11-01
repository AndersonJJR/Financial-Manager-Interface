import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NovoLancamentoPageComponent } from './novo-lancamento-page.component';

describe('NovoLancamentoPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoLancamentoPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve calcular a prévia do parcelamento em tempo real e filtrar categorias compatíveis', () => {
    const fixture = TestBed.createComponent(NovoLancamentoPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne('/api/v1/contas').flush([
      {
        id: 'conta-1',
        nome: 'Cartão Nubank Ultravioleta',
        instituicao: 'Nubank',
        tipo: 'CARTAO_CREDITO',
        saldoInicial: 0,
        ativa: true,
        criadoEm: '2026-10-31T00:00:00',
        atualizadoEm: '2026-10-31T00:00:00',
      },
    ]);

    httpMock.expectOne('/api/v1/categorias').flush([
      {
        id: 'cat-desp',
        nome: 'Equipamentos & Tecnologia',
        descricao: null,
        corHex: '#6366F1',
        tipo: 'DESPESA',
        ativa: true,
        criadoEm: '2026-10-31T00:00:00',
        atualizadoEm: '2026-10-31T00:00:00',
      },
      {
        id: 'cat-rec',
        nome: 'Salário',
        descricao: null,
        corHex: '#10B981',
        tipo: 'RECEITA',
        ativa: true,
        criadoEm: '2026-10-31T00:00:00',
        atualizadoEm: '2026-10-31T00:00:00',
      },
    ]);

    component.lancamentoForm.patchValue({
      descricao: 'Notebook Dell XPS 15 Workstation',
      valorInformado: 6500,
      modoValor: 'VALOR_TOTAL',
      totalParcelas: 10,
      periodicidade: 'MENSAL',
      primeiraParcelaPaga: true,
    });

    expect(component.categoriasCompativeis().length).toBe(1);
    expect(component.categoriasCompativeis()[0].nome).toBe('Equipamentos & Tecnologia');
    expect(component.previa().valorTotalConsolidado).toBe(6500);
    expect(component.previa().valorPrimeiraParcela).toBe(650);
    expect(component.previa().percentualPago).toBe(10);
  });

  it('BUG-001: deve permitir salvar lançamento Única tipo RECEITA após alternar de Parcelada', () => {
    const fixture = TestBed.createComponent(NovoLancamentoPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne('/api/v1/contas').flush([
      {
        id: 'conta-1',
        nome: 'Conta Corrente',
        instituicao: 'Banco',
        tipo: 'CONTA_CORRENTE',
        saldoInicial: 0,
        ativa: true,
        criadoEm: '2026-10-31T00:00:00',
        atualizadoEm: '2026-10-31T00:00:00',
      },
    ]);

    httpMock.expectOne('/api/v1/categorias').flush([
      {
        id: 'cat-rec',
        nome: 'Salário',
        descricao: null,
        corHex: '#10B981',
        tipo: 'RECEITA',
        ativa: true,
        criadoEm: '2026-10-31T00:00:00',
        atualizadoEm: '2026-10-31T00:00:00',
      },
    ]);

    // Fluxo real do usuário: página abre em PARCELADA -> usuário seleciona Única -> Receita
    component.selecionarModalidade('UNICA');
    component.definirTipoTransacao('RECEITA');

    component.lancamentoForm.patchValue({
      descricao: 'Salário de novembro',
      valorInformado: 5000,
    });

    const totalParcelas = component.lancamentoForm.controls.totalParcelas;
    expect(totalParcelas.value).toBe(1);
    expect(totalParcelas.errors).toBeNull();
    expect(component.lancamentoForm.controls.categoriaId.value).toBe('cat-rec');
    expect(component.lancamentoForm.valid).toBe(true);
  });
});
