import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VisaoGeralPageComponent } from './visao-geral-page.component';

describe('VisaoGeralPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisaoGeralPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve carregar o resumo mensal e os últimos lançamentos da API e calcular segmentos do Donut SVG', () => {
    const fixture = TestBed.createComponent(VisaoGeralPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const resumoReq = httpMock.expectOne((r) => r.url === '/api/v1/transacoes/resumo-mensal');
    resumoReq.flush({
      ano: 2026,
      mes: 10,
      totalEntradasRealizadas: 8450,
      totalEntradasPrevistas: 10200,
      totalSaidasPagas: 4310.25,
      totalSaidasPrevistas: 1840.5,
      totalSaidasConsolidado: 6150.75,
      saldoLiquidoRealizado: 4139.75,
      saldoLiquidoPrevisto: 4049.25,
      gastosPorCategoria: [
        {
          categoriaId: 'cat-1',
          categoriaNome: 'Moradia',
          corHex: '#6366f1',
          valorNominal: 2400,
          percentual: 39.02,
          quantidadeTransacoes: 4,
        },
        {
          categoriaId: 'cat-2',
          categoriaNome: 'Alimentação',
          corHex: '#f59e0b',
          valorNominal: 1520.3,
          percentual: 24.72,
          quantidadeTransacoes: 18,
        },
      ],
    });

    const txReq = httpMock.expectOne((r) => r.url === '/api/v1/transacoes');
    txReq.flush([
      {
        id: 'tx-1',
        descricao: 'Salário TechCorp',
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
        contaNome: 'Conta Corrente Itaú',
        categoriaId: 'cat-sal',
        categoriaNome: 'Salário',
        criadoEm: '2026-10-05T00:00:00',
        atualizadoEm: '2026-10-05T00:00:00',
      },
    ]);

    expect(component.segmentosDonut().length).toBe(2);
    expect(component.maiorCategoria()?.categoriaNome).toBe('Moradia');
    expect(component.ultimosLancamentos().length).toBe(1);
    expect(component.ultimosLancamentos()[0].descricao).toBe('Salário TechCorp');
  });
});
