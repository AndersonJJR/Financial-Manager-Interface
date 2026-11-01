import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { extrairMensagemErroApi } from '../../../../core/interceptors/error.interceptor';
import { ApiErrorResponse } from '../../../../core/models/api-error.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinancialValidators } from '../../../../core/validators/financial.validators';

@Component({
  selector: 'app-cadastro-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro-page.component.html',
  styleUrl: './cadastro-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadastroPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});

  readonly cadastroForm = this.fb.nonNullable.group(
    {
      nome: [
        '',
        [
          Validators.required,
          FinancialValidators.notBlank(),
          FinancialValidators.trimmedSize(2, 120),
        ],
      ],
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
      confirmarSenha: ['', [Validators.required, FinancialValidators.notBlank()]],
      aceitouTermos: [false, [Validators.requiredTrue]],
    },
    {
      validators: [FinancialValidators.passwordMatch('senha', 'confirmarSenha')],
    }
  );

  private readonly formValue = toSignal(
    this.cadastroForm.valueChanges.pipe(startWith(this.cadastroForm.getRawValue())),
    { initialValue: this.cadastroForm.getRawValue() }
  );

  readonly passwordMinLengthMet = computed(() => {
    const senha = this.formValue().senha ?? '';
    return senha.length >= 6;
  });

  readonly passwordMatchStatus = computed<'idle' | 'match' | 'mismatch'>(() => {
    const senha = this.formValue().senha ?? '';
    const confirmar = this.formValue().confirmarSenha ?? '';
    if (!confirmar) {
      return 'idle';
    }
    return senha === confirmar && confirmar.length > 0 ? 'match' : 'mismatch';
  });

  readonly passwordMatchLabel = computed(() => {
    const status = this.passwordMatchStatus();
    if (status === 'match') {
      return 'Senhas conferem';
    }
    if (status === 'mismatch') {
      return 'Senhas não coincidem';
    }
    return 'Deve coincidir';
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  submitCadastro(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      if (this.cadastroForm.errors?.['passwordMismatch']) {
        this.errorMessage.set('A confirmação de senha não coincide com a senha informada.');
      } else if (this.cadastroForm.controls.aceitouTermos.invalid) {
        this.errorMessage.set(
          'Para continuar, aceite os termos de uso e política de privacidade do FinancialManager.'
        );
      } else {
        this.errorMessage.set('Preencha todos os campos obrigatórios corretamente.');
      }
      return;
    }

    this.loading.set(true);
    const raw = this.cadastroForm.getRawValue();

    this.authService
      .registrar({
        nome: raw.nome.trim(),
        email: raw.email.trim(),
        senha: raw.senha,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.notificationService.sucesso(
            `Conta criada com sucesso! Bem-vindo(a), ${res.usuario.nome}.`
          );
          this.router.navigateByUrl('/visao-geral');
        },
        error: (err: unknown) => {
          this.loading.set(false);
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

  hasFieldError(controlName: 'nome' | 'email' | 'senha' | 'confirmarSenha'): boolean {
    const control = this.cadastroForm.get(controlName);
    if (
      controlName === 'confirmarSenha' &&
      (control?.dirty || control?.touched) &&
      this.cadastroForm.errors?.['passwordMismatch']
    ) {
      return true;
    }
    return Boolean(
      (control && control.invalid && (control.dirty || control.touched)) ||
        this.fieldErrors()[controlName]
    );
  }

  isFieldValid(controlName: 'nome' | 'email' | 'senha' | 'confirmarSenha'): boolean {
    const control = this.cadastroForm.get(controlName);
    if (controlName === 'confirmarSenha' && this.cadastroForm.errors?.['passwordMismatch']) {
      return false;
    }
    return Boolean(
      control &&
        control.valid &&
        (control.dirty || control.touched) &&
        !this.fieldErrors()[controlName]
    );
  }

  getFieldError(controlName: 'nome' | 'email' | 'senha' | 'confirmarSenha'): string | null {
    const backendError = this.fieldErrors()[controlName];
    if (backendError) {
      return backendError;
    }

    const control = this.cadastroForm.get(controlName);
    if (!control || !(control.dirty || control.touched)) {
      return null;
    }

    if (controlName === 'confirmarSenha' && this.cadastroForm.errors?.['passwordMismatch']) {
      return 'As senhas não coincidem.';
    }

    if (!control.errors) {
      return null;
    }

    if (control.errors['required'] || control.errors['notBlank']) {
      return 'Este campo é obrigatório.';
    }
    if (control.errors['email']) {
      return 'Informe um endereço de e-mail válido.';
    }
    if (control.errors['trimmedSize']) {
      return control.errors['trimmedSize'].message;
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
