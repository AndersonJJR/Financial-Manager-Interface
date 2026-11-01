import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PeriodoService } from '../../../../core/services/periodo.service';
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

  describe('BUG-002 / FIX-002 — filtro de Competência deve preservar a data escolhida', () => {
    const drainRequests = () => {
      httpMock.match((r) => r.url === '/api/v1/contas').forEach((r) => r.flush([]));
      httpMock.match((r) => r.url === '/api/v1/categorias').forEach((r) => r.flush([]));
      httpMock.match((r) => r.url === '/api/v1/transacoes').forEach((r) => r.flush([]));
    };

    it('deve manter a Data inicial alterada no popover de Competência (não reverter ao mês global)', () => {
      const fixture = TestBed.createComponent(LancamentosPageComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      drainRequests();

      // Usuário escolhe 15/10/2026 na Data inicial
      component.atualizarDataInicio('2026-10-15');
      fixture.detectChanges();
      drainRequests(); // nenhuma nova requisição deve existir

      expect(component.dataInicioFiltro()).toBe('2026-10-15');
    });

    it('deve manter o intervalo de datas ao alterar outros filtros (Tipo)', () => {
      const fixture = TestBed.createComponent(LancamentosPageComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      drainRequests();

      component.atualizarDataInicio('2026-10-15');
      component.atualizarDataFim('2026-10-20');
      component.alterarFiltroTipo('RECEITA');
      fixture.detectChanges();
      drainRequests(); // drena a requisição de recarga disparada por alterarFiltroTipo

      expect(component.dataInicioFiltro()).toBe('2026-10-15');
      expect(component.dataFimFiltro()).toBe('2026-10-20');
      expect(component.filtroTipo()).toBe('RECEITA');
    });

    it('deve sincronizar o intervalo com o PeriodoService quando a competência global muda', () => {
      const fixture = TestBed.createComponent(LancamentosPageComponent);
      const component = fixture.componentInstance;
      const periodo = TestBed.inject(PeriodoService);
      fixture.detectChanges();
      drainRequests();

      // Comportamento esperado pela intenção original do effect: ao trocar a
      // competência no Header, o intervalo do filtro é regravado com o novo mês.
      component.atualizarDataInicio('2026-10-15');
      periodo.mesAnterior();
      fixture.detectChanges();
      drainRequests(); // drena a requisição de recarga disparada pelo effect

      expect(component.dataInicioFiltro()).toBe(periodo.dataInicioMes());
      expect(component.dataFimFiltro()).toBe(periodo.dataFimMes());
    });
  });
});
