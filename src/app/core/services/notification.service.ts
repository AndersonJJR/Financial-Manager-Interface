import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface ToastNotification {
  readonly id: number;
  readonly message: string;
  readonly type: NotificationType;
  readonly icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly activeToastSignal = signal<ToastNotification | null>(null);
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private sequence = 0;

  readonly toast = this.activeToastSignal.asReadonly();

  sucesso(message: string, durationMs = 3600): void {
    this.exibir(message, 'success', 'check_circle', durationMs);
  }

  erro(message: string, durationMs = 5000): void {
    this.exibir(message, 'error', 'error', durationMs);
  }

  info(message: string, durationMs = 3600): void {
    this.exibir(message, 'info', 'info', durationMs);
  }

  fechar(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    this.activeToastSignal.set(null);
  }

  private exibir(
    message: string,
    type: NotificationType,
    icon: string,
    durationMs: number
  ): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    this.sequence += 1;
    this.activeToastSignal.set({
      id: this.sequence,
      message,
      type,
      icon,
    });
    this.timeoutHandle = setTimeout(() => {
      this.activeToastSignal.set(null);
      this.timeoutHandle = null;
    }, durationMs);
  }
}
