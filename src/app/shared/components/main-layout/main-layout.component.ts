import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  template: `
    <app-sidebar />
    <div class="layout-shell">
      <app-header />
      <main class="layout-main">
        <router-outlet />
      </main>
    </div>
    <app-toast />
  `,
  styles: [
    `
      .layout-shell {
        padding-left: 16rem;
      }

      .layout-main {
        width: 100%;
        padding-top: 6rem;
        padding-bottom: 2rem;
        padding-left: 2rem;
        padding-right: 2rem;
        min-height: 100vh;
        background-color: var(--background);
      }
    `,
  ],
})
export class MainLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    if (this.authService.estaAutenticado() && !this.authService.usuarioAtual()) {
      this.authService.obterPerfil().subscribe({
        error: () => {
          // Handled by authInterceptor
        },
      });
    }
  }
}
