import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  const authServiceMock = {
    login: vi.fn(),
  };

  const notificationServiceMock = {
    sucesso: vi.fn(),
    erro: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve instanciar o componente de login com formulário inicialmente inválido', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.invalid).toBe(true);
  });

  it('deve alternar a visibilidade da senha ao acionar togglePasswordVisibility', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(false);
  });

  it('deve impedir o envio quando o formulário for inválido e exibir mensagem de erro', () => {
    component.submitLogin();
    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('Verifique suas credenciais');
  });

  it('deve autenticar com sucesso e redirecionar para /visao-geral', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    authServiceMock.login.mockReturnValue(
      of({
        token: 'jwt-token',
        tipoToken: 'Bearer',
        expiraEmSegundos: 86400,
        usuario: {
          id: 1,
          nome: 'Anderson Silva',
          email: 'anderson@email.com',
          criadoEm: '2026-10-31T10:00:00',
        },
      })
    );

    component.loginForm.setValue({
      email: 'anderson@email.com',
      senha: 'password123',
    });

    component.submitLogin();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'anderson@email.com',
      senha: 'password123',
    });
    expect(component.authSuccess()).toBe(true);
    expect(notificationServiceMock.sucesso).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith('/visao-geral');
  });

  it('deve exibir erro retornado pelo backend quando as credenciais falharem', () => {
    authServiceMock.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: {
              detail: 'E-mail ou senha inválidos.',
              errors: [{ campo: 'email', mensagem: 'Credencial não reconhecida' }],
            },
          })
      )
    );

    component.loginForm.setValue({
      email: 'invalido@email.com',
      senha: 'wrongpass',
    });

    component.submitLogin();

    expect(component.errorMessage()).toContain('Credencial não reconhecida');
    expect(component.getFieldError('email')).toBe('Credencial não reconhecida');
  });
});
