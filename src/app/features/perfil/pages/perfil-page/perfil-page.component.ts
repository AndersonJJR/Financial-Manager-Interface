import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  template: `
    <div class="perfil-container">
      <div class="page-header">
        <div>
          <div class="module-badge">
            <span class="badge-dot"></span>
            <span class="font-mono">SEGURANÇA & IDENTIDADE</span>
          </div>
          <h1 class="page-title font-headline">Perfil do Usuário</h1>
          <p class="page-subtitle">
            Dados sincronizados em tempo real via SecurityContext JWT stateless.
          </p>
        </div>

        <button
          type="button"
          class="btn-secondary"
          (click)="sincronizarPerfil()"
          [disabled]="carregando()"
        >
          <span class="material-symbols-outlined">sync</span>
          <span>{{ carregando() ? 'Sincronizando...' : 'Atualizar dados' }}</span>
        </button>
      </div>

      @if (authService.usuarioAtual(); as usuario) {
        <div class="profile-card">
          <div class="profile-top">
            <div class="avatar-large">
              {{ usuario.nome.slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <h2 class="profile-name font-headline">{{ usuario.nome }}</h2>
              <p class="profile-email">{{ usuario.email }}</p>
              <div class="profile-badges">
                <span class="status-pill status-active">
                  <span class="dot"></span>
                  {{ usuario.ativo ? 'Conta Ativa' : 'Conta Inativa' }}
                </span>
                <span class="role-pill font-mono">{{ usuario.role }}</span>
              </div>
            </div>
          </div>

          <div class="profile-grid">
            <div class="info-box">
              <span class="info-label">Identificador Único (UUID)</span>
              <span class="info-value font-mono">{{ usuario.id }}</span>
            </div>
            <div class="info-box">
              <span class="info-label">E-mail de Autenticação</span>
              <span class="info-value">{{ usuario.email }}</span>
            </div>
            <div class="info-box">
              <span class="info-label">Perfil de Acesso</span>
              <span class="info-value font-mono">{{ usuario.role }}</span>
            </div>
            <div class="info-box">
              <span class="info-label">Isolamento Multiusuário</span>
              <span class="info-value text-tertiary">Ativo (Propriedade verificada na API)</span>
            </div>
          </div>

          <div class="profile-footer">
            <button type="button" class="logout-action-btn" (click)="authService.logout(true)">
              <span class="material-symbols-outlined">logout</span>
              <span>Encerrar sessão atual</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .perfil-container {
        max-width: 56rem;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .page-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .module-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.6875rem;
        color: var(--on-surface-variant);
        margin-bottom: 0.25rem;
      }

      .badge-dot {
        width: 0.375rem;
        height: 0.375rem;
        border-radius: var(--radius-full);
        background-color: var(--primary);
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 600;
      }

      .page-subtitle {
        font-size: 0.8125rem;
        color: var(--on-surface-variant);
        margin-top: 0.25rem;
      }

      .profile-card {
        background-color: var(--surface-container);
        border: 1px solid var(--outline-variant);
        border-radius: var(--radius-xl);
        padding: 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .profile-top {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--outline-variant);
      }

      .avatar-large {
        width: 4rem;
        height: 4rem;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--primary-container), var(--surface-container-highest));
        border: 1px solid var(--outline-variant);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--on-surface);
      }

      .profile-name {
        font-size: 1.25rem;
        font-weight: 600;
      }

      .profile-email {
        font-size: 0.8125rem;
        color: var(--on-surface-variant);
        margin-top: 0.125rem;
      }

      .profile-badges {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.625rem;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.2rem 0.625rem;
        border-radius: var(--radius-full);
        font-size: 0.6875rem;
        font-weight: 500;
        background-color: rgba(6, 95, 70, 0.35);
        color: var(--tertiary);
      }

      .status-pill .dot {
        width: 0.375rem;
        height: 0.375rem;
        border-radius: var(--radius-full);
        background-color: var(--tertiary);
      }

      .role-pill {
        padding: 0.2rem 0.625rem;
        border-radius: var(--radius-md);
        font-size: 0.6875rem;
        background-color: var(--surface-container-highest);
        color: var(--secondary-fixed);
      }

      .profile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        gap: 1rem;
      }

      .info-box {
        background-color: var(--surface-container-low);
        border: 1px solid var(--outline-variant);
        border-radius: var(--radius-lg);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .info-label {
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--on-surface-variant);
      }

      .info-value {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--on-surface);
        word-break: break-all;
      }

      .text-tertiary {
        color: var(--tertiary);
      }

      .profile-footer {
        padding-top: 1rem;
        border-top: 1px solid var(--outline-variant);
        display: flex;
        justify-content: flex-end;
      }

      .logout-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 1rem;
        border-radius: var(--radius-lg);
        background-color: var(--error-container);
        color: var(--on-error-container);
        font-size: 0.8125rem;
        font-weight: 500;
      }
    `,
  ],
})
export class PerfilPageComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  readonly carregando = signal(false);

  ngOnInit(): void {
    this.sincronizarPerfil(false);
  }

  sincronizarPerfil(notificar = true): void {
    this.carregando.set(true);
    this.authService.obterPerfil().subscribe({
      next: () => {
        this.carregando.set(false);
        if (notificar) {
          this.notification.sucesso('Dados do perfil sincronizados com sucesso.');
        }
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }
}
