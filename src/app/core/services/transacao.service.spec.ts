import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ResumoMensalResponse } from '../models/transacao.model';
import { TransacaoService } from './transacao.service';

describe('TransacaoService', () => {
  let service: TransacaoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TransacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve consultar o resumo mensal via GET /api/v1/transacoes/resumo-mensal?ano=2026&mes=10', () => {
    const mockResumo: ResumoMensalResponse = {
      ano: 2026,
      mes: 10,
      totalEntradasRealizadas: 8450,
      totalEntradasPrevistas: 10200,
      totalSaidasPagas: 4310.25,
      totalSaidasPrevistas: 1840.5,
      totalSaidasConsolidado: 6150.75,
      saldoLiquidoRealizado: 4139.75,
      saldoLiquidoPrevisto: 4049.25,
      gastosPorCategoria: [],
    };

    service.obterResumoMensal(2026, 10).subscribe((resumo) => {
      expect(resumo.totalSaidasConsolidado).toBe(6150.75);
      expect(resumo.saldoLiquidoRealizado).toBe(4139.75);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/v1/transacoes/resumo-mensal' &&
        r.params.get('ano') === '2026' &&
        r.params.get('mes') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResumo);
  });

  it('deve efetivar lançamento pendente via PATCH /api/v1/transacoes/{id}/efetivar', () => {
    service.efetivar('tx-123', '2026-10-31').subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/v1/transacoes/tx-123/efetivar' &&
        r.params.get('dataPagamento') === '2026-10-31'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
