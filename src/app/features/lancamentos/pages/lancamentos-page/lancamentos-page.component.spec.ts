import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LancamentosPageComponent } from './lancamentos-page.component';

describe('LancamentosPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LancamentosPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar lançamentos e calcular métricas de receitas, despesas, saldo e pendentes', () => {
    const fixture = TestBed.createComponent(LancamentosPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne('/api/v1/contas').flush([]);
    httpMock.expectOne('/api/v1/categorias').flush([]);

    const txReq = httpMock.expectOne((r) => r.url === '/api/v1/transacoes');
    txReq.flush([
      {
        id: '1',
        descricao: 'Salário Mensal TechCorp',
        valor: 8450,
        dataCompetencia: '2026-10-05',
        dataPagamento: '2026-10-05',
        tipo: 'RECEITA',
        status: 'EFETIVADA',
        modalidade: 'UNICA',
        grupoParcelamentoId: null,
        parcelaAtual: null,
        totalParcelas: null,
        referenciaParcela: null,
        periodicidade: null,
        recorrenciaAtiva: false,
        observacao: null,
        contaId: 'c1',
        contaNome: 'Itaú Salário',
        categoriaId: 'cat1',
        categoriaNome: 'Salário',
        criadoEm: '2026-10-05T00:00:00',
        atualizadoEm: '2026-10-05T00:00:00',
      },
      {
        id: '2',
        descricao: 'Academia SmartFit',
        valor: 129.9,
        dataCompetencia: '2026-10-25',
        dataPagamento: null,
        tipo: 'DESPESA',
        status: 'PENDENTE',
        modalidade: 'RECORRENTE',
        grupoParcelamentoId: 'g1',
        parcelaAtual: 1,
        totalParcelas: 12,
        referenciaParcela: '1/12',
        periodicidade: 'MENSAL',
        recorrenciaAtiva: true,
        observacao: null,
        contaId: 'c2',
        contaNome: 'Nubank C/C',
        categoriaId: 'cat2',
        categoriaNome: 'Saúde',
        criadoEm: '2026-10-25T00:00:00',
        atualizadoEm: '2026-10-25T00:00:00',
      },
    ]);

    expect(component.receitasFiltradasValor()).toBe(8450);
    expect(component.despesasFiltradasValor()).toBe(129.9);
    expect(component.pendentesAPagarValor()).toBe(129.9);
    expect(component.pendentesAPagarCount()).toBe(1);
    expect(component.saldoPeriodoFiltrado()).toBeCloseTo(8320.1, 2);
  });
});
