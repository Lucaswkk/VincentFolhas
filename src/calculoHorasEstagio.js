// Usa inteiros para cortar os centavos sem erros de ponto flutuante.
export function calcularHorasEstagio(salario, tempo, percentual = 0) {
  const [mantissa, expoente = '0'] = String(salario).toLowerCase().split('e');
  const [reais, fracao = ''] = mantissa.split('.');
  const escala = fracao.length - Number(expoente);
  const salarioInteiro = BigInt(`${reais}${fracao}`) * 10n ** BigInt(Math.max(0, -escala));
  const escalaSalario = 10n ** BigInt(Math.max(0, escala));
  const [horas, minutos] = tempo.split(/[:,]/);
  const tempoDecimal = BigInt(horas) * 100n + BigInt(minutos);

  // Primeira etapa: (salário / 120) * tempo decimal, cortado em centavos.
  const baseCentavos = (salarioInteiro * tempoDecimal) / (120n * escalaSalario);
  // Segunda etapa: aplica o adicional à base já cortada e corta novamente.
  const totalCentavos = (baseCentavos * BigInt(100 + percentual)) / 100n;
  return Number(totalCentavos) / 100;
}
