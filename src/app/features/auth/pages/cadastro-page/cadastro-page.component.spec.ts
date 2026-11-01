import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CadastroPageComponent } from './cadastro-page.component';

describe('CadastroPageComponent', () => {
  let component: CadastroPageComponent;
  let fixture: ComponentFixture<CadastroPageComponent>;

  const authServiceMock = {
    registrar: vi.fn(),
  };

  const notificationServiceMock = {
    sucesso: vi.fn(),
    erro: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CadastroPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve instanciar o componente de cadastro com estado inicial inválido', () => {
    expect(component).toBeTruthy();
    expect(component.cadastroForm.invalid).toBe(true);
    expect(component.passwordMinLengthMet()).toBe(false);
    expect(component.passwordMatchStatus()).toBe('idle');
  });

  it('deve atualizar os indicadores em tempo real de tamanho mínimo e confirmação de senha', () => {
    component.cadastroForm.patchValue({
      senha: '123456',
      confirmarSenha: '123',
    });
    expect(component.passwordMinLengthMet()).toBe(true);
    expect(component.passwordMatchStatus()).toBe('mismatch');
    expect(component.passwordMatchLabel()).toBe('Senhas não coincidem');

    component.cadastroForm.patchValue({
      confirmarSenha: '123456',
    });
    expect(component.passwordMatchStatus()).toBe('match');
    expect(component.passwordMatchLabel()).toBe('Senhas conferem');
  });

  it('deve impedir envio caso os termos de uso não sejam aceitos', () => {
    component.cadastroForm.setValue({
      nome: 'Mariana Silva',
      email: 'mariana@email.com',
      senha: 'password123',
      confirmarSenha: 'password123',
      aceitouTermos: false,
    });

    component.submitCadastro();

    expect(authServiceMock.registrar).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('aceite os termos de uso');
  });

  it('deve enviar apenas { nome, email, senha } para AuthService.registrar e redirecionar para /visao-geral', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    authServiceMock.registrar.mockReturnValue(
      of({
        token: 'jwt-token',
        tipoToken: 'Bearer',
        expiraEmSegundos: 86400,
        usuario: {
          id: 2,
          nome: 'Mariana Silva',
          email: 'mariana@email.com',
          criadoEm: '2026-10-31T12:00:00',
        },
      })
    );

    component.cadastroForm.setValue({
      nome: '  Mariana Silva  ',
      email: '  mariana@email.com  ',
      senha: 'password123',
      confirmarSenha: 'password123',
      aceitouTermos: true,
    });

    component.submitCadastro();

    expect(authServiceMock.registrar).toHaveBeenCalledWith({
      nome: 'Mariana Silva',
      email: 'mariana@email.com',
      senha: 'password123',
    });
    expect(notificationServiceMock.sucesso).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith('/visao-geral');
  });
});
