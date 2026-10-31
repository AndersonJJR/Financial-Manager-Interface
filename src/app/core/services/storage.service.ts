import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config.token';
import { UsuarioResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly config = inject(APP_CONFIG);

  obterToken(): string | null {
    try {
      return localStorage.getItem(this.config.jwtStorageKey);
    } catch {
      return null;
    }
  }

  salvarToken(token: string): void {
    try {
      localStorage.setItem(this.config.jwtStorageKey, token);
    } catch {
      // Ignore storage quota or SSR errors
    }
  }

  obterUsuario(): UsuarioResponse | null {
    try {
      const raw = localStorage.getItem(this.config.userStorageKey);
      return raw ? (JSON.parse(raw) as UsuarioResponse) : null;
    } catch {
      return null;
    }
  }

  salvarUsuario(usuario: UsuarioResponse): void {
    try {
      localStorage.setItem(this.config.userStorageKey, JSON.stringify(usuario));
    } catch {
      // Ignore storage quota or SSR errors
    }
  }

  limparSessao(): void {
    try {
      localStorage.removeItem(this.config.jwtStorageKey);
      localStorage.removeItem(this.config.userStorageKey);
    } catch {
      // Ignore storage errors
    }
  }
}
