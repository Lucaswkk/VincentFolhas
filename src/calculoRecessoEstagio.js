export function calcularRecessoEstagio(salario, inicio, fim) {
  if (!inicio || !fim) return null;
  const dataInicio = new Date(`${inicio}T00:00:00Z`);
  const dataFim = new Date(`${fim}T00:00:00Z`);
  if (!Number.isFinite(dataInicio.getTime()) || !Number.isFinite(dataFim.getTime()) || dataFim < dataInicio) return null;

  // Cada aniversário mensal parte do dia original, limitado ao fim do mês.
  const aniversario = (meses) => {
    const ano = dataInicio.getUTCFullYear();
    const mes = dataInicio.getUTCMonth() + meses;
    const ultimoDia = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
    return new Date(Date.UTC(ano, mes, Math.min(dataInicio.getUTCDate(), ultimoDia)));
  };
  let mesesCompletos = (dataFim.getUTCFullYear() - dataInicio.getUTCFullYear()) * 12 + dataFim.getUTCMonth() - dataInicio.getUTCMonth();
  if (aniversario(mesesCompletos) > dataFim) mesesCompletos--;
  const ultimoAniversario = aniversario(mesesCompletos);
  // Inclui o dia final na fração, como em 01/05 a 15/05 (15 dias).
  const diasRestantes = dataFim > ultimoAniversario ? (dataFim - ultimoAniversario) / 86400000 + 1 : 0;
  const meses = mesesCompletos + (diasRestantes >= 15 ? 1 : 0);
  return { meses, valor: Math.round(((Number(salario) / 12) * meses + Number.EPSILON) * 100) / 100 };
}
