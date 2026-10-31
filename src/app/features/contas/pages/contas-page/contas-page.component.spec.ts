import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContasPageComponent } from './contas-page.component';

describe('ContasPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContasPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve carregar contas da API, calcular a base inicial consolidada e filtrar por status', () => {
    const fixture = TestBed.createComponent(ContasPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/v1/contas');
    req.flush([
      {
        id: '1',
        nome: 'Nubank Principal',
        instituicao: 'Nubank',
        tipo: 'CONTA_CORRENTE',
        saldoInicial: 1500,
        ativa: true,
        criadoEm: '2026-10-31T00:00:00',
        atualizadoEm: '2026-10-31T00:00:00',
      },
      {
        id: '2',
        nome: 'Carteira Antiga',
        instituicao: 'Carteira',
        tipo: 'CARTEIRA',
        saldoInicial: 50,
        ativa: false,
        criadoEm: '2026-10-31T00:00:00',
        atualizadoEm: '2026-10-31T00:00:00',
      },
    ]);

    expect(component.totalContasCount()).toBe(2);
    expect(component.contasAtivasCount()).toBe(1);
    expect(component.contasInativasCount()).toBe(1);
    expect(component.baseInicialConsolidada()).toBe(1500);

    component.selecionarFiltro('inactive');
    expect(component.contasFiltradas().length).toBe(1);
    expect(component.contasFiltradas()[0].nome).toBe('Carteira Antiga');
  });
});
