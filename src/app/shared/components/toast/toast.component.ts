import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (notificationService.toast(); as toast) {
      <div
        class="toast-container"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-info]="toast.type === 'info'"
        role="status"
        aria-live="polite"
      >
        <span class="material-symbols-outlined toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button
          type="button"
          class="toast-close"
          (click)="notificationService.fechar()"
          aria-label="Fechar notificação"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    }
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 80;
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-xl);
        background-color: var(--surface-container-highest);
        border: 1px solid var(--outline-variant);
        color: var(--on-surface);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.55);
        font-size: 0.75rem;
        max-width: 28rem;
        animation: toastSlideIn 220ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .toast-icon {
        font-size: 1.125rem;
        color: var(--tertiary);
        flex-shrink: 0;
      }

      .toast-error {
        border-color: rgba(239, 68, 68, 0.45);
      }

      .toast-error .toast-icon {
        color: var(--error);
      }

      .toast-info .toast-icon {
        color: var(--primary);
      }

      .toast-message {
        line-height: 1.4;
        flex: 1;
      }

      .toast-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.125rem;
        color: var(--secondary);
        border-radius: var(--radius-sm);
        transition: color 150ms ease;
      }

      .toast-close:hover {
        color: var(--on-surface);
      }

      .toast-close .material-symbols-outlined {
        font-size: 1rem;
      }

      @keyframes toastSlideIn {
        from {
          opacity: 0;
          transform: translateY(1rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ToastComponent {
  readonly notificationService = inject(NotificationService);
}
