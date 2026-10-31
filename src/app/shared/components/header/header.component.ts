import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PeriodoService } from '../../../core/services/periodo.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="topbar">
      <div class="period-wrapper">
        <button
          type="button"
          class="period-pill"
          (click)="alternarMenuPeriodo()"
          aria-label="Selecionar período de referência"
        >
          <span class="material-symbols-outlined icon-calendar">calendar_today</span>
          <span>{{ periodoService.labelCurto() }}</span>
          <span class="material-symbols-outlined icon-chevron">expand_more</span>
        </button>

        @if (menuPeriodoAberto()) {
          <div class="period-popover" role="dialog" aria-label="Navegação rápida de mês">
            <div class="popover-nav">
              <button
                type="button"
                class="popover-step-btn"
                (click)="periodoService.mesAnterior()"
                title="Mês anterior"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <span class="popover-current">{{ periodoService.labelExtenso() }}</span>
              <button
                type="button"
                class="popover-step-btn"
                (click)="periodoService.proximoMes()"
                title="Próximo mês"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <div class="popover-footer">
              <button type="button" class="popover-today-btn" (click)="irParaMesAtual()">
                Mês atual
              </button>
              <button type="button" class="popover-close-btn" (click)="fecharMenuPeriodo()">
                Fechar
              </button>
            </div>
          </div>
        }
      </div>

      <div class="topbar-actions">
        <a routerLink="/novo-lancamento" class="header-new-btn">
          <span class="material-symbols-outlined icon-add">add</span>
          <span>Novo lançamento</span>
        </a>

        <div class="vertical-divider"></div>

        <a routerLink="/perfil" class="user-profile" title="Ver perfil">
          <div class="user-meta">
            <p class="user-name">{{ nomeUsuario() }}</p>
            <p class="user-email">{{ emailUsuario() }}</p>
          </div>
          <div class="user-avatar" aria-hidden="true">
            {{ iniciaisUsuario() }}
          </div>
        </a>
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        position: fixed;
        top: 0;
        left: 16rem;
        right: 0;
        height: 4rem;
        background-color: rgba(12, 12, 15, 0.82);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--outline-variant);
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
      }

      .period-wrapper {
        position: relative;
      }

      .period-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border-radius: var(--radius-lg);
        background-color: var(--surface-container);
        border: 1px solid var(--outline-variant);
        color: var(--on-surface);
        font-size: 0.875rem;
        font-weight: 500;
        transition: background-color 150ms ease;
      }

      .period-pill:hover {
        background-color: var(--surface-container-high);
      }

      .icon-calendar {
        font-size: 1rem;
        color: var(--tertiary);
      }

      .icon-chevron {
        font-size: 1rem;
        color: var(--secondary);
      }

      .period-popover {
        position: absolute;
        top: calc(100% + 0.5rem);
        left: 0;
        min-width: 15rem;
        background-color: var(--surface-container-high);
        border: 1px solid var(--outline-variant);
        border-radius: var(--radius-xl);
        padding: 0.75rem;
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.55);
        z-index: 50;
      }

      .popover-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .popover-step-btn {
        padding: 0.25rem;
        border-radius: var(--radius-md);
        color: var(--on-surface-variant);
      }

      .popover-step-btn:hover {
        background-color: var(--surface-container-highest);
        color: var(--on-surface);
      }

      .popover-current {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--on-surface);
      }

      .popover-footer {
        margin-top: 0.625rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--outline-variant);
        display: flex;
        justify-content: space-between;
      }

      .popover-today-btn {
        font-size: 0.75rem;
        color: var(--primary);
        font-weight: 500;
      }

      .popover-close-btn {
        font-size: 0.75rem;
        color: var(--on-surface-variant);
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .header-new-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.875rem;
        border-radius: var(--radius-lg);
        background-color: var(--surface-container);
        border: 1px solid var(--outline-variant);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--on-surface);
        transition: background-color 150ms ease;
      }

      .header-new-btn:hover {
        background-color: var(--surface-container-high);
      }

      .icon-add {
        font-size: 1rem;
        color: var(--primary);
      }

      .vertical-divider {
        height: 1.25rem;
        width: 1px;
        background-color: var(--outline-variant);
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-left: 0.25rem;
      }

      .user-meta {
        text-align: right;
      }

      .user-name {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--on-surface);
      }

      .user-email {
        font-size: 0.6875rem;
        color: var(--on-surface-variant);
      }

      .user-avatar {
        width: 2rem;
        height: 2rem;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--primary-container), var(--surface-container-highest));
        border: 1px solid var(--outline-variant);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--on-surface);
      }
    `,
  ],
})
export class HeaderComponent {
  readonly periodoService = inject(PeriodoService);
  private readonly authService = inject(AuthService);

  readonly menuPeriodoAberto = signal(false);

  readonly nomeUsuario = computed(() => this.authService.usuarioAtual()?.nome ?? 'Usuário');
  readonly emailUsuario = computed(() => this.authService.usuarioAtual()?.email ?? '');
  readonly iniciaisUsuario = computed(() => {
    const nome = this.nomeUsuario().trim();
    if (!nome) {
      return 'U';
    }
    const partes = nome.split(/\s+/);
    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }
    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
  });

  alternarMenuPeriodo(): void {
    this.menuPeriodoAberto.update((v) => !v);
  }

  fecharMenuPeriodo(): void {
    this.menuPeriodoAberto.set(false);
  }

  irParaMesAtual(): void {
    const agora = new Date();
    this.periodoService.definirPeriodo(agora.getFullYear(), agora.getMonth() + 1);
    this.fecharMenuPeriodo();
  }
}
