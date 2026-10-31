export type TipoTransacao = 'RECEITA' | 'DESPESA';

export type StatusTransacao = 'PENDENTE' | 'EFETIVADA' | 'CANCELADA';

export type ModalidadeTransacao = 'UNICA' | 'PARCELADA' | 'RECORRENTE';

export type ModoValorParcelamento = 'VALOR_TOTAL' | 'VALOR_PARCELA';

export type Periodicidade =
  | 'SEMANAL'
  | 'QUINZENAL'
  | 'MENSAL'
  | 'BIMESTRAL'
  | 'TRIMESTRAL'
  | 'SEMESTRAL'
  | 'ANUAL';

export type FormatoExportacao = 'CSV' | 'JSON';

export interface TransacaoRequest {
  readonly descricao: string;
  readonly valor: number;
  readonly dataCompetencia: string;
  readonly dataPagamento?: string | null;
  readonly tipo: TipoTransacao;
  readonly status?: StatusTransacao | null;
  readonly contaId: string;
  readonly categoriaId: string;
  readonly observacao?: string | null;
}

export interface DespesaParceladaRequest {
  readonly descricao: string;
  readonly valorInformado: number;
  readonly modoValor: ModoValorParcelamento;
  readonly totalParcelas: number;
  readonly periodicidade: Periodicidade;
  readonly dataPrimeiraParcela: string;
  readonly primeiraParcelaPaga?: boolean | null;
  readonly contaId: string;
  readonly categoriaId: string;
  readonly observacao?: string | null;
}

export interface TransacaoRecorrenteRequest {
  readonly descricao: string;
  readonly valor: number;
  readonly tipo: TipoTransacao;
  readonly periodicidade: Periodicidade;
  readonly dataInicio: string;
  readonly quantidadeOcorrencias: number;
  readonly primeiraOcorrenciaEfetivada?: boolean | null;
  readonly contaId: string;
  readonly categoriaId: string;
  readonly observacao?: string | null;
}

export interface TransacaoResponse {
  readonly id: string;
  readonly descricao: string;
  readonly valor: number;
  readonly dataCompetencia: string;
  readonly dataPagamento: string | null;
  readonly tipo: TipoTransacao;
  readonly status: StatusTransacao;
  readonly modalidade: ModalidadeTransacao;
  readonly grupoParcelamentoId: string | null;
  readonly parcelaAtual: number | null;
  readonly totalParcelas: number | null;
  readonly referenciaParcela: string | null;
  readonly periodicidade: Periodicidade | null;
  readonly recorrenciaAtiva: boolean;
  readonly observacao: string | null;
  readonly contaId: string;
  readonly contaNome: string;
  readonly categoriaId: string;
  readonly categoriaNome: string;
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}

export interface ParcelamentoResponse {
  readonly grupoParcelamentoId: string;
  readonly descricaoBase: string;
  readonly modalidade: ModalidadeTransacao;
  readonly periodicidade: Periodicidade;
  readonly totalLancamentos: number;
  readonly valorTotalConsolidado: number;
  readonly lancamentos: TransacaoResponse[];
}

export interface GastoPorCategoriaDto {
  readonly categoriaId: string;
  readonly categoriaNome: string;
  readonly corHex: string | null;
  readonly valorNominal: number;
  readonly percentual: number;
  readonly quantidadeTransacoes: number;
}

export interface ResumoMensalResponse {
  readonly ano: number;
  readonly mes: number;
  readonly totalEntradasRealizadas: number;
  readonly totalEntradasPrevistas: number;
  readonly totalSaidasPagas: number;
  readonly totalSaidasPrevistas: number;
  readonly totalSaidasConsolidado: number;
  readonly saldoLiquidoRealizado: number;
  readonly saldoLiquidoPrevisto: number;
  readonly gastosPorCategoria: GastoPorCategoriaDto[];
}

export interface TransacaoFiltro {
  readonly dataInicio?: string;
  readonly dataFim?: string;
  readonly tipo?: TipoTransacao;
  readonly status?: StatusTransacao;
  readonly contaId?: string;
  readonly categoriaId?: string;
}
