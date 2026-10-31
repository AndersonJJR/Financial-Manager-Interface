import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config.token';
import { ContaRequest, ContaResponse } from '../models/conta.model';

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly baseUrl = `${this.config.apiBaseUrl}/contas`;

  listarTodas(): Observable<ContaResponse[]> {
    return this.http.get<ContaResponse[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<ContaResponse> {
    return this.http.get<ContaResponse>(`${this.baseUrl}/${id}`);
  }

  criar(request: ContaRequest): Observable<ContaResponse> {
    return this.http.post<ContaResponse>(this.baseUrl, request);
  }

  atualizar(id: string, request: ContaRequest): Observable<ContaResponse> {
    return this.http.put<ContaResponse>(`${this.baseUrl}/${id}`, request);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reativar(conta: ContaResponse): Observable<ContaResponse> {
    return this.atualizar(conta.id, {
      nome: conta.nome,
      instituicao: conta.instituicao,
      tipo: conta.tipo,
      saldoInicial: conta.saldoInicial,
      ativa: true,
    });
  }
}
