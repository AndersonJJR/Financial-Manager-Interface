import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { extrairMensagemErroApi } from '../../../../core/interceptors/error.interceptor';
import { ApiErrorResponse } from '../../../../core/models/api-error.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinancialValidators } from '../../../../core/validators/financial.validators';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly authSuccess = signal<boolean>(false);
  readonly fieldErrors = signal<Record<string, string>>({});

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        FinancialValidators.notBlank(),
        FinancialValidators.trimmedEmail(),
        Validators.maxLength(160),
      ],
    ],
    senha: [
      '',
      [
        Validators.required,
        FinancialValidators.notBlank(),
        Validators.minLength(6),
        Validators.maxLength(100),
      ],
    ],
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  submitLogin(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set(
        'Verifique suas credenciais. Informe um e-mail válido e senha entre 6 e 100 caracteres.'
      );
      return;
    }

    this.loading.set(true);
    const raw = this.loginForm.getRawValue();

    this.authService
      .login({
        email: raw.email.trim(),
        senha: raw.senha,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.authSuccess.set(true);
          this.notificationService.sucesso(`Bem-vindo de volta, ${res.usuario.nome}!`);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/visao-geral';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.authSuccess.set(false);
          this.errorMessage.set(extrairMensagemErroApi(err));

          if (err instanceof HttpErrorResponse) {
            const body = err.error as Partial<ApiErrorResponse> | null;
            if (body && Array.isArray(body.errors)) {
              const map: Record<string, string> = {};
              for (const item of body.errors) {
                map[item.campo] = item.mensagem;
              }
              this.fieldErrors.set(map);
            }
          }
        },
      });
  }

  hasFieldError(controlName: 'email' | 'senha'): boolean {
    const control = this.loginForm.get(controlName);
    return Boolean(
      (control && control.invalid && (control.dirty || control.touched)) ||
        this.fieldErrors()[controlName]
    );
  }

  isFieldValid(controlName: 'email' | 'senha'): boolean {
    const control = this.loginForm.get(controlName);
    return Boolean(
      control &&
        control.valid &&
        (control.dirty || control.touched) &&
        !this.fieldErrors()[controlName]
    );
  }

  getFieldError(controlName: 'email' | 'senha'): string | null {
    const backendError = this.fieldErrors()[controlName];
    if (backendError) {
      return backendError;
    }

    const control = this.loginForm.get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return null;
    }

    if (control.errors['required'] || control.errors['notBlank']) {
      return 'Este campo é obrigatório.';
    }
    if (control.errors['email']) {
      return 'Informe um endereço de e-mail válido.';
    }
    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    return 'Valor inválido.';
  }
}
