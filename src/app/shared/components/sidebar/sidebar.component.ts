import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand-header">
          <div class="brand-logo" aria-hidden="true">
            <span class="brand-logo-text">FM</span>
          </div>
          <span class="brand-title font-headline">FinancialManager</span>
        </div>

        <div class="cta-container">
          <a routerLink="/novo-lancamento" class="cta-btn">
            <span class="material-symbols-outlined cta-icon">add</span>
            <span>Novo lançamento</span>
          </a>
        </div>

        <nav class="nav-list" aria-label="Navegação principal">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="nav-link-active"
              class="nav-link"
              [attr.data-path]="item.path.slice(1)"
            >
              <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </div>

      <div class="sidebar-footer">
        <button type="button" class="logout-btn" (click)="sair()">
          <span class="material-symbols-outlined nav-icon">logout</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        width: 16rem;
        background-color: var(--surface-container-low);
        border-right: 1px solid var(--outline-variant);
        z-index: 50;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .sidebar-top {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
      }

      .brand-header {
        height: 4rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0 1.5rem;
        border-bottom: 1px solid var(--outline-variant);
      }

      .brand-logo {
        height: 1.85rem;
        min-width: 2.5rem;
        padding: 0 0.5rem;
        border-radius: var(--radius-sm);
        background: linear-gradient(135deg, var(--surface-container-highest), var(--secondary-container));
        border: 1px solid var(--outline-variant);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .brand-logo-text {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--primary);
        letter-spacing: 0.04em;
      }

      .brand-title {
        font-weight: 600;
        font-size: 1rem;
        color: var(--on-surface);
      }

      .cta-container {
        padding: 1rem;
      }

      .cta-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.625rem 1rem;
        border-radius: var(--radius-lg);
        background-color: var(--primary);
        color: var(--on-primary);
        font-weight: 500;
        font-size: 0.875rem;
        transition: background-color 150ms ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
      }

      .cta-btn:hover {
        background-color: var(--primary-container);
        color: var(--on-primary-container);
      }

      .cta-icon {
        font-size: 1.125rem;
      }

      .nav-list {
        flex: 1;
        padding: 0 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.55rem 0.75rem;
        border-radius: var(--radius-lg);
        font-size: 0.875rem;
        color: var(--on-surface-variant);
        transition: background-color 150ms ease, color 150ms ease;
      }

      .nav-link:hover {
        color: var(--on-surface);
        background-color: var(--surface-container-high);
      }

      .nav-link-active {
        background-color: var(--surface-container-high);
        color: var(--primary);
        font-weight: 500;
      }

      .nav-link-active:hover {
        color: var(--primary);
      }

      .nav-icon {
        font-size: 1.25rem;
      }

      .sidebar-footer {
        padding: 0.75rem;
        border-top: 1px solid var(--outline-variant);
      }

      .logout-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 0.75rem;
        border-radius: var(--radius-lg);
        font-size: 0.875rem;
        color: var(--error);
        transition: background-color 150ms ease, color 150ms ease;
      }

      .logout-btn:hover {
        background-color: var(--error-container);
        color: var(--on-error-container);
      }
    `,
  ],
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  readonly navItems: readonly NavItem[] = [
    { path: '/visao-geral', label: 'Visão geral', icon: 'dashboard' },
    { path: '/lancamentos', label: 'Lançamentos', icon: 'receipt_long' },
    { path: '/contas', label: 'Contas', icon: 'account_balance_wallet' },
    { path: '/categorias', label: 'Categorias', icon: 'label' },
    { path: '/perfil', label: 'Perfil', icon: 'person' },
  ];

  sair(): void {
    this.authService.logout(true);
  }
}
