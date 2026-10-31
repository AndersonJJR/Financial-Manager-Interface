import { TipoConta } from '../../core/models/conta.model';
import {
  ModalidadeTransacao,
  Periodicidade,
  StatusTransacao,
  TipoTransacao,
} from '../../core/models/transacao.model';

export interface TipoContaMeta {
  readonly valor: TipoConta;
  readonly rotulo: string;
  readonly rotuloCurto: string;
  readonly icone: string;
}

export const TIPOS_CONTA_META: readonly TipoContaMeta[] = [
  {
    valor: 'CONTA_CORRENTE',
    rotulo: 'Conta corrente',
    rotuloCurto: 'Conta corrente',
    icone: 'account_balance',
  },
  {
    valor: 'POUPANCA',
    rotulo: 'Poupança',
    rotuloCurto: 'Poupança',
    icone: 'savings',
  },
  {
    valor: 'CARTEIRA',
    rotulo: 'Carteira (Dinheiro físico)',
    rotuloCurto: 'Carteira',
    icone: 'payments',
  },
  {
    valor: 'CORRETORA',
    rotulo: 'Corretora de investimentos',
    rotuloCurto: 'Corretora',
    icone: 'assured_workload',
  },
  {
    valor: 'CARTAO_CREDITO',
    rotulo: 'Cartão de crédito',
    rotuloCurto: 'Cartão de crédito',
    icone: 'credit_card',
  },
];

export const PERIODICIDADES_META: readonly { valor: Periodicidade; rotulo: string }[] = [
  { valor: 'SEMANAL', rotulo: 'Semanal' },
  { valor: 'QUINZENAL', rotulo: 'Quinzenal' },
  { valor: 'MENSAL', rotulo: 'Mensal' },
  { valor: 'BIMESTRAL', rotulo: 'Bimestral' },
  { valor: 'TRIMESTRAL', rotulo: 'Trimestral' },
  { valor: 'SEMESTRAL', rotulo: 'Semestral' },
  { valor: 'ANUAL', rotulo: 'Anual' },
];

export function obterMetaTipoConta(tipo: TipoConta): TipoContaMeta {
  return (
    TIPOS_CONTA_META.find((item) => item.valor === tipo) ?? {
      valor: tipo,
      rotulo: 'Conta corrente',
      rotuloCurto: 'Conta corrente',
      icone: 'account_balance_wallet',
    }
  );
}

export function obterRotuloPeriodicidade(periodicidade: Periodicidade | null | undefined): string {
  if (!periodicidade) {
    return 'Mensal';
  }
  return PERIODICIDADES_META.find((p) => p.valor === periodicidade)?.rotulo ?? periodicidade;
}

export function obterRotuloModalidade(
  modalidade: ModalidadeTransacao,
  referenciaParcela?: string | null,
  periodicidade?: Periodicidade | null
): string {
  if (modalidade === 'PARCELADA') {
    return referenciaParcela ? `Parcelada (${referenciaParcela})` : 'Parcelada';
  }
  if (modalidade === 'RECORRENTE') {
    return periodicidade
      ? `Recorrente (${obterRotuloPeriodicidade(periodicidade)})`
      : 'Recorrente';
  }
  return 'Única';
}

export function obterRotuloStatus(status: StatusTransacao): string {
  switch (status) {
    case 'EFETIVADA':
      return 'Efetivada';
    case 'PENDENTE':
      return 'Pendente';
    case 'CANCELADA':
      return 'Cancelada';
  }
}

export function obterRotuloTipoTransacao(tipo: TipoTransacao): string {
  return tipo === 'RECEITA' ? 'Receita' : 'Despesa';
}
