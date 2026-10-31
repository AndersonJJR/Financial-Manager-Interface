import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config.token';
import { CategoriaRequest, CategoriaResponse } from '../models/categoria.model';
import { TipoTransacao } from '../models/transacao.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly baseUrl = `${this.config.apiBaseUrl}/categorias`;

  listarTodas(tipo?: TipoTransacao): Observable<CategoriaResponse[]> {
    let params = new HttpParams();
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    return this.http.get<CategoriaResponse[]>(this.baseUrl, { params });
  }

  buscarPorId(id: string): Observable<CategoriaResponse> {
    return this.http.get<CategoriaResponse>(`${this.baseUrl}/${id}`);
  }

  criar(request: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(this.baseUrl, request);
  }

  atualizar(id: string, request: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.put<CategoriaResponse>(`${this.baseUrl}/${id}`, request);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reativar(categoria: CategoriaResponse): Observable<CategoriaResponse> {
    return this.atualizar(categoria.id, {
      nome: categoria.nome,
      descricao: categoria.descricao,
      corHex: categoria.corHex,
      tipo: categoria.tipo,
      ativa: true,
    });
  }
}
