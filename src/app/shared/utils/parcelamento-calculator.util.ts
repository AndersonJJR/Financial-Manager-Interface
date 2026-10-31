import { ModoValorParcelamento, Periodicidade } from '../../core/models/transacao.model';

export interface ItemCronogramaPrevia {
  readonly numero: number;
  readonly numeroFormatado: string;
  readonly dataIso: string;
  readonly dataFormatada: string;
  readonly referencia: string;
  readonly valor: number;
  readonly paga: boolean;
}

export interface PreviaParcelamentoResultado {
  readonly valorTotalConsolidado: number;
  readonly valorPrimeiraParcela: number;
  readonly valorParcelaPadrao: number;
  readonly totalParcelas: number;
  readonly quantidadePagas: number;
  readonly quantidadePendentes: number;
  readonly percentualPago: number;
  readonly percentualPendente: number;
  readonly itensVisiveis: ItemCronogramaPrevia[];
  readonly parcelasOcultasCount: number;
  readonly dataUltimaParcelaFormatada: string;
}

export function avancarDataPorPeriodicidade(
  dataIsoBase: string,
  periodicidade: Periodicidade,
  ciclos: number
): string {
  const partes = dataIsoBase.split('-').map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) {
    return dataIsoBase;
  }
  const [ano, mes, dia] = partes;

  if (periodicidade === 'SEMANAL') {
    const dt = new Date(ano, mes - 1, dia + ciclos * 7);
    return formatarDataIso(dt);
  }
  if (periodicidade === 'QUINZENAL') {
    const dt = new Date(ano, mes - 1, dia + ciclos * 15);
    return formatarDataIso(dt);
  }

  let mesesAdicionar = ciclos;
  if (periodicidade === 'BIMESTRAL') {
    mesesAdicionar = ciclos * 2;
  } else if (periodicidade === 'TRIMESTRAL') {
    mesesAdicionar = ciclos * 3;
  } else if (periodicidade === 'SEMESTRAL') {
    mesesAdicionar = ciclos * 6;
  } else if (periodicidade === 'ANUAL') {
    mesesAdicionar = ciclos * 12;
  }

  const totalMeses = (ano * 12 + (mes - 1)) + mesesAdicionar;
  const novoAno = Math.floor(totalMeses / 12);
  const novoMesIndex = totalMeses % 12;
  const ultimoDiaNovoMes = new Date(novoAno, novoMesIndex + 1, 0).getDate();
  const diaAjustado = Math.min(dia, ultimoDiaNovoMes);

  return formatarDataIso(new Date(novoAno, novoMesIndex, diaAjustado));
}

export function formatarDataIsoParaBr(dataIso: string | null | undefined): string {
  if (!dataIso) {
    return '';
  }
  const partes = dataIso.split('-');
  if (partes.length !== 3) {
    return dataIso;
  }
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function arredondar2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function truncar2(valor: number): number {
  return Math.floor(Math.round(valor * 10000) / 100) / 100;
}

export function calcularPreviaParcelamento(
  valorInformado: number,
  modoValor: ModoValorParcelamento,
  totalParcelas: number,
  periodicidade: Periodicidade,
  dataPrimeiraParcela: string,
  primeiraParcelaPaga: boolean,
  limiteVisiveis = 4
): PreviaParcelamentoResultado {
  const parcelas = Math.max(1, Math.min(240, Math.floor(totalParcelas || 1)));
  const valorSeguro = Math.max(0, arredondar2(valorInformado || 0));

  let valorTotalConsolidado = 0;
  let valorParcelaPadrao = 0;
  let valorPrimeiraParcela = 0;

  if (modoValor === 'VALOR_TOTAL') {
    valorTotalConsolidado = valorSeguro;
    valorParcelaPadrao = truncar2(valorSeguro / parcelas);
    const somaPadrao = arredondar2(valorParcelaPadrao * parcelas);
    const diferencaCentavos = arredondar2(valorSeguro - somaPadrao);
    valorPrimeiraParcela = arredondar2(valorParcelaPadrao + diferencaCentavos);
  } else {
    valorParcelaPadrao = valorSeguro;
    valorPrimeiraParcela = valorSeguro;
    valorTotalConsolidado = arredondar2(valorSeguro * parcelas);
  }

  const todosItens: ItemCronogramaPrevia[] = [];
  const dataBase = dataPrimeiraParcela || formatarDataIso(new Date());

  for (let i = 0; i < parcelas; i++) {
    const numero = i + 1;
    const dataIso = avancarDataPorPeriodicidade(dataBase, periodicidade, i);
    todosItens.push({
      numero,
      numeroFormatado: String(numero).padStart(2, '0'),
      dataIso,
      dataFormatada: formatarDataIsoParaBr(dataIso),
      referencia: `${numero} de ${parcelas}`,
      valor: i === 0 ? valorPrimeiraParcela : valorParcelaPadrao,
      paga: i === 0 && Boolean(primeiraParcelaPaga),
    });
  }

  const quantidadePagas = primeiraParcelaPaga ? 1 : 0;
  const quantidadePendentes = Math.max(0, parcelas - quantidadePagas);
  const percentualPago = Math.round((quantidadePagas / parcelas) * 100);
  const percentualPendente = 100 - percentualPago;

  const itensVisiveis = todosItens.slice(0, limiteVisiveis);
  const parcelasOcultasCount = Math.max(0, parcelas - limiteVisiveis);
  const ultimoItem = todosItens[todosItens.length - 1];

  return {
    valorTotalConsolidado,
    valorPrimeiraParcela,
    valorParcelaPadrao,
    totalParcelas: parcelas,
    quantidadePagas,
    quantidadePendentes,
    percentualPago,
    percentualPendente,
    itensVisiveis,
    parcelasOcultasCount,
    dataUltimaParcelaFormatada: ultimoItem ? ultimoItem.dataFormatada : '',
  };
}
