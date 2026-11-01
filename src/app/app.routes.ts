import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/cadastro-page/cadastro-page.component').then(
        (m) => m.CadastroPageComponent
      ),
  },
  {
    path: 'registrar',
    redirectTo: 'cadastro',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'visao-geral',
      },
      {
        path: 'visao-geral',
        loadComponent: () =>
          import('./features/visao-geral/pages/visao-geral-page/visao-geral-page.component').then(
            (m) => m.VisaoGeralPageComponent
          ),
      },
      {
        path: 'lancamentos',
        loadComponent: () =>
          import('./features/lancamentos/pages/lancamentos-page/lancamentos-page.component').then(
            (m) => m.LancamentosPageComponent
          ),
      },
      {
        path: 'novo-lancamento',
        loadComponent: () =>
          import(
            './features/novo-lancamento/pages/novo-lancamento-page/novo-lancamento-page.component'
          ).then((m) => m.NovoLancamentoPageComponent),
      },
      {
        path: 'contas',
        loadComponent: () =>
          import('./features/contas/pages/contas-page/contas-page.component').then(
            (m) => m.ContasPageComponent
          ),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/pages/categorias-page/categorias-page.component').then(
            (m) => m.CategoriasPageComponent
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/pages/perfil-page/perfil-page.component').then(
            (m) => m.PerfilPageComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'visao-geral',
  },
];
