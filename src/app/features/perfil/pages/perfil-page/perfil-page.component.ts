import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ContaResponse } from '../../../../core/models/conta.model';
import { CategoriaResponse } from '../../../../core/models/categoria.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ContaService } from '../../../../core/services/conta.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.css',
})
export class PerfilPageComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly contaService = inject(ContaService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly usuario = computed(() => this.authService.usuarioAtual());
  readonly contas = signal<ContaResponse[]>([]);
  readonly categorias = signal<CategoriaResponse[]>([]);

  readonly carregando = signal(false);
  readonly editandoNome = signal(false);
  readonly salvandoNome = signal(false);
  readonly modalLogoutAberto = signal(false);

  readonly contasAtivasCount = computed(() => this.contas().filter((c) => c.ativa).length);
  readonly totalContasCount = computed(() => this.contas().length);
  readonly totalCategoriasCount = computed(() => this.categorias().length);

  readonly formNome = this.fb.group({
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
    ],
  });

  ngOnInit(): void {
    this.sincronizarTudo(false);
  }

  sincronizarTudo(notificar = true): void {
    this.carregando.set(true);

    forkJoin({
      perfil: this.authService.obterPerfil(),
      contas: this.contaService.listarTodas(),
      categorias: this.categoriaService.listarTodas(),
    }).subscribe({
      next: ({ contas, categorias }) => {
        this.contas.set(contas);
        this.categorias.set(categorias);
        this.carregando.set(false);
        if (notificar) {
          this.notification.sucesso('Dados do perfil e escopo operacional sincronizados.');
        }
      },
      error: () => {
        this.carregando.set(false);
        // Mesmo em caso de falha de conexão nas métricas, o perfil salvo na sessão continua visível
      },
    });
  }

  extrairIniciais(nome: string | null | undefined): string {
    if (!nome) {
      return 'US';
    }
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) {
      return 'US';
    }
    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  formatarMembroDesde(dataIso: string | null | undefined): string {
    if (!dataIso) {
      return 'Data não informada';
    }
    const date = new Date(dataIso);
    if (isNaN(date.getTime())) {
      return dataIso;
    }
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  }

  iniciarEdicaoNome(): void {
    this.formNome.patchValue({
      nome: this.usuario()?.nome ?? '',
    });
    this.editandoNome.set(true);
  }

  cancelarEdicaoNome(): void {
    this.editandoNome.set(false);
    this.formNome.reset();
  }

  salvarNome(): void {
    if (this.formNome.invalid) {
      this.formNome.markAllAsTouched();
      return;
    }

    const novoNome = this.formNome.value.nome?.trim() ?? '';
    this.salvandoNome.set(true);

    this.authService.atualizarPerfil({ nome: novoNome }).subscribe({
      next: () => {
        this.salvandoNome.set(false);
        this.editandoNome.set(false);
        this.notification.sucesso('Nome de exibição atualizado com sucesso.');
      },
      error: () => {
        this.salvandoNome.set(false);
        this.notification.erro('Falha ao atualizar o nome de exibição.');
      },
    });
  }

  abrirModalLogout(): void {
    this.modalLogoutAberto.set(true);
  }

  fecharModalLogout(): void {
    this.modalLogoutAberto.set(false);
  }

  confirmarLogout(): void {
    this.fecharModalLogout();
    this.authService.logout(true);
  }
}
