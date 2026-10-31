import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaRequest, CategoriaResponse } from '../../../../core/models/categoria.model';
import { TipoTransacao } from '../../../../core/models/transacao.model';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinancialValidators } from '../../../../core/validators/financial.validators';

@Component({
  selector: 'app-categorias-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="categorias-wrapper">
      <div class="top-header">
        <div>
          <div class="module-kicker">
            <span class="kicker-icon-box">
              <span class="material-symbols-outlined">label</span>
            </span>
            <span class="font-mono kicker-text">Classificação Orçamentária</span>
          </div>
          <h1 class="page-title font-headline">Categorias</h1>
          <p class="page-subtitle">
            Classifique receitas e despesas com cores dedicadas para análise gráfica
          </p>
        </div>

        <button type="button" class="btn-primary" (click)="abrirModalNova()">
          <span class="material-symbols-outlined">add</span>
          <span>Nova categoria</span>
        </button>
      </div>

      <div class="filter-bar">
        <div class="filter-chips">
          <button
            type="button"
            class="chip"
            [class.chip-active]="filtroTipo() === 'TODAS'"
            (click)="filtroTipo.set('TODAS')"
          >
            Todas ({{ categorias().length }})
          </button>
          <button
            type="button"
            class="chip"
            [class.chip-active]="filtroTipo() === 'DESPESA'"
            (click)="filtroTipo.set('DESPESA')"
          >
            Despesas ({{ totalDespesas() }})
          </button>
          <button
            type="button"
            class="chip"
            [class.chip-active]="filtroTipo() === 'RECEITA'"
            (click)="filtroTipo.set('RECEITA')"
          >
            Receitas ({{ totalReceitas() }})
          </button>
        </div>
      </div>

      @if (categoriasFiltradas().length === 0) {
        <div class="empty-box">
          <span class="material-symbols-outlined empty-icon">label</span>
          <p class="empty-title">Nenhuma categoria encontrada</p>
          <p class="empty-desc">
            Crie categorias de Receita e Despesa para vincular aos seus lançamentos.
          </p>
        </div>
      } @else {
        <div class="cat-grid">
          @for (cat of categoriasFiltradas(); track cat.id) {
            <article class="cat-card" [class.cat-inactive]="!cat.ativa">
              <div class="cat-top">
                <div class="cat-header">
                  <div class="cat-title-group">
                    <span
                      class="color-swatch"
                      [style.background-color]="cat.corHex || '#a78bfa'"
                    ></span>
                    <div>
                      <h3 class="cat-name font-headline">{{ cat.nome }}</h3>
                      <span class="cat-hex font-mono">{{ cat.corHex || '#A78BFA' }}</span>
                    </div>
                  </div>
                  <span
                    class="type-badge"
                    [class.type-receita]="cat.tipo === 'RECEITA'"
                    [class.type-despesa]="cat.tipo === 'DESPESA'"
                  >
                    {{ cat.tipo === 'RECEITA' ? 'Receita' : 'Despesa' }}
                  </span>
                </div>
                <p class="cat-desc">{{ cat.descricao || 'Sem descrição complementar' }}</p>
              </div>

              <div class="cat-footer">
                @if (cat.ativa) {
                  <button type="button" class="action-link" (click)="abrirModalEditar(cat)">
                    <span class="material-symbols-outlined">edit</span>
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    class="action-link action-danger"
                    (click)="inativar(cat)"
                  >
                    <span class="material-symbols-outlined">block</span>
                    <span>Inativar</span>
                  </button>
                } @else {
                  <button
                    type="button"
                    class="action-link action-restore"
                    (click)="reativar(cat)"
                  >
                    <span class="material-symbols-outlined">restore</span>
                    <span>Reativar</span>
                  </button>
                }
              </div>
            </article>
          }
        </div>
      }
    </div>

    @if (modalAberto()) {
      <div class="modal-backdrop" (click)="fecharModal()">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div>
              <h3 class="modal-title font-headline">
                {{ categoriaEmEdicao() ? 'Editar categoria' : 'Nova categoria' }}
              </h3>
              <p class="modal-sub">Compatível com validação de tipo de transação da API</p>
            </div>
            <button type="button" class="close-btn" (click)="fecharModal()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="salvar()" class="modal-form" novalidate>
            <div class="field">
              <label for="cat-nome" class="label">Nome da categoria *</label>
              <input
                id="cat-nome"
                type="text"
                formControlName="nome"
                class="obsidian-input"
                maxlength="100"
                placeholder="Ex: Alimentação, Moradia, Salário"
              />
              @if (form.controls.nome.touched && form.controls.nome.invalid) {
                <p class="field-error-text">O nome deve ter entre 2 e 100 caracteres.</p>
              }
            </div>

            <div class="field-row">
              <div class="field">
                <label for="cat-tipo" class="label">Tipo *</label>
                <select id="cat-tipo" formControlName="tipo" class="obsidian-select">
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
              </div>

              <div class="field">
                <label for="cat-cor" class="label">Cor Hexadecimal (#RRGGBB)</label>
                <div class="color-input-row">
                  <input
                    type="color"
                    class="color-picker"
                    [value]="form.controls.corHex.value || '#a78bfa'"
                    (input)="atualizarCor(($any($event.target)).value)"
                  />
                  <input
                    id="cat-cor"
                    type="text"
                    formControlName="corHex"
                    class="obsidian-input font-mono"
                    placeholder="#A78BFA"
                  />
                </div>
                @if (form.controls.corHex.touched && form.controls.corHex.invalid) {
                  <p class="field-error-text">Formato hexadecimal inválido (#RRGGBB).</p>
                }
              </div>
            </div>

            <div class="field">
              <label for="cat-desc" class="label">Descrição (opcional)</label>
              <textarea
                id="cat-desc"
                rows="2"
                formControlName="descricao"
                class="obsidian-textarea"
                maxlength="250"
                placeholder="Mercado, restaurantes e delivery..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-ghost" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="salvando()">
                {{ salvando() ? 'Salvando...' : 'Salvar categoria' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .categorias-wrapper {
        max-width: 80rem;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .top-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .module-kicker {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .kicker-icon-box {
        width: 1.75rem;
        height: 1.75rem;
        border-radius: var(--radius-lg);
        background-color: var(--surface-container-high);
        color: var(--primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .kicker-text {
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--secondary);
      }

      .page-title {
        font-size: 1.875rem;
        font-weight: 600;
      }

      .page-subtitle {
        font-size: 0.875rem;
        color: var(--on-surface-variant);
        margin-top: 0.25rem;
      }

      .filter-bar {
        display: flex;
        align-items: center;
      }

      .filter-chips {
        display: inline-flex;
        gap: 0.375rem;
        padding: 0.25rem;
        border-radius: var(--radius-xl);
        background-color: var(--surface-container-low);
        border: 1px solid var(--outline-variant);
      }

      .chip {
        padding: 0.375rem 0.875rem;
        border-radius: var(--radius-lg);
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--on-surface-variant);
      }

      .chip-active {
        background-color: var(--surface-container-high);
        color: var(--on-surface);
      }

      .cat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
        gap: 1rem;
      }

      .cat-card {
        background-color: var(--surface-container);
        border: 1px solid var(--outline-variant);
        border-radius: var(--radius-xl);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1rem;
      }

      .cat-inactive {
        opacity: 0.6;
      }

      .cat-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .cat-title-group {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }

      .color-swatch {
        width: 1rem;
        height: 1rem;
        border-radius: var(--radius-full);
        flex-shrink: 0;
      }

      .cat-name {
        font-size: 0.9375rem;
        font-weight: 600;
      }

      .cat-hex {
        font-size: 0.6875rem;
        color: var(--secondary);
      }

      .type-badge {
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-full);
        font-size: 0.6875rem;
        font-weight: 500;
      }

      .type-receita {
        background-color: rgba(52, 211, 153, 0.12);
        color: var(--tertiary);
      }

      .type-despesa {
        background-color: rgba(239, 68, 68, 0.12);
        color: var(--error);
      }

      .cat-desc {
        font-size: 0.75rem;
        color: var(--on-surface-variant);
        margin-top: 0.625rem;
      }

      .cat-footer {
        padding-top: 0.75rem;
        border-top: 1px solid var(--outline-variant);
        display: flex;
        justify-content: space-between;
      }

      .action-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--on-surface-variant);
      }

      .action-link:hover {
        color: var(--primary);
      }

      .action-danger:hover {
        color: var(--error);
      }

      .action-restore {
        color: var(--tertiary);
      }

      .empty-box {
        background-color: var(--surface-container);
        border: 1px dashed var(--outline-variant);
        border-radius: var(--radius-xl);
        padding: 2.5rem;
        text-align: center;
      }

      .empty-icon {
        font-size: 2rem;
        color: var(--primary);
      }

      .empty-title {
        font-weight: 600;
        margin-top: 0.5rem;
      }

      .empty-desc {
        font-size: 0.8125rem;
        color: var(--on-surface-variant);
        margin-top: 0.25rem;
      }

      .modal-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .modal-title {
        font-size: 1.125rem;
        font-weight: 600;
      }

      .modal-sub {
        font-size: 0.75rem;
        color: var(--on-surface-variant);
      }

      .close-btn {
        color: var(--secondary);
      }

      .modal-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .label {
        font-size: 0.75rem;
        font-weight: 500;
      }

      .color-input-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .color-picker {
        width: 2.5rem;
        height: 2.35rem;
        border: 1px solid var(--outline-variant);
        border-radius: var(--radius-md);
        background: var(--surface-container-high);
        padding: 0.15rem;
        cursor: pointer;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class CategoriasPageComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly categorias = signal<CategoriaResponse[]>([]);
  readonly filtroTipo = signal<'TODAS' | TipoTransacao>('TODAS');
  readonly modalAberto = signal(false);
  readonly salvando = signal(false);
  readonly categoriaEmEdicao = signal<CategoriaResponse | null>(null);

  readonly totalDespesas = computed(
    () => this.categorias().filter((c) => c.tipo === 'DESPESA').length
  );
  readonly totalReceitas = computed(
    () => this.categorias().filter((c) => c.tipo === 'RECEITA').length
  );

  readonly categoriasFiltradas = computed(() => {
    const tipo = this.filtroTipo();
    if (tipo === 'TODAS') {
      return this.categorias();
    }
    return this.categorias().filter((c) => c.tipo === tipo);
  });

  readonly form = this.fb.nonNullable.group({
    nome: ['', [FinancialValidators.notBlank(), FinancialValidators.trimmedSize(2, 100)]],
    descricao: ['', [Validators.maxLength(250)]],
    corHex: ['#6366F1', [FinancialValidators.hexColor()]],
    tipo: ['DESPESA' as TipoTransacao, [Validators.required]],
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.categoriaService.listarTodas().subscribe({
      next: (lista) => this.categorias.set(lista),
    });
  }

  abrirModalNova(): void {
    this.categoriaEmEdicao.set(null);
    this.form.reset({
      nome: '',
      descricao: '',
      corHex: '#6366F1',
      tipo: 'DESPESA',
    });
    this.modalAberto.set(true);
  }

  abrirModalEditar(cat: CategoriaResponse): void {
    this.categoriaEmEdicao.set(cat);
    this.form.reset({
      nome: cat.nome,
      descricao: cat.descricao ?? '',
      corHex: cat.corHex ?? '#6366F1',
      tipo: cat.tipo,
    });
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.categoriaEmEdicao.set(null);
  }

  atualizarCor(hex: string): void {
    this.form.controls.corHex.setValue(hex.toUpperCase());
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const val = this.form.getRawValue();
    const edicao = this.categoriaEmEdicao();
    const payload: CategoriaRequest = {
      nome: val.nome.trim(),
      descricao: val.descricao.trim() ? val.descricao.trim() : null,
      corHex: val.corHex.trim() ? val.corHex.trim() : null,
      tipo: val.tipo,
      ativa: edicao ? edicao.ativa : true,
    };

    const req$ = edicao
      ? this.categoriaService.atualizar(edicao.id, payload)
      : this.categoriaService.criar(payload);

    req$.subscribe({
      next: (salva) => {
        this.salvando.set(false);
        this.fecharModal();
        this.carregar();
        this.notification.sucesso(`Categoria "${salva.nome}" salva com sucesso!`);
      },
      error: () => {
        this.salvando.set(false);
      },
    });
  }

  inativar(cat: CategoriaResponse): void {
    this.categoriaService.excluir(cat.id).subscribe({
      next: () => {
        this.carregar();
        this.notification.sucesso(`Categoria "${cat.nome}" inativada.`);
      },
    });
  }

  reativar(cat: CategoriaResponse): void {
    this.categoriaService.reativar(cat).subscribe({
      next: () => {
        this.carregar();
        this.notification.sucesso(`Categoria "${cat.nome}" reativada.`);
      },
    });
  }
}
