import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config.token';
import {
  DespesaParceladaRequest,
  FormatoExportacao,
  ParcelamentoResponse,
  ResumoMensalResponse,
  TransacaoFiltro,
  TransacaoRecorrenteRequest,
  TransacaoRequest,
  TransacaoResponse,
} from '../models/transacao.model';

@Injectable({
  providedIn: 'root',
})
export class TransacaoService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly baseUrl = `${this.config.apiBaseUrl}/transacoes`;

  criar(request: TransacaoRequest): Observable<TransacaoResponse> {
    return this.http.post<TransacaoResponse>(this.baseUrl, request);
  }

  criarDespesaParcelada(request: DespesaParceladaRequest): Observable<ParcelamentoResponse> {
    return this.http.post<ParcelamentoResponse>(`${this.baseUrl}/parceladas`, request);
  }

  criarTransacaoRecorrente(
    request: TransacaoRecorrenteRequest
  ): Observable<ParcelamentoResponse> {
    return this.http.post<ParcelamentoResponse>(`${this.baseUrl}/recorrentes`, request);
  }

  listar(filtro?: TransacaoFiltro): Observable<TransacaoResponse[]> {
    let params = new HttpParams();
    if (filtro?.dataInicio) {
      params = params.set('dataInicio', filtro.dataInicio);
    }
    if (filtro?.dataFim) {
      params = params.set('dataFim', filtro.dataFim);
    }
    if (filtro?.tipo) {
      params = params.set('tipo', filtro.tipo);
    }
    if (filtro?.status) {
      params = params.set('status', filtro.status);
    }
    if (filtro?.contaId) {
      params = params.set('contaId', filtro.contaId);
    }
    if (filtro?.categoriaId) {
      params = params.set('categoriaId', filtro.categoriaId);
    }
    return this.http.get<TransacaoResponse[]>(this.baseUrl, { params });
  }

  buscarPorId(id: string): Observable<TransacaoResponse> {
    return this.http.get<TransacaoResponse>(`${this.baseUrl}/${id}`);
  }

  listarPorGrupo(grupoId: string): Observable<TransacaoResponse[]> {
    return this.http.get<TransacaoResponse[]>(`${this.baseUrl}/grupos/${grupoId}`);
  }

  cancelarPendentesDoGrupo(grupoId: string): Observable<TransacaoResponse[]> {
    return this.http.delete<TransacaoResponse[]>(
      `${this.baseUrl}/grupos/${grupoId}/pendentes`
    );
  }

  atualizar(id: string, request: TransacaoRequest): Observable<TransacaoResponse> {
    return this.http.put<TransacaoResponse>(`${this.baseUrl}/${id}`, request);
  }

  efetivar(id: string, dataPagamento?: string): Observable<TransacaoResponse> {
    let params = new HttpParams();
    if (dataPagamento) {
      params = params.set('dataPagamento', dataPagamento);
    }
    return this.http.patch<TransacaoResponse>(`${this.baseUrl}/${id}/efetivar`, null, {
      params,
    });
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  obterResumoMensal(ano: number, mes: number): Observable<ResumoMensalResponse> {
    const params = new HttpParams().set('ano', String(ano)).set('mes', String(mes));
    return this.http.get<ResumoMensalResponse>(`${this.baseUrl}/resumo-mensal`, { params });
  }

  exportarExtrato(
    dataInicio: string,
    dataFim: string,
    formato: FormatoExportacao = 'CSV',
    contasIds?: string[]
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim)
      .set('formato', formato);

    if (contasIds && contasIds.length > 0) {
      for (const contaId of contasIds) {
        params = params.append('contasIds', contaId);
      }
    }

    return this.http.get(`${this.baseUrl}/exportar`, {
      params,
      responseType: 'blob',
    });
  }

   dispararDownloadArquivo(
    blob: Blob,
    dataInicio: string,
    dataFim: string,
    formato: FormatoExportacao
  ): void {
    const ext = formato === 'CSV' ? 'csv' : 'json';
    const fileName = `extrato_${dataInicio}_a_${dataFim}.${ext}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
