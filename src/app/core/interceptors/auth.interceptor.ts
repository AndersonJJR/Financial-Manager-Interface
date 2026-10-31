import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const token = storage.obterToken();

  const isPublicAuthEndpoint =
    req.url.endsWith('/auth/login') || req.url.endsWith('/auth/registrar');

  const authReq =
    token && !isPublicAuthEndpoint
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isPublicAuthEndpoint) {
        authService.logout(true);
      }
      return throwError(() => error);
    })
  );
};
