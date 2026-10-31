export type TipoConta =
  | 'CONTA_CORRENTE'
  | 'POUPANCA'
  | 'CARTEIRA'
  | 'CORRETORA'
  | 'CARTAO_CREDITO';

export interface ContaRequest {
  readonly nome: string;
  readonly instituicao?: string | null;
  readonly tipo: TipoConta;
  readonly saldoInicial?: number | null;
  readonly ativa?: boolean | null;
}

export interface ContaResponse {
  readonly id: string;
  readonly nome: string;
  readonly instituicao: string | null;
  readonly tipo: TipoConta;
  readonly saldoInicial: number;
  readonly ativa: boolean;
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}
