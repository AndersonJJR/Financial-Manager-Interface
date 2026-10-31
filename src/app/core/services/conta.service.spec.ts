import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContaResponse } from '../models/conta.model';
import { ContaService } from './conta.service';

describe('ContaService', () => {
  let service: ContaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar contas via GET /api/v1/contas e criar conta via POST /api/v1/contas', () => {
    const contaMock: ContaResponse = {
      id: 'c1',
      nome: 'Nubank Principal',
      instituicao: 'Nubank',
      tipo: 'CONTA_CORRENTE',
      saldoInicial: 1500,
      ativa: true,
      criadoEm: '2026-10-31T10:00:00',
      atualizadoEm: '2026-10-31T10:00:00',
    };

    service.listarTodas().subscribe((contas) => {
      expect(contas.length).toBe(1);
      expect(contas[0].nome).toBe('Nubank Principal');
    });

    const getReq = httpMock.expectOne('/api/v1/contas');
    expect(getReq.request.method).toBe('GET');
    getReq.flush([contaMock]);

    service
      .criar({
        nome: 'Nubank Principal',
        instituicao: 'Nubank',
        tipo: 'CONTA_CORRENTE',
        saldoInicial: 1500,
        ativa: true,
      })
      .subscribe((criada) => {
        expect(criada.id).toBe('c1');
      });

    const postReq = httpMock.expectOne('/api/v1/contas');
    expect(postReq.request.method).toBe('POST');
    postReq.flush(contaMock);
  });
});
