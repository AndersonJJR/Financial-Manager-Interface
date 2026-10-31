import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiErrorResponse } from '../models/api-error.model';
import { NotificationService } from '../services/notification.service';

export function extrairMensagemErroApi(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiErrorResponse> | null;
    if (body && typeof body === 'object') {
      if (Array.isArray(body.errors) && body.errors.length > 0) {
        return body.errors.map((e) => `${e.campo}: ${e.mensagem}`).join(' | ');
      }
      if (body.detail) {
        return body.detail;
      }
      if (body.title) {
        return body.title;
      }
    }
    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor da API. Verifique se o backend está em execução.';
    }
  }
  return 'Ocorreu um erro inesperado ao processar a solicitação.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const mensagem = extrairMensagemErroApi(error);
      notification.erro(mensagem);
      return throwError(() => error);
    })
  );
};
