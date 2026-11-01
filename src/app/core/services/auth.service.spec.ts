import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TokenResponse } from '../models/auth.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageService: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve autenticar no endpoint POST /api/v1/auth/login e persistir token e usuário', () => {
    const mockResponse: TokenResponse = {
      token: 'jwt-token-valido',
      tipo: 'Bearer',
      expiraEm: '2026-11-01T22:00:00Z',
      usuario: {
        id: '11111111-1111-1111-1111-111111111111',
        nome: 'Anderson Silva',
        email: 'anderson@example.com',
        role: 'ROLE_USER',
        ativo: true,
        criadoEm: null,
      },
    };

    service.login({ email: 'anderson@example.com', senha: '123456' }).subscribe((res) => {
      expect(res.token).toBe('jwt-token-valido');
      expect(service.estaAutenticado()).toBe(true);
      expect(service.usuarioAtual()?.nome).toBe('Anderson Silva');
      expect(storageService.obterToken()).toBe('jwt-token-valido');
    });

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'anderson@example.com', senha: '123456' });
    req.flush(mockResponse);
  });

  it('deve limpar sessão ao realizar logout', () => {
    storageService.salvarToken('token-temp');
    service.logout(false);
    expect(service.estaAutenticado()).toBe(false);
    expect(storageService.obterToken()).toBeNull();
  });

  it('deve atualizar o perfil no endpoint PUT /api/v1/auth/me e sincronizar usuarioSignal', () => {
    const usuarioAtualizado = {
      id: '11111111-1111-1111-1111-111111111111',
      nome: 'Mariana Silva Atualizada',
      email: 'mariana@email.com',
      role: 'ROLE_USER' as const,
      ativo: true,
      criadoEm: '2026-03-14T09:42:00',
    };

    service.atualizarPerfil({ nome: 'Mariana Silva Atualizada' }).subscribe((res) => {
      expect(res.nome).toBe('Mariana Silva Atualizada');
      expect(service.usuarioAtual()?.nome).toBe('Mariana Silva Atualizada');
      expect(storageService.obterUsuario()?.nome).toBe('Mariana Silva Atualizada');
    });

    const req = httpMock.expectOne('/api/v1/auth/me');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nome: 'Mariana Silva Atualizada' });
    req.flush(usuarioAtualizado);
  });
});
