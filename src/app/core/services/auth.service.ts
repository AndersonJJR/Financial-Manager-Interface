import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../config/app-config.token';
import {
  CadastroUsuarioRequest,
  LoginRequest,
  TokenResponse,
  UsuarioResponse,
} from '../models/auth.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly tokenSignal = signal<string | null>(this.storage.obterToken());
  private readonly usuarioSignal = signal<UsuarioResponse | null>(this.storage.obterUsuario());

  readonly token = this.tokenSignal.asReadonly();
  readonly usuarioAtual = this.usuarioSignal.asReadonly();
  readonly estaAutenticado = computed(() => Boolean(this.tokenSignal()));

  registrar(request: CadastroUsuarioRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.config.apiBaseUrl}/auth/registrar`, request)
      .pipe(tap((res) => this.persistirSessao(res)));
  }

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.config.apiBaseUrl}/auth/login`, request)
      .pipe(tap((res) => this.persistirSessao(res)));
  }

  obterPerfil(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.config.apiBaseUrl}/auth/me`).pipe(
      tap((usuario) => {
        this.usuarioSignal.set(usuario);
        this.storage.salvarUsuario(usuario);
      })
    );
  }

  logout(redirecionar = true): void {
    this.tokenSignal.set(null);
    this.usuarioSignal.set(null);
    this.storage.limparSessao();
    if (redirecionar) {
      void this.router.navigate(['/login']);
    }
  }

  private persistirSessao(response: TokenResponse): void {
    this.tokenSignal.set(response.token);
    this.usuarioSignal.set(response.usuario);
    this.storage.salvarToken(response.token);
    this.storage.salvarUsuario(response.usuario);
  }
}
