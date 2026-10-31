export interface ErroValidacaoCampo {
  readonly campo: string;
  readonly mensagem: string;
}

export interface ApiErrorResponse {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly instance: string;
  readonly timestamp: string;
  readonly errors?: ErroValidacaoCampo[] | null;
}
