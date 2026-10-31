import { TipoTransacao } from './transacao.model';

export interface CategoriaRequest {
  readonly nome: string;
  readonly descricao?: string | null;
  readonly corHex?: string | null;
  readonly tipo: TipoTransacao;
  readonly ativa?: boolean | null;
}

export interface CategoriaResponse {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly corHex: string | null;
  readonly tipo: TipoTransacao;
  readonly ativa: boolean;
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}
