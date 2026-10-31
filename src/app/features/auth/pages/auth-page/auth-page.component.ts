import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinancialValidators } from '../../../../core/validators/financial.validators';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ReactiveFormsModule, ToastComponent],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="auth-logo">FM</div>
          <div>
            <h1 class="auth-title font-headline">FinancialManager</h1>
            <p class="auth-subtitle">Gestão financeira pessoal de alta precisão</p>
          </div>
        </div>

        <div class="mode-switch">
          <button
            type="button"
            class="mode-btn"
            [class.mode-btn-active]="modo() === 'login'"
            (click)="alternarModo('login')"
          >
            Entrar na conta
          </button>
          <button
            type="button"
            class="mode-btn"
            [class.mode-btn-active]="modo() === 'registro'"
            (click)="alternarModo('registro')"
          >
            Criar conta
          </button>
        </div>

        @if (modo() === 'login') {
          <form [formGroup]="loginForm" (ngSubmit)="submeterLogin()" class="auth-form" novalidate>
            <div class="form-group">
              <label for="login-email" class="form-label">E-mail <span class="req">*</span></label>
              <input
                id="login-email"
                type="email"
                formControlName="email"
                class="obsidian-input"
                placeholder="seu@email.com"
                autocomplete="email"
              />
              @if (loginForm.controls.email.touched && loginForm.controls.email.invalid) {
                <p class="field-error-text">Informe um endereço de e-mail válido.</p>
              }
            </div>

            <div class="form-group">
              <label for="login-senha" class="form-label">Senha <span class="req">*</span></label>
              <input
                id="login-senha"
                type="password"
                formControlName="senha"
                class="obsidian-input"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              @if (loginForm.controls.senha.touched && loginForm.controls.senha.invalid) {
                <p class="field-error-text">A senha é obrigatória.</p>
              }
            </div>

            <button
              type="submit"
              class="btn-primary auth-submit-btn"
              [disabled]="carregando()"
            >
              <span class="material-symbols-outlined">login</span>
              <span>{{ carregando() ? 'Autenticando...' : 'Acessar painel' }}</span>
            </button>
          </form>
        } @else {
          <form
            [formGroup]="registroForm"
            (ngSubmit)="submeterRegistro()"
            class="auth-form"
            novalidate
          >
            <div class="form-group">
              <label for="reg-nome" class="form-label">
                Nome completo <span class="req">*</span>
              </label>
              <input
                id="reg-nome"
                type="text"
                formControlName="nome"
                class="obsidian-input"
                placeholder="Ex: Mariana Silva"
                maxlength="120"
              />
              @if (registroForm.controls.nome.touched && registroForm.controls.nome.invalid) {
                <p class="field-error-text">O nome deve ter entre 2 e 120 caracteres.</p>
              }
            </div>

            <div class="form-group">
              <label for="reg-email" class="form-label">E-mail <span class="req">*</span></label>
              <input
                id="reg-email"
                type="email"
                formControlName="email"
                class="obsidian-input"
                placeholder="mariana@email.com"
                maxlength="150"
              />
              @if (registroForm.controls.email.touched && registroForm.controls.email.invalid) {
                <p class="field-error-text">Informe um e-mail válido (máx. 150 caracteres).</p>
              }
            </div>

            <div class="form-group">
              <label for="reg-senha" class="form-label">Senha <span class="req">*</span></label>
              <input
                id="reg-senha"
                type="password"
                formControlName="senha"
                class="obsidian-input"
                placeholder="Mínimo de 6 caracteres"
                maxlength="100"
              />
              @if (registroForm.controls.senha.touched && registroForm.controls.senha.invalid) {
                <p class="field-error-text">A senha deve conter entre 6 e 100 caracteres.</p>
              }
            </div>

            <button
              type="submit"
              class="btn-primary auth-submit-btn"
              [disabled]="carregando()"
            >
              <span class="material-symbols-outlined">person_add</span>
              <span>{{ carregando() ? 'Registrando...' : 'Criar conta e entrar' }}</span>
            </button>
          </form>
        }
      </div>
      <app-toast />
    </div>
  `,
  styles: [
    `
      .auth-wrapper {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: radial-gradient(
          circle at 50% 0%,
          rgba(167, 139, 250, 0.08) 0%,
          var(--background) 65%
        );
      }

      .auth-card {
        width: 100%;
        max-width: 26rem;
        background-color: var(--surface-container);
        border: 1px solid var(--outline-variant);
        border-radius: var(--radius-2xl);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .auth-brand {
        display: flex;
        align-items: center;
        gap: 0.875rem;
      }

      .auth-logo {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: var(--radius-lg);
        background-color: var(--surface-container-highest);
        border: 1px solid var(--outline-variant);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-mono);
        font-weight: 700;
        color: var(--primary);
      }

      .auth-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--on-surface);
      }

      .auth-subtitle {
        font-size: 0.75rem;
        color: var(--on-surface-variant);
        margin-top: 0.125rem;
      }

      .mode-switch {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 0.25rem;
        border-radius: var(--radius-xl);
        background-color: var(--surface-container-low);
        border: 1px solid var(--outline-variant);
      }

      .mode-btn {
        padding: 0.5rem;
        border-radius: var(--radius-lg);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--on-surface-variant);
        transition: all 150ms ease;
      }

      .mode-btn-active {
        background-color: var(--surface-container-high);
        color: var(--primary);
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.125rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .form-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--on-surface);
      }

      .req {
        color: var(--primary);
      }

      .auth-submit-btn {
        width: 100%;
        padding: 0.7rem 1rem;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly modo = signal<'login' | 'registro'>('login');
  readonly carregando = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [FinancialValidators.notBlank(), Validators.email]],
    senha: ['', [FinancialValidators.notBlank()]],
  });

  readonly registroForm = this.fb.nonNullable.group({
    nome: [
      '',
      [FinancialValidators.notBlank(), FinancialValidators.trimmedSize(2, 120)],
    ],
    email: [
      '',
      [
        FinancialValidators.notBlank(),
        Validators.email,
        FinancialValidators.trimmedSize(3, 150),
      ],
    ],
    senha: [
      '',
      [FinancialValidators.notBlank(), FinancialValidators.trimmedSize(6, 100)],
    ],
  });

  alternarModo(novoModo: 'login' | 'registro'): void {
    this.modo.set(novoModo);
  }

  submeterLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    const { email, senha } = this.loginForm.getRawValue();
    this.authService
      .login({ email: email.trim(), senha })
      .subscribe({
        next: (res) => {
          this.carregando.set(false);
          this.notification.sucesso(`Bem-vindo(a), ${res.usuario.nome}!`);
          void this.router.navigate(['/visao-geral']);
        },
        error: () => {
          this.carregando.set(false);
        },
      });
  }

  submeterRegistro(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    const { nome, email, senha } = this.registroForm.getRawValue();
    this.authService
      .registrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
      })
      .subscribe({
        next: (res) => {
          this.carregando.set(false);
          this.notification.sucesso(`Conta criada com sucesso para ${res.usuario.nome}!`);
          void this.router.navigate(['/visao-geral']);
        },
        error: () => {
          this.carregando.set(false);
        },
      });
  }
}
