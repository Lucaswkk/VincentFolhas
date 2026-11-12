import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('gerar-folha');
  const [menuAberto, setMenuAberto] = useState(false);

  const dataAtual = new Date();
  const mesString = dataAtual.toLocaleString('pt-BR', { month: 'long' });
  const competenciaAutomatica = `${mesString.charAt(0).toUpperCase() + mesString.slice(1)}/${dataAtual.getFullYear()}`;

  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cpf, setCpf] = useState('');
  const [funcionario, setFuncionario] = useState('');
  const [cargo, setCargo] = useState('');

  const [dataEntrada, setDataEntrada] = useState('');
  const [dataCompetencia, setDataCompetencia] = useState('');
  const [salarioFuncionario, setSalarioFuncionario] = useState('');
  const [usarDiasProporcionais, setUsarDiasProporcionais] = useState(false);
  const [dataInicioProp, setDataInicioProp] = useState('');
  const [dataFimProp, setDataFimProp] = useState('');

  const [rubricasFolha, setRubricasFolha] = useState([]);
  const [rubricasRescisao, setRubricasRescisao] = useState([]);
  const [rubricasFerias, setRubricasFerias] = useState([]);
  const [rubricas13, setRubricas13] = useState([]);

  const [modoAdicao, setModoAdicao] = useState('inativo');
  const [tipoNovoItem, setTipoNovoItem] = useState('');
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [rubricaFixaSelecionada, setRubricaFixaSelecionada] = useState('falta');
  const [diasFalta, setDiasFalta] = useState('');
  const [tempoHEFixa, setTempoHEFixa] = useState('');

  const [salarioBase, setSalarioBase] = useState('');
  const [admissao, setAdmissao] = useState('');
  const [demissao, setDemissao] = useState('');
  const [tipoRescisao, setTipoRescisao] = useState('sem_justa_causa');
  const [avisoPrevioIndenizado, setAvisoPrevioIndenizado] = useState(false);
  const [resultadoRescisao, setResultadoRescisao] = useState(null);
  const [tipoVinculoRescisao, setTipoVinculoRescisao] = useState('clt');
  const [bolsaEstagio, setBolsaEstagio] = useState('');
  const [inicioEstagio, setInicioEstagio] = useState('');
  const [fimEstagio, setFimEstagio] = useState('');
  const [rubricasEstagio, setRubricasEstagio] = useState([]);
  const [resultadoEstagio, setResultadoEstagio] = useState(null);

  const [salarioBaseFerias, setSalarioBaseFerias] = useState('');
  const [diasFerias, setDiasFerias] = useState('30');
  const [resultadoFerias, setResultadoFerias] = useState(null);

  const [salarioBase13, setSalarioBase13] = useState('');
  const [mesesTrabalhados13, setMesesTrabalhados13] = useState('12');
  const [resultado13, setResultado13] = useState(null);

  const [salarioBaseCombinado, setSalarioBaseCombinado] = useState('');
  const [diasFeriasCombinado, setDiasFeriasCombinado] = useState('30');
  const [meses13Combinado, setMeses13Combinado] = useState('12');
  const [rubricasCombinado, setRubricasCombinado] = useState([]);
  const [resultadoCombinado, setResultadoCombinado] = useState(null);

  const [saldos, setSaldos] = useState({
    'gerar-folha': { incluir: true, modo: 'original', dias: '', valor: '' },
    ferias: { incluir: false, modo: 'dias', dias: '', valor: '' },
    'decimo-terceiro': { incluir: false, modo: 'dias', dias: '', valor: '' },
    'ferias-decimo': { incluir: false, modo: 'dias', dias: '', valor: '' },
    rescisao: { incluir: true, modo: 'original', dias: '', valor: '' },
    estagio: { incluir: true, modo: 'original', dias: '', valor: '' }
  });

  const [salarioBaseHE, setSalarioBaseHE] = useState('');
  const [tipoCalculoRapido, setTipoCalculoRapido] = useState('he_50');
  const [tempoCalculadora, setTempoCalculadora] = useState('');
  const [diasCalculadora, setDiasCalculadora] = useState('');
  const [resultadoHE, setResultadoHE] = useState(null);

  const [salarioBaseHE2, setSalarioBaseHE2] = useState('');
  const [tipoCalculoRapido2, setTipoCalculoRapido2] = useState('he_50');
  const [tempoCalculadora2, setTempoCalculadora2] = useState('');
  const [resultadoHE2, setResultadoHE2] = useState(null);

  const [salarioBaseAN, setSalarioBaseAN] = useState('');
  const [tempoCalculadoraAN, setTempoCalculadoraAN] = useState('');
  const [resultadoAN, setResultadoAN] = useState(null);

  const trocarAba = (aba) => {
    setAbaAtiva(aba);
    setMenuAberto(false);
    setModoAdicao('inativo');
  };

  const handleCnpjChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    setCnpj(value);
  };

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    setCpf(value);
  };

  const aplicarMascaraHora = (valor) => {
    let v = valor.replace(/\D/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length > 2) v = `${v.slice(0, 2)}:${v.slice(2)}`;
    return v;
  };

  const handleTempoHEFixaChange = (e) => {
    const tempo = aplicarMascaraHora(e.target.value);
    setTempoHEFixa(abaAtiva === 'rescisao' && tipoVinculoRescisao === 'estagio' ? tempo.replace(':', ',') : tempo);
  };

  const formatarNumeroBr = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const atualizarSaldo = (aba, campo, valor) => {
    setSaldos(anterior => ({ ...anterior, [aba]: { ...anterior[aba], [campo]: valor } }));
    if (aba === 'rescisao') setResultadoRescisao(null);
    if (aba === 'estagio') setResultadoEstagio(null);
  };

  const calcularSaldoSalario = (aba, salario, valorOriginal = 0) => {
    const config = saldos[aba];
    if (!config.incluir) return 0;
    if (config.modo === 'original') return valorOriginal;
    if (config.modo === 'manual') {
      const valor = Number(config.valor);
      return Number.isFinite(valor) && valor >= 0 ? valor : 0;
    }
    const dias = Number(config.dias);
    return Number.isFinite(dias) && dias >= 0 ? (salario / 30) * dias : 0;
  };

  const validarSaldoSalario = (aba) => {
    const config = saldos[aba];
    if (!config.incluir || config.modo === 'original') return true;
    if (config.modo === 'dias') {
      const dias = Number(config.dias);
      if (config.dias === '' || !Number.isInteger(dias) || dias < 1 || dias > 30) {
        alert('Informe a quantidade de dias do saldo de salário (de 1 a 30).');
        return false;
      }
    } else if (config.modo === 'manual') {
      const valor = Number(config.valor);
      if (config.valor === '' || !Number.isFinite(valor) || valor <= 0) {
        alert('Informe um valor manual de saldo de salário maior que zero.');
        return false;
      }
    }
    return true;
  };

  const descricaoSaldoSalario = (aba, descricaoOriginal = 'Saldo de Salário') => {
    const config = saldos[aba];
    const nome = aba === 'estagio' ? 'Saldo de Bolsa-Auxílio' : 'Saldo de Salário';
    if (config.modo === 'manual') return `${nome} (manual)`;
    if (config.modo === 'dias') return `${nome} (${config.dias} dias)`;
    return descricaoOriginal;
  };

  const renderSaldoSalario = (aba, salario, valorOriginal = 0) => {
    const config = saldos[aba];
    const valor = calcularSaldoSalario(aba, salario, valorOriginal);
    const possuiPadrao = aba === 'gerar-folha' || aba === 'rescisao' || aba === 'estagio';
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{aba === 'estagio' ? 'Saldo de bolsa-auxílio' : 'Saldo de salário'}</h3>
          <p className="text-sm text-gray-500 mt-1">Defina se esta verba entra no cálculo. Os demais cálculos permanecem inalterados.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={config.incluir}
            onChange={(e) => atualizarSaldo(aba, 'incluir', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Incluir saldo de salário</span>
        </label>
        {config.incluir && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Forma de cálculo</label>
              <select
                value={config.modo}
                onChange={(e) => atualizarSaldo(aba, 'modo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {possuiPadrao && (
                  <option value="original">{aba === 'rescisao' ? 'Padrão atual (data de desligamento)' : aba === 'estagio' ? 'Por data de encerramento' : 'Padrão atual (folha)'}</option>
                )}
                <option value="dias">Automático (dias trabalhados)</option>
                <option value="manual">Manual (valor em R$)</option>
              </select>
            </div>
            {config.modo === 'dias' && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Dias trabalhados</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="1"
                  value={config.dias}
                  onChange={(e) => atualizarSaldo(aba, 'dias', e.target.value)}
                  placeholder="De 1 a 30 dias"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {config.modo === 'manual' && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Valor do saldo (R$)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={config.valor}
                  onChange={(e) => atualizarSaldo(aba, 'valor', e.target.value)}
                  placeholder="Ex: 750.00"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <p className="text-sm text-blue-700 font-semibold sm:col-span-2">
              Saldo considerado: {formatarMoeda(valor)}
            </p>
            {aba === 'gerar-folha' && config.modo === 'original' && (
              <p className="text-xs text-gray-500 sm:col-span-2">O modo padrão respeita a opção existente de Dias Proporcionais da folha.</p>
            )}
          </div>
        )}
        {!config.incluir && <p className="text-sm text-gray-500">Saldo de salário excluído do cálculo e do PDF.</p>}
      </div>
    );
  };

  let activeRubricas = rubricasFolha;
  let setActiveRubricas = setRubricasFolha;
  let activeSalario = parseFloat(salarioFuncionario) || 0;

  if (abaAtiva === 'rescisao' && tipoVinculoRescisao === 'estagio') {
      activeRubricas = rubricasEstagio;
      setActiveRubricas = setRubricasEstagio;
      activeSalario = parseFloat(bolsaEstagio) || 0;
  } else if (abaAtiva === 'rescisao') {
      activeRubricas = rubricasRescisao;
      setActiveRubricas = setRubricasRescisao;
      activeSalario = parseFloat(salarioBase) || 0;
  } else if (abaAtiva === 'ferias') {
      activeRubricas = rubricasFerias;
      setActiveRubricas = setRubricasFerias;
      activeSalario = parseFloat(salarioBaseFerias) || 0;
  } else if (abaAtiva === 'decimo-terceiro') {
      activeRubricas = rubricas13;
      setActiveRubricas = setRubricas13;
      activeSalario = parseFloat(salarioBase13) || 0;
  } else if (abaAtiva === 'ferias-decimo') {
      activeRubricas = rubricasCombinado;
      setActiveRubricas = setRubricasCombinado;
      activeSalario = parseFloat(salarioBaseCombinado) || 0;
  }

  const handleSalvarRubrica = () => {
    if (!novoCodigo || !novaDescricao || !novoValor) return;
    const valorNumerico = parseFloat(novoValor.replace(/\./g, '').replace(',', '.')) || 0;

    setActiveRubricas([...activeRubricas, { id: Date.now(), tipo: tipoNovoItem, codigo: novoCodigo, descricao: novaDescricao, valor: valorNumerico }]);
    setModoAdicao('inativo');
    setNovoCodigo('');
    setNovaDescricao('');
    setNovoValor('');
  };

  const handleSalvarRubricaFixa = () => {
    if (rubricaFixaSelecionada === 'falta') {
        if (!diasFalta || diasFalta <= 0) return;
        setActiveRubricas([...activeRubricas, { id: Date.now(), tipo: 'desconto', codigo: 'FLT', descricao: `Falta (${diasFalta} dias)`, valor: (activeSalario / 30) * parseInt(diasFalta) }]);
        setModoAdicao('inativo');
        setDiasFalta('');
    } else {
        if (!tempoHEFixa || tempoHEFixa.length !== 5) return alert("Preencha as horas e os minutos (ex.: 01:30 ou 01,30)!");
        const [h, m] = tempoHEFixa.split(/[:,]/).map(Number);
        if (m > 59) return alert("Minutos inválidos!");

        const horasDecimais = h + (m / 60);
        const estagioAtivo = abaAtiva === 'rescisao' && tipoVinculoRescisao === 'estagio';
        const divisorHoras = estagioAtivo ? 120 : 220;

        if (rubricaFixaSelecionada === 'atraso') {
            setActiveRubricas([...activeRubricas, { id: Date.now(), tipo: 'desconto', codigo: 'ATR', descricao: `Atraso (${tempoHEFixa})`, valor: horasDecimais * (activeSalario / divisorHoras) }]);
        } else if (rubricaFixaSelecionada === 'adicional_noturno') {
            setActiveRubricas([...activeRubricas, { id: Date.now(), tipo: 'provento', codigo: `ADN`, descricao: `Adicional Noturno 20% (${tempoHEFixa})`, valor: horasDecimais * (activeSalario / 220) * 0.20 }]);
        } else if (rubricaFixaSelecionada.startsWith('he_')) {
            const perc = parseInt(rubricaFixaSelecionada.split('_')[1]);
            setActiveRubricas([...activeRubricas, { id: Date.now(), tipo: 'provento', codigo: estagioAtivo ? 'CRD' : `HE${perc}`, descricao: `Hora Extra ${perc}% (${tempoHEFixa})`, valor: horasDecimais * ((activeSalario / divisorHoras) * (1 + (perc / 100))) }]);
        } else if (rubricaFixaSelecionada.startsWith('cred_')) {
            const perc = parseInt(rubricaFixaSelecionada.split('_')[1]);
            setActiveRubricas([...activeRubricas, { id: Date.now(), tipo: 'provento', codigo: `CRD`, descricao: estagioAtivo ? `Hora Extra ${perc}% (${tempoHEFixa})` : 'Crédito Diversos', valor: horasDecimais * ((activeSalario / 120) * (1 + (perc / 100))) }]);
        }
        setModoAdicao('inativo');
        setTempoHEFixa('');
    }
  };

  const handleRemoverRubrica = (id) => setActiveRubricas(activeRubricas.filter(item => item.id !== id));


  const salarioValFolha = parseFloat(salarioFuncionario) || 0;
  let salarioEfetivoFolha = salarioValFolha;
  let descricaoSalarioBase = 'Salário Base';

  if (usarDiasProporcionais && dataInicioProp && dataFimProp && salarioValFolha > 0) {
      const d1 = new Date(`${dataInicioProp}T12:00:00`);
      const d2 = new Date(`${dataFimProp}T12:00:00`);
      const diffDays = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
          salarioEfetivoFolha = (salarioValFolha / 30) * diffDays;
          descricaoSalarioBase = `Dias Proporcionais (${diffDays} dias)`;
      }
  }

  const salarioPadraoFolha = salarioEfetivoFolha;
  salarioEfetivoFolha = calcularSaldoSalario('gerar-folha', salarioValFolha, salarioPadraoFolha);
  if (saldos['gerar-folha'].modo !== 'original') {
    descricaoSalarioBase = descricaoSaldoSalario('gerar-folha');
  }

  const provsFolha = rubricasFolha.filter(r => r.tipo === 'provento');
  const descsFolha = rubricasFolha.filter(r => r.tipo === 'desconto');
  const totalProventosFolha = provsFolha.reduce((acc, curr) => acc + curr.valor, 0) + salarioEfetivoFolha;
  const totalDescontosFolha = descsFolha.reduce((acc, curr) => acc + curr.valor, 0);
  const totalLiquidoFolha = totalProventosFolha - totalDescontosFolha;

  const provsFerias = rubricasFerias.filter(r => r.tipo === 'provento');
  const descsFerias = rubricasFerias.filter(r => r.tipo === 'desconto');
  const sumProvsFerias = provsFerias.reduce((a, b) => a + b.valor, 0);
  const sumDescsFerias = descsFerias.reduce((a, b) => a + b.valor, 0);

  const calcularFerias = () => {
    if (!validarSaldoSalario('ferias')) return;
    const salario = parseFloat(salarioBaseFerias);
    const dias = parseInt(diasFerias, 10);

    if (!salario || !dias || dias < 1 || dias > 30) {
        return alert("Preencha o salário e os dias (entre 1 e 30) corretamente!");
    }

    const valorDias = (salario / 30) * dias;
    const tercoConstitucional = valorDias / 3;
    const total = valorDias + tercoConstitucional;

    setResultadoFerias({ valorDias, tercoConstitucional, total, dias });
  };
  const saldoFerias = calcularSaldoSalario('ferias', parseFloat(salarioBaseFerias) || 0);
  const liquidoFeriasFinal = (resultadoFerias?.total || 0) + saldoFerias + sumProvsFerias - sumDescsFerias;

  const provs13 = rubricas13.filter(r => r.tipo === 'provento');
  const descs13 = rubricas13.filter(r => r.tipo === 'desconto');
  const sumProvs13 = provs13.reduce((a, b) => a + b.valor, 0);
  const sumDescs13 = descs13.reduce((a, b) => a + b.valor, 0);

  const calcular13 = () => {
    if (!validarSaldoSalario('decimo-terceiro')) return;
    const salario = parseFloat(salarioBase13);
    const meses = parseInt(mesesTrabalhados13, 10);

    if (!salario || !meses || meses < 1 || meses > 12) {
        return alert("Preencha o salário e os meses trabalhados (1 a 12) corretamente!");
    }

    const valor13 = (salario / 12) * meses;
    setResultado13({ valor: valor13, meses });
  };
  const saldo13 = calcularSaldoSalario('decimo-terceiro', parseFloat(salarioBase13) || 0);
  const liquido13Final = (resultado13?.valor || 0) + saldo13 + sumProvs13 - sumDescs13;

  const provsCombinado = rubricasCombinado.filter(r => r.tipo === 'provento');
  const descsCombinado = rubricasCombinado.filter(r => r.tipo === 'desconto');
  const sumProvsCombinado = provsCombinado.reduce((a, b) => a + b.valor, 0);
  const sumDescsCombinado = descsCombinado.reduce((a, b) => a + b.valor, 0);

  const calcularFeriasDecimo = () => {
    if (!validarSaldoSalario('ferias-decimo')) return;
    const salario = parseFloat(salarioBaseCombinado);
    const dias = parseInt(diasFeriasCombinado, 10);
    const meses = parseInt(meses13Combinado, 10);

    if (!salario || !dias || dias < 1 || dias > 30) {
      return alert('Preencha o salário e os dias (entre 1 e 30) corretamente!');
    }
    if (!meses || meses < 1 || meses > 12) {
      return alert('Preencha os meses trabalhados (1 a 12) corretamente!');
    }

    const valorDias = (salario / 30) * dias;
    const tercoConstitucional = valorDias / 3;
    const totalFerias = valorDias + tercoConstitucional;
    const valor13 = (salario / 12) * meses;

    setResultadoCombinado({ valorDias, tercoConstitucional, totalFerias, valor13, dias, meses });
  };
  const saldoCombinado = calcularSaldoSalario('ferias-decimo', parseFloat(salarioBaseCombinado) || 0);
  const liquidoCombinadoFinal = (resultadoCombinado?.totalFerias || 0) +
    (resultadoCombinado?.valor13 || 0) + saldoCombinado + sumProvsCombinado - sumDescsCombinado;

  const provsRescisao = rubricasRescisao.filter(r => r.tipo === 'provento');
  const descsRescisao = rubricasRescisao.filter(r => r.tipo === 'desconto');
  const sumProvsRescisao = provsRescisao.reduce((a, b) => a + b.valor, 0);
  const sumDescsRescisao = descsRescisao.reduce((a, b) => a + b.valor, 0);

  const calcularAvosUnificados = (d1, d2) => {
    const dataInicio = new Date(`${d1}T12:00:00`);
    const dataFim = new Date(`${d2}T12:00:00`);
    let avos = 0, dAtual = new Date(dataInicio);

    while (true) {
      let proximoMes = new Date(dAtual);
      proximoMes.setMonth(proximoMes.getMonth() + 1);

      if (proximoMes > dataFim) {
        if (Math.ceil((dataFim - dAtual) / (1000 * 60 * 60 * 24)) + 1 >= 15) {
            avos++;
        }
        break;
      } else {
          avos++;
          dAtual = proximoMes;
      }
    }
    return avos;
  };

  const calcularRescisao = () => {
    const salario = parseFloat(salarioBase);
    if (!salario || !admissao || !demissao) {
        return alert("Preencha todos os campos corretamente!");
    }

    const diasTrabalhados = parseInt(demissao.split('-')[2], 10);
    const avosValidos = calcularAvosUnificados(admissao, demissao);

    if (!validarSaldoSalario('rescisao')) return;
    const saldoSalarioOriginal = (salario / 30) * diasTrabalhados;
    const saldoSalario = calcularSaldoSalario('rescisao', salario, saldoSalarioOriginal);
    let decimoTerceiro = (salario / 12) * avosValidos;
    let feriasBase = (salario / 12) * avosValidos;
    let tercoFerias = feriasBase / 3;
    let valorAviso = avisoPrevioIndenizado ? salario : 0;

    if (tipoRescisao === 'justa_causa') {
        decimoTerceiro = 0;
        feriasBase = 0;
        tercoFerias = 0;
    }

    const totalLiquido = saldoSalario + decimoTerceiro + feriasBase + tercoFerias + valorAviso;

    setResultadoRescisao({ saldoSalario, decimoTerceiro, ferias: feriasBase, tercoFerias, avisoPrevio: valorAviso, total: totalLiquido, avos: avosValidos });
  };
  const liquidoRescisaoFinal = (resultadoRescisao?.total || 0) + sumProvsRescisao - sumDescsRescisao;

  const provsEstagio = rubricasEstagio.filter(r => r.tipo === 'provento');
  const descsEstagio = rubricasEstagio.filter(r => r.tipo === 'desconto');
  const sumProvsEstagio = provsEstagio.reduce((a, b) => a + b.valor, 0);
  const sumDescsEstagio = descsEstagio.reduce((a, b) => a + b.valor, 0);

  const calcularEncerramentoEstagio = () => {
    const bolsa = parseFloat(bolsaEstagio);
    if (!Number.isFinite(bolsa) || bolsa <= 0 || !inicioEstagio || !fimEstagio) {
      return alert('Preencha bolsa-auxílio, início e encerramento do estágio corretamente!');
    }
    if (new Date(`${fimEstagio}T12:00:00`) < new Date(`${inicioEstagio}T12:00:00`)) {
      return alert('A data de encerramento deve ser igual ou posterior ao início do estágio.');
    }
    if (!validarSaldoSalario('estagio')) return;
    const diasDoMes = parseInt(fimEstagio.split('-')[2], 10);
    const saldoPadrao = (bolsa / 30) * diasDoMes;
    const saldoBolsa = calcularSaldoSalario('estagio', bolsa, saldoPadrao);
    setResultadoEstagio({ saldoBolsa, bolsa });
  };

  const liquidoEstagioFinal = (resultadoEstagio?.saldoBolsa || 0) + sumProvsEstagio - sumDescsEstagio;

  const drawPDFHeader = (doc, title) => {
    const drawField = (label, value, x, y, larguraMaxima = 60) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(label, x, y);

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      let texto = String(value ?? 'Não informado');
      while (doc.getTextWidth(texto) > larguraMaxima && texto.length > 1) {
        texto = `${texto.slice(0, -2)}…`;
      }
      doc.text(texto, x, y + 5);
    };

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 16, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 34, 182, 18, 2, 2, 'FD');
    drawField('EMPREGADOR / RAZÃO SOCIAL', razaoSocial || 'Não informado', 18, 40, 105);
    drawField('CNPJ', cnpj || 'Não informado', 130, 40, 61);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 56, 182, 38, 2, 2, 'FD');
    drawField('NOME DO FUNCIONÁRIO', funcionario || 'Não informado', 18, 62, 78);
    drawField('CPF', cpf || 'Não informado', 105, 62, 83);
    drawField('CARGO / FUNÇÃO', cargo || 'Não informado', 18, 78, 118);

    return { currentY: 102, drawField };
  };

  const drawPDFTotals = (doc, finalY, label, totalProventos, totalDescontos, totalLiquido) => {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, finalY, 182, 30, 2, 2, 'FD');
    doc.line(140, finalY, 140, finalY + 30);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Total de Proventos', 18, finalY + 10);
    doc.text('Total de Descontos', 18, finalY + 20);

    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.text(formatarMoeda(totalProventos), 135, finalY + 10, { align: 'right' });

    doc.setTextColor(185, 28, 28);
    doc.text(formatarMoeda(totalDescontos), 135, finalY + 20, { align: 'right' });

    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(240, 249, 255);
    doc.roundedRect(142, finalY + 2, 52, 26, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(3, 105, 161);
    doc.text(label, 168, finalY + 12, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(formatarMoeda(totalLiquido), 168, finalY + 22, { align: 'center' });

    return finalY + 35;
  };

  const drawPDFFooter = (doc, finalY, fileName) => {
    doc.setDrawColor(148, 163, 184);
    doc.line(14, finalY + 20, 70, finalY + 20);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('DATA', 42, finalY + 25, { align: 'center' });

    doc.line(80, finalY + 20, 196, finalY + 20);
    doc.text('ASSINATURA DO FUNCIONÁRIO', 138, finalY + 25, { align: 'center' });

    doc.setFontSize(6);
    doc.setTextColor(200, 200, 200);
    doc.text('DOCUMENTO SEM VALIDADE JURÍDICA — MERAMENTE INFORMATIVO', 105, finalY + 38, { align: 'center' });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const gerarPDF = () => {
    if (!salarioFuncionario) return alert("O campo 'Salário Base' é obrigatório para gerar o PDF!");
    if (!validarSaldoSalario('gerar-folha')) return;

    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'RECIBO DE PAGAMENTO DE SALÁRIO');

    let compFormatada = dataCompetencia ? dataCompetencia.split('-').reverse().join('/') : 'Não informada';
    drawField('COMPETÊNCIA', compFormatada, 145, 78, 45);

    let admFormatada = dataEntrada ? dataEntrada.split('-').reverse().join('/') : 'Não informada';
    drawField('ADMISSÃO', admFormatada, 90, currentY);
    drawField('SALÁRIO BASE', formatarMoeda(salarioValFolha), 130, currentY);

    const tableData = [];
    if (salarioEfetivoFolha > 0) {
        tableData.push(['001', descricaoSalarioBase, formatarNumeroBr(salarioEfetivoFolha), '']);
    }

    provsFolha.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descsFolha.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));

    if (tableData.length === 0) {
        tableData.push(['-', 'Nenhuma rubrica adicionada', '-', '-']);
    }

    autoTable(doc, {
      startY: currentY + 16,
      head: [['Cód', 'Descrição', 'Proventos (R$)', 'Descontos (R$)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          2: { halign: 'right', cellWidth: 40, textColor: [21, 128, 61] },
          3: { halign: 'right', cellWidth: 40, textColor: [185, 28, 28] }
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    finalY = drawPDFTotals(doc, finalY, 'VALOR LÍQUIDO', totalProventosFolha, totalDescontosFolha, totalLiquidoFolha);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO.', 14, finalY + 10);

    drawPDFFooter(doc, finalY + 10, `Holerite_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  const gerarPDFRescisao = () => {
    if (!resultadoRescisao) return alert("Calcule a rescisão primeiro!");
    if (!validarSaldoSalario('rescisao')) return;

    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'TERMO DE RESCISÃO DO CONTRATO');

    drawField('ADMISSÃO', admissao ? admissao.split('-').reverse().join('/') : 'Não informada', 18, currentY);
    drawField('DEMISSÃO', demissao ? demissao.split('-').reverse().join('/') : 'Não informada', 60, currentY);
    drawField('SALÁRIO BASE', formatarMoeda(parseFloat(salarioBase) || 0), 100, currentY);

    const tableData = [];
    if (resultadoRescisao.saldoSalario > 0) {
      tableData.push(['-', descricaoSaldoSalario('rescisao'), formatarNumeroBr(resultadoRescisao.saldoSalario), '']);
    }

    if (resultadoRescisao.decimoTerceiro > 0) {
        tableData.push(['-', '13º Salário Proporcional', formatarNumeroBr(resultadoRescisao.decimoTerceiro), '']);
    }
    if (resultadoRescisao.ferias > 0) {
        tableData.push(['-', 'Férias Proporcionais', formatarNumeroBr(resultadoRescisao.ferias), '']);
    }
    if (resultadoRescisao.tercoFerias > 0) {
        tableData.push(['-', '1/3 de Férias (Terço Constitucional)', formatarNumeroBr(resultadoRescisao.tercoFerias), '']);
    }
    if (resultadoRescisao.avisoPrevio > 0) {
        tableData.push(['-', 'Aviso Prévio Indenizado', formatarNumeroBr(resultadoRescisao.avisoPrevio), '']);
    }

    provsRescisao.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descsRescisao.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));

    autoTable(doc, {
      startY: currentY + 16,
      head: [['Cód', 'Descrição', 'Proventos (R$)', 'Descontos (R$)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          2: { halign: 'right', cellWidth: 40, textColor: [21, 128, 61] },
          3: { halign: 'right', cellWidth: 40, textColor: [185, 28, 28] }
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    const proventosTotais = resultadoRescisao.total + sumProvsRescisao;
    finalY = drawPDFTotals(doc, finalY, 'LÍQUIDO RESCISÃO', proventosTotais, sumDescsRescisao, liquidoRescisaoFinal);

    drawPDFFooter(doc, finalY + 10, `Rescisao_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  const gerarPDFEstagio = () => {
    if (!resultadoEstagio) return alert('Calcule o encerramento do estágio primeiro!');

    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'DEMONSTRATIVO DE ENCERRAMENTO DE ESTÁGIO');
    drawField('INÍCIO', inicioEstagio.split('-').reverse().join('/'), 18, currentY, 32);
    drawField('ENCERRAMENTO', fimEstagio.split('-').reverse().join('/'), 65, currentY, 40);
    drawField('BOLSA MENSAL', formatarMoeda(resultadoEstagio.bolsa), 125, currentY, 60);

    const tableData = [];
    if (resultadoEstagio.saldoBolsa > 0) {
      tableData.push(['-', descricaoSaldoSalario('estagio', 'Saldo de Bolsa-Auxílio'), formatarNumeroBr(resultadoEstagio.saldoBolsa), '']);
    }
    provsEstagio.forEach(p => tableData.push([p.codigo, p.codigo === 'CRD' ? 'Crédito Diverso' : p.descricao, formatarNumeroBr(p.valor), '']));
    descsEstagio.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));
    if (tableData.length === 0) tableData.push(['-', 'Nenhuma verba lançada', '', '']);

    autoTable(doc, {
      startY: currentY + 16,
      head: [['Cód', 'Descrição', 'Proventos (R$)', 'Descontos (R$)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 40, textColor: [21, 128, 61] },
        3: { halign: 'right', cellWidth: 40, textColor: [185, 28, 28] }
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    if (finalY + 90 > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      finalY = 20;
    }
    finalY = drawPDFTotals(doc, finalY, 'TOTAL CALCULADO', resultadoEstagio.saldoBolsa + sumProvsEstagio, sumDescsEstagio, liquidoEstagioFinal);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('SIMULAÇÃO. RECESSO E EVENTUAIS CONDIÇÕES DO TERMO DE COMPROMISSO NÃO INCLUÍDOS.', 14, finalY + 8);
    drawPDFFooter(doc, finalY + 10, `Encerramento_Estagio_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Estagiario'}.pdf`);
  };

  const gerarPDFFerias = () => {
    if (!resultadoFerias) return alert("Calcule as Férias primeiro!");
    if (!validarSaldoSalario('ferias')) return;

    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'RECIBO DE FÉRIAS');

    drawField('SALÁRIO BASE', formatarMoeda(parseFloat(salarioBaseFerias) || 0), 18, currentY);
    drawField('DIAS DE FÉRIAS', `${resultadoFerias.dias} dias`, 80, currentY);

    const tableData = [];
    tableData.push(['-', `Férias Proporcionais (${resultadoFerias.dias} dias)`, formatarNumeroBr(resultadoFerias.valorDias), '']);
    tableData.push(['-', '1/3 Constitucional de Férias', formatarNumeroBr(resultadoFerias.tercoConstitucional), '']);
    if (saldoFerias > 0) {
      tableData.push(['-', descricaoSaldoSalario('ferias'), formatarNumeroBr(saldoFerias), '']);
    }

    provsFerias.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descsFerias.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));

    autoTable(doc, {
      startY: currentY + 16,
      head: [['Cód', 'Descrição', 'Proventos (R$)', 'Descontos (R$)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          2: { halign: 'right', cellWidth: 40, textColor: [21, 128, 61] },
          3: { halign: 'right', cellWidth: 40, textColor: [185, 28, 28] }
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    const proventosTotais = resultadoFerias.total + saldoFerias + sumProvsFerias;
    finalY = drawPDFTotals(doc, finalY, 'LÍQUIDO DE FÉRIAS', proventosTotais, sumDescsFerias, liquidoFeriasFinal);

    drawPDFFooter(doc, finalY + 10, `Ferias_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  const gerarPDF13 = () => {
    if (!resultado13) return alert("Calcule o 13º Salário primeiro!");
    if (!validarSaldoSalario('decimo-terceiro')) return;

    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'RECIBO DE PAGAMENTO - 13º SALÁRIO');

    drawField('SALÁRIO BASE', formatarMoeda(parseFloat(salarioBase13) || 0), 18, currentY);
    drawField('MESES DE DIREITO', `${resultado13.meses} / 12`, 80, currentY);

    const tableData = [];
    tableData.push(['-', `13º Salário (${resultado13.meses}/12 avos)`, formatarNumeroBr(resultado13.valor), '']);
    if (saldo13 > 0) {
      tableData.push(['-', descricaoSaldoSalario('decimo-terceiro'), formatarNumeroBr(saldo13), '']);
    }

    provs13.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descs13.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));

    autoTable(doc, {
      startY: currentY + 16,
      head: [['Cód', 'Descrição', 'Proventos (R$)', 'Descontos (R$)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          2: { halign: 'right', cellWidth: 40, textColor: [21, 128, 61] },
          3: { halign: 'right', cellWidth: 40, textColor: [185, 28, 28] }
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    const proventosTotais = resultado13.valor + saldo13 + sumProvs13;
    finalY = drawPDFTotals(doc, finalY, 'LÍQUIDO 13º SALÁRIO', proventosTotais, sumDescs13, liquido13Final);

    drawPDFFooter(doc, finalY + 10, `Decimo_Terceiro_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  const gerarPDFFeriasDecimo = () => {
    if (!resultadoCombinado) return alert('Calcule as Férias e o 13º Salário primeiro!');
    if (!validarSaldoSalario('ferias-decimo')) return;

    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'RECIBO DE FÉRIAS E 13º SALÁRIO');

    drawField('SALÁRIO BASE', formatarMoeda(parseFloat(salarioBaseCombinado) || 0), 18, currentY);
    drawField('DIAS DE FÉRIAS', `${resultadoCombinado.dias} dias`, 80, currentY);
    drawField('MESES DE DIREITO', `${resultadoCombinado.meses} / 12`, 130, currentY);

    const tableData = [
      ['-', `Férias (${resultadoCombinado.dias} dias)`, formatarNumeroBr(resultadoCombinado.valorDias), ''],
      ['-', '1/3 Constitucional de Férias', formatarNumeroBr(resultadoCombinado.tercoConstitucional), ''],
      ['-', `13º Salário (${resultadoCombinado.meses}/12 avos)`, formatarNumeroBr(resultadoCombinado.valor13), '']
    ];

    if (saldoCombinado > 0) {
      tableData.push(['-', descricaoSaldoSalario('ferias-decimo'), formatarNumeroBr(saldoCombinado), '']);
    }
    provsCombinado.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descsCombinado.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));

    autoTable(doc, {
      startY: currentY + 16,
      head: [['Cód', 'Descrição', 'Proventos (R$)', 'Descontos (R$)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 40, textColor: [21, 128, 61] },
        3: { halign: 'right', cellWidth: 40, textColor: [185, 28, 28] }
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    if (finalY + 75 > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      finalY = 20;
    }
    const totalProventos = resultadoCombinado.totalFerias + resultadoCombinado.valor13 + saldoCombinado + sumProvsCombinado;
    finalY = drawPDFTotals(doc, finalY, 'VALOR LÍQUIDO', totalProventos, sumDescsCombinado, liquidoCombinadoFinal);

    drawPDFFooter(doc, finalY + 10, `Ferias_13_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  const calcularRapido = () => {
    const salario = parseFloat(salarioBaseHE);
    if (!salario) return alert("Preencha o Salário Base corretamente!");

    let valorFinal = 0;
    let tipoResultado = 'provento';
    let tituloResultado = 'Total a Receber:';

    if (tipoCalculoRapido === 'falta') {
        if (!diasCalculadora || diasCalculadora <= 0) return alert("Preencha a quantidade de dias!");

        valorFinal = (salario / 30) * parseInt(diasCalculadora);
        tipoResultado = 'desconto';
        tituloResultado = 'Total a Descontar:';
    } else {
        if (tempoCalculadora.length !== 5) return alert("Preencha o tempo no formato HH:MM!");

        const [h, m] = tempoCalculadora.split(':').map(Number);
        if (m > 59) return alert("Os minutos não podem ser maiores que 59!");

        const horasDecimais = h + (m / 60);

        if (tipoCalculoRapido === 'atraso') {
            valorFinal = horasDecimais * (salario / 220);
            tipoResultado = 'desconto';
            tituloResultado = 'Total a Descontar:';
        } else if (tipoCalculoRapido.startsWith('he_')) {
            const perc = parseInt(tipoCalculoRapido.split('_')[1]);
            valorFinal = horasDecimais * ((salario / 220) * (1 + (perc / 100)));
        } else if (tipoCalculoRapido.startsWith('cred_')) {
            const perc = parseInt(tipoCalculoRapido.split('_')[1]);
            valorFinal = horasDecimais * ((salario / 120) * (1 + (perc / 100)));
        }
    }
    setResultadoHE({ total: valorFinal, tipo: tipoResultado, titulo: tituloResultado });
  };

  const calcularRapidoCelular = () => {
    const salario = parseFloat(salarioBaseHE2);
    if (!salario || tempoCalculadora2.length !== 5) return alert("Preencha os campos corretamente!");

    const [h, m] = tempoCalculadora2.split(':').map(Number);
    if (m > 59) return alert("Os minutos não podem ser maiores que 59!");

    let divisor = tipoCalculoRapido2.startsWith('cred_') ? 120 : 220;
    let multiplicadorDisplay = '';
    let multiplicador = 1;
    let isDesconto = tipoCalculoRapido2 === 'atraso';

    if (tipoCalculoRapido2.startsWith('he_') || tipoCalculoRapido2.startsWith('cred_')) {
        const perc = parseInt(tipoCalculoRapido2.split('_')[1]) / 100;
        multiplicador = 1 + perc;
        multiplicadorDisplay = `+ ${perc * 100}%`;
    }

    const tempoCelular = parseFloat(tempoCalculadora2.replace(':', '.'));
    const valorBaseHora = salario / divisor;
    const valorFinal = valorBaseHora * tempoCelular * multiplicador;

    setResultadoHE2({
        total: valorFinal,
        tipo: isDesconto ? 'desconto' : 'provento',
        titulo: isDesconto ? 'Total a Descontar:' : 'Total a Receber:',
        detalhes: `Conta da Calculadora: (${formatarMoeda(salario)} ÷ ${divisor}) × ${tempoCelular} ${multiplicadorDisplay}`
    });
  };

  const calcularAdicionalNoturno = () => {
    const salario = parseFloat(salarioBaseAN);
    if (!salario || tempoCalculadoraAN.length !== 5) return alert("Preencha os campos!");

    if (Number(tempoCalculadoraAN.split(':')[1]) > 59) return alert("Minutos inválidos!");

    const tempoCelular = parseFloat(tempoCalculadoraAN.replace(':', '.'));
    const valorFinal = (salario / 220) * tempoCelular * 0.20;

    setResultadoAN({
        total: valorFinal,
        tipo: 'provento',
        titulo: 'Total a Receber:',
        detalhes: `Conta da Calculadora: (${formatarMoeda(salario)} ÷ 220) × ${tempoCelular} × 20%`
    });
  };

  const renderEmpresaFuncionarioHeader = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Empresa e Funcionário</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
                <label className="block text-sm text-gray-700 mb-1">CNPJ</label>
                <input
                    type="text"
                    maxLength="18"
                    value={cnpj}
                    onChange={handleCnpjChange}
                    placeholder="00.000.000/0000-00"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="md:col-span-3">
                <label className="block text-sm text-gray-700 mb-1">Razão Social / Empresa</label>
                <input
                    type="text"
                    maxLength="150"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Nome completo..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm text-gray-700 mb-1">CPF</label>
                <input
                    type="text"
                    maxLength="14"
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Funcionário</label>
                <input
                    type="text"
                    maxLength="100"
                    value={funcionario}
                    onChange={(e) => setFuncionario(e.target.value)}
                    placeholder="Nome completo..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm text-gray-700 mb-1">Cargo / Função</label>
                <input
                    type="text"
                    maxLength="80"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ex: Analista"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        </div>
    </div>
  );

  const renderBlocoRubricas = (exibirLinhaSalarioBase = false, descSalario = '', valorSalario = 0, somenteEstagio = false) => {
    const provs = activeRubricas.filter(r => r.tipo === 'provento');
    const descs = activeRubricas.filter(r => r.tipo === 'desconto');

    const totalProvsTabela = provs.reduce((acc, curr) => acc + curr.valor, 0) + (exibirLinhaSalarioBase ? valorSalario : 0);
    const totalDescsTabela = descs.reduce((acc, curr) => acc + curr.valor, 0);

    return (
        <div className="flex flex-col space-y-4 w-full mt-6">
            {modoAdicao === 'inativo' && (
                <button
                    onClick={() => {
                        if (!activeSalario || activeSalario <= 0) {
                            return alert("Por favor, preencha o Salário Base antes de adicionar rubricas!");
                        }
                        setModoAdicao(somenteEstagio ? 'preenchendo_fixa' : 'selecionando_tipo')
                    }}
                    className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium w-fit hover:bg-blue-100"
                >
                    + Adicionar Rubrica
                </button>
            )}

            {modoAdicao === 'selecionando_tipo' && (
                <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
                    <p className="text-sm font-medium w-full md:w-auto">Adicionar qual tipo?</p>

                    <button
                        onClick={() => { setTipoNovoItem('provento'); setModoAdicao('preenchendo'); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm flex-1 md:flex-none hover:bg-blue-700"
                    >
                        Provento
                    </button>

                    <button
                        onClick={() => { setTipoNovoItem('desconto'); setModoAdicao('preenchendo'); }}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm flex-1 md:flex-none hover:bg-red-700"
                    >
                        Desconto
                    </button>

                    <div className="hidden md:block w-px h-6 bg-gray-300 mx-1"></div>

                    <button
                        onClick={() => {
                            setTipoNovoItem('fixa');
                            setRubricaFixaSelecionada('falta');
                            setModoAdicao('preenchendo_fixa');
                        }}
                        className="bg-slate-700 text-white px-4 py-2 rounded text-sm flex-1 md:flex-none hover:bg-slate-800"
                    >
                        Fixa (Cálculo Automático)
                    </button>

                    <button
                        onClick={() => setModoAdicao('inativo')}
                        className="text-gray-500 text-sm hover:underline w-full md:w-auto md:ml-auto mt-2 md:mt-0 text-center"
                    >
                        Cancelar
                    </button>
                </div>
            )}

            {modoAdicao === 'preenchendo' && (
                <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm flex flex-col md:flex-row md:items-end gap-4">
                    <div className="w-full md:w-24">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Código</label>
                        <input
                            type="text"
                            value={novoCodigo}
                            onChange={(e) => setNovoCodigo(e.target.value.replace(/\D/g, '').slice(0,3))}
                            placeholder="000"
                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                        <input
                            type="text"
                            value={novaDescricao}
                            onChange={(e) => setNovaDescricao(e.target.value)}
                            placeholder="Ex: Bonificação"
                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Valor (R$)</label>
                        <input
                            type="text"
                            value={novoValor}
                            onChange={(e) => setNovoValor(e.target.value.replace(/[^0-9.,]/g, ''))}
                            placeholder="0,00"
                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleSalvarRubrica}
                        className="w-full md:w-auto bg-slate-800 text-white px-4 py-2 rounded h-[38px] text-sm hover:bg-slate-900"
                    >
                        Salvar
                    </button>
                </div>
            )}

            {modoAdicao === 'preenchendo_fixa' && (
                <div className="bg-slate-50 rounded-xl border border-slate-300 p-4 shadow-sm flex flex-col md:flex-row md:items-end gap-4">
                    <div className="w-full md:w-56">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={rubricaFixaSelecionada}
                            onChange={(e) => {
                                setRubricaFixaSelecionada(e.target.value);
                                setDiasFalta('');
                                setTempoHEFixa('');
                            }}
                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="falta">Falta (Dias)</option>
                            <option value="atraso">{somenteEstagio ? 'Atraso (HH,MM)' : 'Atraso (HH:MM)'}</option>
                            {!somenteEstagio && <option value="adicional_noturno">Adicional Noturno 20%</option>}
                            {somenteEstagio ? (
                              <>
                                <option value="cred_50">Hora Extra 50%</option>
                                <option value="cred_60">Hora Extra 60%</option>
                                <option value="cred_100">Hora Extra 100%</option>
                              </>
                            ) : (
                              <>
                                <option value="he_50">Hora Extra 50%</option>
                                <option value="he_60">Hora Extra 60%</option>
                                <option value="he_100">Hora Extra 100%</option>
                              </>
                            )}
                            {!somenteEstagio && (
                              <>
                                <option value="cred_50">Crédito 50%</option>
                                <option value="cred_60">Crédito 60%</option>
                                <option value="cred_100">Crédito 100%</option>
                              </>
                            )}
                        </select>
                    </div>

                    {rubricaFixaSelecionada === 'falta' ? (
                        <div className="w-full md:w-32">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Qtd. Dias</label>
                            <input
                                type="number"
                                value={diasFalta}
                                onChange={(e) => setDiasFalta(e.target.value)}
                                className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ) : (
                        <div className="w-full md:w-32">
                            <label className="block text-xs font-medium text-gray-700 mb-1">{somenteEstagio ? 'Tempo (HH,MM)' : 'Tempo (HH:MM)'}</label>
                            <input
                                type="text"
                                value={tempoHEFixa}
                                onChange={handleTempoHEFixaChange}
                                placeholder={somenteEstagio ? 'Ex: 01,30' : 'Ex: 01:30'}
                                className="w-full border border-gray-300 p-2 text-sm rounded text-center outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleSalvarRubricaFixa}
                        className="w-full md:w-auto bg-slate-800 text-white px-6 py-2 rounded text-sm h-[38px] hover:bg-slate-900"
                    >
                        Adicionar
                    </button>
                    {somenteEstagio && (
                      <button
                        type="button"
                        onClick={() => setModoAdicao('inativo')}
                        className="w-full md:w-auto border border-gray-300 text-gray-600 px-4 py-2 rounded text-sm h-[38px] hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    )}
                </div>
            )}

            {(provs.length > 0 || (exibirLinhaSalarioBase && valorSalario > 0)) && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full mt-4 shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-blue-500 text-lg font-medium">Proventos {!exibirLinhaSalarioBase && '(Adicionais)'}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 w-24">Cód</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600">Descrição</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 text-right w-32">Valor</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 text-center w-20">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exibirLinhaSalarioBase && valorSalario > 0 && (
                                    <tr className="border-b border-gray-100 bg-blue-50/30">
                                        <td className="p-3 px-4 text-sm text-gray-600">001</td>
                                        <td className="p-3 px-4 text-sm text-gray-800 font-medium">{descSalario}</td>
                                        <td className="p-3 px-4 text-right text-sm">{formatarNumeroBr(valorSalario)}</td>
                                        <td className="p-3 px-4 text-center text-gray-400">-</td>
                                    </tr>
                                )}
                                {provs.map(p => (
                                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3 px-4 text-sm text-gray-600">{p.codigo}</td>
                                        <td className="p-3 px-4 text-sm text-gray-800">{p.descricao}</td>
                                        <td className="p-3 px-4 text-right text-sm">{formatarNumeroBr(p.valor)}</td>
                                        <td className="p-3 px-4 text-center">
                                            <button onClick={() => handleRemoverRubrica(p.id)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50/80">
                        <span className="text-sm font-medium text-gray-700">Subtotal Proventos</span>
                        <span className="text-blue-600 font-bold">{formatarMoeda(totalProvsTabela)}</span>
                    </div>
                </div>
            )}

            {descs.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full mt-4 shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-red-500 text-lg font-medium">Descontos</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 w-24">Cód</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600">Descrição</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 text-right w-32">Valor</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 text-center w-20">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {descs.map(d => (
                                    <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3 px-4 text-sm text-gray-600">{d.codigo}</td>
                                        <td className="p-3 px-4 text-sm text-gray-800">{d.descricao}</td>
                                        <td className="p-3 px-4 text-right text-sm">{formatarNumeroBr(d.valor)}</td>
                                        <td className="p-3 px-4 text-center">
                                            <button onClick={() => handleRemoverRubrica(d.id)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50/80">
                        <span className="text-sm font-medium text-gray-700">Subtotal Descontos</span>
                        <span className="text-red-600 font-bold">{formatarMoeda(totalDescsTabela)}</span>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {menuAberto && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMenuAberto(false)}
          ></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="p-6 flex items-center justify-between mb-4">
             <div className="flex items-center space-x-3">
                 <img src="/logo.png" alt="Logo Grupo Vincent" className="w-8 h-8 object-contain rounded" />
                 <div>
                     <h1 className="font-bold text-lg leading-tight">Grupo Vincent</h1>
                     <p className="text-xs text-slate-400">Folha de Pagamento</p>
                 </div>
             </div>
             <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMenuAberto(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
             </button>
          </div>
          <nav className="space-y-2 px-4 overflow-y-auto max-h-[60vh]">
            <button
                onClick={() => trocarAba('gerar-folha')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'gerar-folha' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
                <span>Gerar Folha</span>
            </button>

            <button
                onClick={() => trocarAba('ferias')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'ferias' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
                <span>Férias</span>
            </button>

            <button
                onClick={() => trocarAba('decimo-terceiro')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'decimo-terceiro' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
                 <span>13º Salário</span>
             </button>

             <button
                 onClick={() => trocarAba('ferias-decimo')}
                 className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'ferias-decimo' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}
             >
                 <span>Férias + 13º</span>
             </button>

            <button
                onClick={() => trocarAba('rescisao')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'rescisao' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
                <span>Rescisão</span>
            </button>

            <button
                onClick={() => trocarAba('calculadora')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'calculadora' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
                <span>Calculadoras Rápidas</span>
            </button>
          </nav>
        </div>
        <div className="p-6">
            <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Competência atual</p>
                <p className="font-bold text-sm">{competenciaAutomatica}</p>
            </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">

        <header className="md:hidden bg-[#0f172a] text-white h-16 flex items-center justify-between px-4 shrink-0 shadow-md">
            <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded" />
                <h1 className="font-bold text-lg">Grupo Vincent</h1>
            </div>
            <button onClick={() => setMenuAberto(true)} className="text-slate-200 hover:text-white focus:outline-none">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </header>

        <header className="hidden md:block bg-white border-b border-gray-200 h-16 shrink-0"></header>

        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">

            {abaAtiva === 'gerar-folha' && (
                <div className="animate-in fade-in duration-500">
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gerar Folha de Pagamento</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">

                            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionário e Competência</h3>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm text-gray-700 mb-1">CNPJ</label>
                                        <input
                                            type="text"
                                            maxLength="18"
                                            value={cnpj}
                                            onChange={handleCnpjChange}
                                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-sm text-gray-700 mb-1">Razão Social</label>
                                        <input
                                            type="text"
                                            value={razaoSocial}
                                            onChange={(e) => setRazaoSocial(e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm text-gray-700 mb-1">CPF</label>
                                        <input
                                            type="text"
                                            maxLength="14"
                                            value={cpf}
                                            onChange={handleCpfChange}
                                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-700 mb-1">Funcionário</label>
                                        <input
                                            type="text"
                                            value={funcionario}
                                            onChange={(e) => setFuncionario(e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm text-gray-700 mb-1">Cargo</label>
                                        <input
                                            type="text"
                                            value={cargo}
                                            onChange={(e) => setCargo(e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm text-gray-700 mb-1">Admissão</label>
                                        <input
                                            type="date"
                                            value={dataEntrada}
                                            onChange={(e) => setDataEntrada(e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm text-gray-700 mb-1">Competência</label>
                                        <input
                                            type="month"
                                            value={dataCompetencia}
                                            onChange={(e) => setDataCompetencia(e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-sm rounded outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-sm font-medium">Salário Base (R$)*</label>
                                            <label className="flex items-center space-x-2 text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={usarDiasProporcionais}
                                                    onChange={(e) => setUsarDiasProporcionais(e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                                <span>Dias Proporcionais</span>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            value={salarioFuncionario}
                                            onChange={(e) => setSalarioFuncionario(e.target.value)}
                                            className="w-full border border-gray-300 p-2 text-sm rounded font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                        {usarDiasProporcionais && (
                                            <div className="flex flex-col md:flex-row gap-3 mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                <div className="flex-1">
                                                    <label className="block text-xs mb-1">Início</label>
                                                    <input
                                                        type="date"
                                                        value={dataInicioProp}
                                                        onChange={(e) => setDataInicioProp(e.target.value)}
                                                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs mb-1">Fim</label>
                                                    <input
                                                        type="date"
                                                        value={dataFimProp}
                                                        onChange={(e) => setDataFimProp(e.target.value)}
                                                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {renderSaldoSalario('gerar-folha', salarioValFolha, salarioPadraoFolha)}
                            {renderBlocoRubricas(true, descricaoSalarioBase, salarioEfetivoFolha)}

                        </div>

                        <div className="space-y-6 sticky top-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Folha</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Proventos</span>
                                        <span className="text-blue-600 font-medium">{formatarMoeda(totalProventosFolha)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Descontos</span>
                                        <span className="text-red-600 font-medium">{formatarMoeda(totalDescontosFolha)}</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-2 font-bold">
                                        <span className="text-gray-900">Líquido</span>
                                        <span className="text-lg text-gray-900">{formatarMoeda(totalLiquidoFolha)}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={gerarPDF}
                                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                Gerar PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {abaAtiva === 'ferias' && (
                <div className="max-w-3xl mx-auto w-full animate-in slide-in-from-right duration-500">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Cálculo de Férias</h2>

                    {renderEmpresaFuncionarioHeader()}

                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                                <input
                                    type="number"
                                    value={salarioBaseFerias}
                                    onChange={(e) => setSalarioBaseFerias(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Férias (Proporcionais)</label>
                                <input
                                    type="number"
                                    value={diasFerias}
                                    onChange={(e) => setDiasFerias(e.target.value)}
                                    placeholder="Ex: 30 ou 15"
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                />
                            </div>
                        </div>

                        {renderSaldoSalario('ferias', parseFloat(salarioBaseFerias) || 0)}
                        {renderBlocoRubricas()}

                        <button
                            onClick={calcularFerias}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg mt-4 transition-colors"
                        >
                            Calcular Férias
                        </button>

                        {resultadoFerias && (
                            <div className="mt-8 p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-lg text-slate-800 mb-4 border-b border-gray-200 pb-3">Resumo das Férias</h4>

                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-gray-600">Férias ({resultadoFerias.dias} dias):</span>
                                    <span className="font-medium text-gray-900">{formatarMoeda(resultadoFerias.valorDias)}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-gray-600">1/3 Constitucional:</span>
                                    <span className="font-medium text-gray-900">{formatarMoeda(resultadoFerias.tercoConstitucional)}</span>
                                </div>

                                {saldoFerias > 0 && (
                                    <div className="flex justify-between gap-3 mb-2 text-sm">
                                        <span className="text-gray-600">Saldo de Salário:</span>
                                        <span className="font-medium text-green-600">{formatarMoeda(saldoFerias)}</span>
                                    </div>
                                )}

                                {sumProvsFerias > 0 && (
                                    <div className="flex justify-between mb-2 text-sm">
                                        <span className="text-gray-600">Outros Proventos:</span>
                                        <span className="font-medium text-green-600">{formatarMoeda(sumProvsFerias)}</span>
                                    </div>
                                )}

                                {sumDescsFerias > 0 && (
                                    <div className="flex justify-between mb-2 text-sm">
                                        <span className="text-gray-600">Descontos:</span>
                                        <span className="font-medium text-red-600">-{formatarMoeda(sumDescsFerias)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-xl md:text-2xl mt-6 border-t border-gray-200 pt-6">
                                    <span className="text-slate-900">Total Líquido:</span>
                                    <span className="text-blue-600">{formatarMoeda(liquidoFeriasFinal)}</span>
                                </div>

                                <button
                                    onClick={gerarPDFFerias}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-6 rounded-lg transition-colors"
                                >
                                    Gerar PDF Férias
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {abaAtiva === 'decimo-terceiro' && (
                <div className="max-w-3xl mx-auto w-full animate-in slide-in-from-right duration-500">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Cálculo de 13º Salário</h2>

                    {renderEmpresaFuncionarioHeader()}

                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                                <input
                                    type="number"
                                    value={salarioBase13}
                                    onChange={(e) => setSalarioBase13(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meses Trabalhados no Ano</label>
                                <input
                                    type="number"
                                    max="12"
                                    min="1"
                                    value={mesesTrabalhados13}
                                    onChange={(e) => setMesesTrabalhados13(e.target.value)}
                                    placeholder="Ex: 12"
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                />
                            </div>
                        </div>

                        {renderSaldoSalario('decimo-terceiro', parseFloat(salarioBase13) || 0)}
                        {renderBlocoRubricas()}

                        <button
                            onClick={calcular13}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg mt-4 transition-colors"
                        >
                            Calcular 13º Salário
                        </button>

                        {resultado13 && (
                            <div className="mt-8 p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-lg text-slate-800 mb-4 border-b border-gray-200 pb-3">Resumo do 13º</h4>

                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-gray-600">Valor 13º ({resultado13.meses}/12 avos):</span>
                                    <span className="font-medium text-gray-900">{formatarMoeda(resultado13.valor)}</span>
                                </div>

                                {saldo13 > 0 && (
                                    <div className="flex justify-between gap-3 mb-2 text-sm">
                                        <span className="text-gray-600">Saldo de Salário:</span>
                                        <span className="font-medium text-green-600">{formatarMoeda(saldo13)}</span>
                                    </div>
                                )}

                                {sumProvs13 > 0 && (
                                    <div className="flex justify-between mb-2 text-sm">
                                        <span className="text-gray-600">Outros Proventos:</span>
                                        <span className="font-medium text-green-600">{formatarMoeda(sumProvs13)}</span>
                                    </div>
                                )}

                                {sumDescs13 > 0 && (
                                    <div className="flex justify-between mb-2 text-sm">
                                        <span className="text-gray-600">Descontos:</span>
                                        <span className="font-medium text-red-600">-{formatarMoeda(sumDescs13)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-xl md:text-2xl mt-6 border-t border-gray-200 pt-6">
                                    <span className="text-slate-900">Total Líquido:</span>
                                    <span className="text-blue-600">{formatarMoeda(liquido13Final)}</span>
                                </div>

                                <button
                                    onClick={gerarPDF13}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-6 rounded-lg transition-colors"
                                >
                                    Gerar PDF 13º Salário
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

             {abaAtiva === 'ferias-decimo' && (
                 <div className="max-w-3xl mx-auto w-full animate-in slide-in-from-right duration-500">
                     <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Cálculo de Férias + 13º Salário</h2>

                     {renderEmpresaFuncionarioHeader()}

                     <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 shadow-sm space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="md:col-span-2">
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                                 <input
                                     type="number"
                                     value={salarioBaseCombinado}
                                     onChange={(e) => { setSalarioBaseCombinado(e.target.value); setResultadoCombinado(null); }}
                                     className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Férias (Proporcionais)</label>
                                 <input
                                     type="number"
                                     min="1"
                                     max="30"
                                     value={diasFeriasCombinado}
                                     onChange={(e) => { setDiasFeriasCombinado(e.target.value); setResultadoCombinado(null); }}
                                     placeholder="Ex: 30 ou 15"
                                     className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Meses Trabalhados no Ano</label>
                                 <input
                                     type="number"
                                     min="1"
                                     max="12"
                                     value={meses13Combinado}
                                     onChange={(e) => { setMeses13Combinado(e.target.value); setResultadoCombinado(null); }}
                                     placeholder="Ex: 12"
                                     className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                 />
                             </div>
                         </div>

                         {renderSaldoSalario('ferias-decimo', parseFloat(salarioBaseCombinado) || 0)}
                         {renderBlocoRubricas()}

                         <button
                             onClick={calcularFeriasDecimo}
                             className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg mt-4 transition-colors"
                         >
                             Calcular Férias + 13º Salário
                         </button>

                         {resultadoCombinado && (
                             <div className="mt-8 p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                 <h4 className="font-bold text-lg text-slate-800 border-b border-gray-200 pb-3">Resumo Consolidado</h4>

                                 <div className="space-y-2 text-sm">
                                     <h5 className="font-bold text-gray-900">Férias</h5>
                                     <div className="flex flex-wrap justify-between gap-2">
                                         <span className="text-gray-600">Férias ({resultadoCombinado.dias} dias):</span>
                                         <span className="font-medium text-gray-900">{formatarMoeda(resultadoCombinado.valorDias)}</span>
                                     </div>
                                     <div className="flex flex-wrap justify-between gap-2">
                                         <span className="text-gray-600">1/3 Constitucional:</span>
                                         <span className="font-medium text-gray-900">{formatarMoeda(resultadoCombinado.tercoConstitucional)}</span>
                                     </div>
                                     <div className="flex flex-wrap justify-between gap-2 font-semibold border-t border-gray-200 pt-2">
                                         <span className="text-gray-700">Subtotal de Férias:</span>
                                         <span className="text-gray-900">{formatarMoeda(resultadoCombinado.totalFerias)}</span>
                                     </div>
                                 </div>

                                 <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                                     <h5 className="font-bold text-gray-900">13º Salário</h5>
                                     <div className="flex flex-wrap justify-between gap-2">
                                         <span className="text-gray-600">13º Salário ({resultadoCombinado.meses}/12 avos):</span>
                                         <span className="font-medium text-gray-900">{formatarMoeda(resultadoCombinado.valor13)}</span>
                                     </div>
                                 </div>

                                  {saldoCombinado > 0 && (
                                      <div className="flex flex-wrap justify-between gap-2 text-sm border-t border-gray-200 pt-4">
                                          <span className="text-gray-600">Saldo de Salário:</span>
                                          <span className="font-medium text-green-600">{formatarMoeda(saldoCombinado)}</span>
                                      </div>
                                  )}

                                 {(sumProvsCombinado > 0 || sumDescsCombinado > 0) && (
                                     <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                                         {sumProvsCombinado > 0 && (
                                             <div className="flex flex-wrap justify-between gap-2">
                                                 <span className="text-gray-600">Outros Proventos:</span>
                                                 <span className="font-medium text-green-600">{formatarMoeda(sumProvsCombinado)}</span>
                                             </div>
                                         )}
                                         {sumDescsCombinado > 0 && (
                                             <div className="flex flex-wrap justify-between gap-2">
                                                 <span className="text-gray-600">Descontos:</span>
                                                 <span className="font-medium text-red-600">-{formatarMoeda(sumDescsCombinado)}</span>
                                             </div>
                                         )}
                                     </div>
                                 )}

                                 <div className="flex flex-wrap justify-between gap-2 font-bold text-xl md:text-2xl border-t border-gray-200 pt-6">
                                     <span className="text-slate-900">Total Consolidado:</span>
                                     <span className="text-blue-600">{formatarMoeda(liquidoCombinadoFinal)}</span>
                                 </div>

                                 <button
                                     onClick={gerarPDFFeriasDecimo}
                                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-2 rounded-lg transition-colors"
                                 >
                                     Gerar PDF Férias + 13º
                                 </button>
                             </div>
                         )}
                     </div>
                 </div>
             )}

             {abaAtiva === 'rescisao' && (
                <div className="max-w-3xl mx-auto w-full animate-in slide-in-from-right duration-500">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Cálculo de Rescisão</h2>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm mb-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Tipo de vínculo</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => { setTipoVinculoRescisao('clt'); setModoAdicao('inativo'); }}
                          className={`rounded-lg p-3 text-sm font-semibold border ${tipoVinculoRescisao === 'clt' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          Funcionário CLT
                        </button>
                        <button
                          type="button"
                          onClick={() => { setTipoVinculoRescisao('estagio'); setModoAdicao('inativo'); setRubricaFixaSelecionada('falta'); }}
                          className={`rounded-lg p-3 text-sm font-semibold border ${tipoVinculoRescisao === 'estagio' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          Estagiário
                        </button>
                      </div>
                    </div>

                    {tipoVinculoRescisao === 'clt' && (
                      <>
                    {renderEmpresaFuncionarioHeader()}

                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Salário Base (R$)</label>
                                    <label className="flex items-center space-x-2 text-xs font-medium text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={avisoPrevioIndenizado}
                                            onChange={(e) => setAvisoPrevioIndenizado(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <span>Aviso Prévio Indenizado</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    value={salarioBase}
                                    onChange={(e) => setSalarioBase(e.target.value)}
                                    placeholder="Ex: 3200"
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Rescisão</label>
                                <select
                                    value={tipoRescisao}
                                    onChange={(e) => setTipoRescisao(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="sem_justa_causa">Sem Justa Causa</option>
                                    <option value="pedido_demissao">Pedido de Demissão</option>
                                    <option value="justa_causa">Justa Causa</option>
                                    <option value="acordo">Acordo (Art. 484-A)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
                                <input
                                    type="date"
                                    value={admissao}
                                    onChange={(e) => setAdmissao(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Desligamento</label>
                                <input
                                    type="date"
                                    value={demissao}
                                    onChange={(e) => setDemissao(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                />
                            </div>
                        </div>

                        {renderSaldoSalario('rescisao', parseFloat(salarioBase) || 0, demissao ? ((parseFloat(salarioBase) || 0) / 30) * parseInt(demissao.split('-')[2], 10) : 0)}
                        {renderBlocoRubricas()}

                        <button
                            onClick={calcularRescisao}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg mt-4 transition-colors"
                        >
                            Calcular Verbas Rescisórias
                        </button>

                        {resultadoRescisao && (
                            <div className="mt-8 p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-4">
                                <h4 className="font-bold text-lg text-slate-800 mb-4 border-b border-gray-200 pb-3">
                                    Resumo do Cálculo
                                    <span className="text-sm font-normal text-gray-500 md:ml-2 block md:inline">({resultadoRescisao.avos} avos de direito)</span>
                                </h4>

                                {resultadoRescisao.saldoSalario > 0 && (
                                    <div className="flex justify-between items-center gap-3">
                                        <span className="text-gray-600">Saldo de Salário:</span>
                                        <span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.saldoSalario)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">13º Salário Proporcional:</span>
                                    <span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.decimoTerceiro)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Férias Proporcionais:</span>
                                    <span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.ferias)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">1/3 de Férias:</span>
                                    <span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.tercoFerias)}</span>
                                </div>

                                {resultadoRescisao.avisoPrevio > 0 && (
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-blue-600 font-medium">Aviso Prévio Indenizado:</span>
                                        <span className="font-bold text-blue-600 text-base">{formatarMoeda(resultadoRescisao.avisoPrevio)}</span>
                                    </div>
                                )}

                                {sumProvsRescisao > 0 && (
                                    <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                                        <span className="text-gray-600">Outros Proventos:</span>
                                        <span className="font-medium text-green-600 text-base">{formatarMoeda(sumProvsRescisao)}</span>
                                    </div>
                                )}

                                {sumDescsRescisao > 0 && (
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-gray-600">Descontos:</span>
                                        <span className="font-medium text-red-600 text-base">-{formatarMoeda(sumDescsRescisao)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center font-bold text-xl md:text-2xl mt-6 border-t border-gray-200 pt-6 text-slate-900">
                                    <span>Total Líquido:</span>
                                    <span className="text-blue-600">{formatarMoeda(liquidoRescisaoFinal)}</span>
                                </div>

                                <button
                                    onClick={gerarPDFRescisao}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-6 rounded-lg transition-colors"
                                >
                                    Gerar PDF da Rescisão
                                </button>
                            </div>
                        )}
                    </div>
                      </>
                    )}

                    {tipoVinculoRescisao === 'estagio' && (
                      <>
                        {renderEmpresaFuncionarioHeader()}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 shadow-sm space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Bolsa-auxílio mensal (R$)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={bolsaEstagio}
                                onChange={(e) => { setBolsaEstagio(e.target.value); setResultadoEstagio(null); }}
                                placeholder="Ex: 1500"
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Início do estágio</label>
                              <input
                                type="date"
                                value={inicioEstagio}
                                onChange={(e) => { setInicioEstagio(e.target.value); setResultadoEstagio(null); }}
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Encerramento do estágio</label>
                              <input
                                type="date"
                                value={fimEstagio}
                                onChange={(e) => { setFimEstagio(e.target.value); setResultadoEstagio(null); }}
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          {renderSaldoSalario('estagio', parseFloat(bolsaEstagio) || 0, fimEstagio ? ((parseFloat(bolsaEstagio) || 0) / 30) * parseInt(fimEstagio.split('-')[2], 10) : 0)}
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Rubricas disponíveis: Falta, Atraso e Hora Extra (50%, 60% ou 100%). No PDF, as horas extras constam como Crédito Diverso.</p>
                            <p className="text-sm text-gray-600 mb-2">Atraso = (bolsa mensal ÷ 120) × tempo em horas. Hora extra = mesmo cálculo com acréscimo de 50%, 60% ou 100%. Informe 01,30 para 1 hora e 30 minutos.</p>
                            {renderBlocoRubricas(false, '', 0, true)}
                          </div>
                          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            Simulação informativa: o cálculo utiliza as fórmulas já existentes do sistema. O recesso de estágio e outras condições do Termo de Compromisso não estão calculados nesta etapa.
                          </p>
                          <button
                            onClick={calcularEncerramentoEstagio}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg transition-colors"
                          >
                            Calcular Encerramento de Estágio
                          </button>
                          {resultadoEstagio && (
                            <div className="mt-6 p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                              <h4 className="font-bold text-lg text-slate-800 border-b border-gray-200 pb-3">Resumo do Estágio</h4>
                              {resultadoEstagio.saldoBolsa > 0 && (
                                <div className="flex flex-wrap justify-between gap-2 text-sm">
                                  <span className="text-gray-600">Saldo de Bolsa-Auxílio:</span>
                                  <span className="font-medium text-gray-900">{formatarMoeda(resultadoEstagio.saldoBolsa)}</span>
                                </div>
                              )}
                              {sumProvsEstagio > 0 && (
                                <div className="flex flex-wrap justify-between gap-2 text-sm">
                                  <span className="text-gray-600">Horas Extras:</span>
                                  <span className="font-medium text-green-600">{formatarMoeda(sumProvsEstagio)}</span>
                                </div>
                              )}
                              {sumDescsEstagio > 0 && (
                                <div className="flex flex-wrap justify-between gap-2 text-sm">
                                  <span className="text-gray-600">Faltas e Atrasos:</span>
                                  <span className="font-medium text-red-600">-{formatarMoeda(sumDescsEstagio)}</span>
                                </div>
                              )}
                              <div className="flex flex-wrap justify-between gap-2 font-bold text-xl md:text-2xl border-t border-gray-200 pt-5">
                                <span className="text-slate-900">Total Calculado:</span>
                                <span className="text-blue-600">{formatarMoeda(liquidoEstagioFinal)}</span>
                              </div>
                              <button
                                onClick={gerarPDFEstagio}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                              >
                                Gerar PDF do Estágio
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                </div>
            )}

            {abaAtiva === 'calculadora' && (
                <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-right duration-500 pb-12">

                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Calculadora Rápida (Decimal)</h2>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 2000"
                                    value={salarioBaseHE}
                                    onChange={(e) => setSalarioBaseHE(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cálculo</label>
                                <select
                                    value={tipoCalculoRapido}
                                    onChange={(e) => {
                                        setTipoCalculoRapido(e.target.value);
                                        setResultadoHE(null);
                                        setTempoCalculadora('');
                                        setDiasCalculadora('');
                                    }}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="he_50">Hora Extra 50%</option>
                                    <option value="he_60">Hora Extra 60%</option>
                                    <option value="he_100">Hora Extra 100%</option>
                                    <option value="cred_50">Hora Extra 50% ( Cred. Div. )</option>
                                    <option value="cred_60">Hora Extra 60% ( Cred. Div. )</option>
                                    <option value="cred_100">Hora Extra 100% ( Cred. Div. )</option>
                                    <option value="atraso">Atraso</option>
                                    <option value="falta">Falta</option>
                                </select>
                            </div>
                            <div>
                                {tipoCalculoRapido === 'falta' ? (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. de Dias</label>
                                        <input
                                            type="number"
                                            placeholder="Ex: 2"
                                            value={diasCalculadora}
                                            onChange={(e) => setDiasCalculadora(e.target.value)}
                                            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (HH:MM)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 05:45"
                                            value={tempoCalculadora}
                                            onChange={(e) => setTempoCalculadora(aplicarMascaraHora(e.target.value))}
                                            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-medium"
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={calcularRapido}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg transition-colors"
                        >
                            Calcular (Padrão Decimal)
                        </button>

                        {resultadoHE && (
                            <div className={`mt-8 p-4 md:p-6 rounded-xl border ${resultadoHE.tipo === 'desconto' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex justify-between items-center font-bold text-xl md:text-2xl text-slate-900">
                                    <span>{resultadoHE.titulo}</span>
                                    <span className={resultadoHE.tipo === 'desconto' ? 'text-red-600' : 'text-blue-600'}>
                                        {formatarMoeda(resultadoHE.total)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-12 mb-6">Cálculo Padrão Celular / Calculadora</h2>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 2000"
                                    value={salarioBaseHE2}
                                    onChange={(e) => setSalarioBaseHE2(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cálculo</label>
                                <select
                                    value={tipoCalculoRapido2}
                                    onChange={(e) => {
                                        setTipoCalculoRapido2(e.target.value);
                                        setResultadoHE2(null);
                                        setTempoCalculadora2('');
                                    }}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="he_50">Hora Extra 50%</option>
                                    <option value="he_60">Hora Extra 60%</option>
                                    <option value="he_100">Hora Extra 100%</option>
                                    <option value="cred_50">Hora Extra 50% ( Cred. Div. )</option>
                                    <option value="cred_60">Hora Extra 60% ( Cred. Div. )</option>
                                    <option value="cred_100">Hora Extra 100% ( Cred. Div. )</option>
                                    <option value="atraso">Atraso</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (HH:MM)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 15:45"
                                    value={tempoCalculadora2}
                                    onChange={(e) => setTempoCalculadora2(aplicarMascaraHora(e.target.value))}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-medium"
                                />
                            </div>
                        </div>

                        <button
                            onClick={calcularRapidoCelular}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg transition-colors"
                        >
                            Calcular (Padrão Celular)
                        </button>

                        {resultadoHE2 && (
                            <div className={`mt-8 p-4 md:p-6 rounded-xl border ${resultadoHE2.tipo === 'desconto' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex justify-between items-center font-bold text-xl md:text-2xl text-slate-900 mb-2">
                                    <span>{resultadoHE2.titulo}</span>
                                    <span className={resultadoHE2.tipo === 'desconto' ? 'text-red-600' : 'text-blue-600'}>
                                        {formatarMoeda(resultadoHE2.total)}
                                    </span>
                                </div>
                                <div className="text-xs md:text-sm text-gray-500 font-medium text-right border-t border-gray-200/50 pt-2 mt-2">
                                    {resultadoHE2.detalhes}
                                </div>
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-12 mb-6">Cálculo de Adicional Noturno (20%)</h2>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 2500"
                                    value={salarioBaseAN}
                                    onChange={(e) => setSalarioBaseAN(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (HH:MM)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 00:56"
                                    value={tempoCalculadoraAN}
                                    onChange={(e) => setTempoCalculadoraAN(aplicarMascaraHora(e.target.value))}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-medium"
                                />
                            </div>
                        </div>

                        <button
                            onClick={calcularAdicionalNoturno}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg mt-4 transition-colors"
                        >
                            Calcular Adicional Noturno
                        </button>

                        {resultadoAN && (
                            <div className="mt-8 p-4 md:p-6 rounded-xl border bg-blue-50 border-blue-200">
                                <div className="flex justify-between items-center font-bold text-xl md:text-2xl text-slate-900 mb-2">
                                    <span>{resultadoAN.titulo}</span>
                                    <span className="text-blue-600">{formatarMoeda(resultadoAN.total)}</span>
                                </div>
                                <div className="text-xs md:text-sm text-gray-500 font-medium text-right border-t border-gray-200/50 pt-2 mt-2">
                                    {resultadoAN.detalhes}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}

        </div>
      </main>
    </div>
  );
}

export default App;
