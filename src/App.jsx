import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  // ESTADO DE NAVEGAÇÃO E MOBILE
  const [abaAtiva, setAbaAtiva] = useState('gerar-folha');
  const [menuAberto, setMenuAberto] = useState(false);

  // DATA ATUAL PARA SIDEBAR
  const dataAtual = new Date();
  const mesString = dataAtual.toLocaleString('pt-BR', { month: 'long' });
  const competenciaAutomatica = `${mesString.charAt(0).toUpperCase() + mesString.slice(1)}/${dataAtual.getFullYear()}`;

  // ESTADOS GLOBAIS (EMPRESA / FUNCIONÁRIO)
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cpf, setCpf] = useState('');
  const [funcionario, setFuncionario] = useState('');
  const [cargo, setCargo] = useState('');

  // ESTADOS DA ABA: GERAR FOLHA
  const [dataEntrada, setDataEntrada] = useState(''); 
  const [dataCompetencia, setDataCompetencia] = useState('');
  const [salarioFuncionario, setSalarioFuncionario] = useState(''); 
  
  const [usarDiasProporcionais, setUsarDiasProporcionais] = useState(false);
  const [dataInicioProp, setDataInicioProp] = useState('');
  const [dataFimProp, setDataFimProp] = useState('');

  const [rubricas, setRubricas] = useState([]);
  const [modoAdicao, setModoAdicao] = useState('inativo'); 
  const [tipoNovoItem, setTipoNovoItem] = useState(''); 
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoValor, setNovoValor] = useState('');
  
  const [rubricaFixaSelecionada, setRubricaFixaSelecionada] = useState('falta');
  const [diasFalta, setDiasFalta] = useState(''); 
  const [tempoHEFixa, setTempoHEFixa] = useState(''); 

  // ESTADOS DA ABA: RESCISÃO
  const [salarioBase, setSalarioBase] = useState('');
  const [admissao, setAdmissao] = useState('');
  const [demissao, setDemissao] = useState('');
  const [tipoRescisao, setTipoRescisao] = useState('sem_justa_causa');
  const [avisoPrevioIndenizado, setAvisoPrevioIndenizado] = useState(false);
  const [resultadoRescisao, setResultadoRescisao] = useState(null);

  // ESTADOS DA ABA: FÉRIAS
  const [salarioBaseFerias, setSalarioBaseFerias] = useState('');
  const [diasFerias, setDiasFerias] = useState('30');
  const [resultadoFerias, setResultadoFerias] = useState(null);

  // ESTADOS DA ABA: 13º SALÁRIO
  const [salarioBase13, setSalarioBase13] = useState('');
  const [mesesTrabalhados13, setMesesTrabalhados13] = useState('12');
  const [resultado13, setResultado13] = useState(null);

  // ESTADOS DA ABA: CALCULADORA RÁPIDA
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

  // FUNÇÃO AUXILIAR PARA TROCAR DE ABA NO MOBILE
  const trocarAba = (aba) => {
    setAbaAtiva(aba);
    setMenuAberto(false);
  };

  // MÁSCARAS E FORMATAÇÕES
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

  const handleTempoHEFixaChange = (e) => setTempoHEFixa(aplicarMascaraHora(e.target.value));

  const formatarNumeroBr = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // LÓGICA DE DIAS PROPORCIONAIS (FOLHA)
  const salarioVal = parseFloat(salarioFuncionario) || 0; 
  let diasPropCalc = 0;
  let salarioEfetivoFolha = salarioVal;
  let descricaoSalarioBase = 'Salário Base';

  if (usarDiasProporcionais && dataInicioProp && dataFimProp && salarioVal > 0) {
      const d1 = new Date(`${dataInicioProp}T12:00:00`);
      const d2 = new Date(`${dataFimProp}T12:00:00`);
      const diffTime = d2 - d1;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
          diasPropCalc = diffDays;
          salarioEfetivoFolha = (salarioVal / 30) * diffDays;
          descricaoSalarioBase = `Dias Proporcionais (${diffDays} dias)`;
      }
  }

  // LÓGICA DE RUBRICAS AVULSAS E FIXAS
  const handleSalvarRubrica = () => {
    if (!novoCodigo || !novaDescricao || !novoValor) return;
    const valorNumerico = parseFloat(novoValor.replace(/\./g, '').replace(',', '.')) || 0;
    setRubricas([...rubricas, { id: Date.now(), tipo: tipoNovoItem, codigo: novoCodigo, descricao: novaDescricao, valor: valorNumerico }]);
    setModoAdicao('inativo'); 
    setNovoCodigo(''); 
    setNovaDescricao(''); 
    setNovoValor('');
  };

  const handleSalvarRubricaFixa = () => {
    if (rubricaFixaSelecionada === 'falta') {
        if (!diasFalta || diasFalta <= 0) return;
        setRubricas([...rubricas, { id: Date.now(), tipo: 'desconto', codigo: 'FLT', descricao: `Falta (${diasFalta} dias)`, valor: (salarioVal / 30) * parseInt(diasFalta) }]);
        setModoAdicao('inativo'); 
        setDiasFalta('');
    } else {
        if (!tempoHEFixa || tempoHEFixa.length !== 5) return alert("Preencha as horas (HH:MM)!");
        const [h, m] = tempoHEFixa.split(':').map(Number);
        if (m > 59) return alert("Minutos inválidos!");
        const horasDecimais = h + (m / 60);

        if (rubricaFixaSelecionada === 'atraso') {
            setRubricas([...rubricas, { id: Date.now(), tipo: 'desconto', codigo: 'ATR', descricao: `Atraso (${tempoHEFixa})`, valor: horasDecimais * (salarioVal / 220) }]);
        } else if (rubricaFixaSelecionada === 'adicional_noturno') {
            setRubricas([...rubricas, { id: Date.now(), tipo: 'provento', codigo: `ADN`, descricao: `Adicional Noturno 20% (${tempoHEFixa})`, valor: horasDecimais * (salarioVal / 220) * 0.20 }]);
        } else if (rubricaFixaSelecionada.startsWith('he_')) {
            const perc = parseInt(rubricaFixaSelecionada.split('_')[1]); 
            setRubricas([...rubricas, { id: Date.now(), tipo: 'provento', codigo: `HE${perc}`, descricao: `Hora Extra ${perc}% (${tempoHEFixa})`, valor: horasDecimais * ((salarioVal / 220) * (1 + (perc / 100))) }]);
        } else if (rubricaFixaSelecionada.startsWith('cred_')) {
            const perc = parseInt(rubricaFixaSelecionada.split('_')[1]); 
            setRubricas([...rubricas, { id: Date.now(), tipo: 'provento', codigo: `CRD`, descricao: `Crédito Diversos`, valor: horasDecimais * ((salarioVal / 120) * (1 + (perc / 100))) }]);
        }
        setModoAdicao('inativo'); 
        setTempoHEFixa('');
    }
  };

  const handleRemoverRubrica = (id) => setRubricas(rubricas.filter(item => item.id !== id));

  const proventos = rubricas.filter(r => r.tipo === 'provento');
  const descontos = rubricas.filter(r => r.tipo === 'desconto');
  const totalProventos = proventos.reduce((acc, curr) => acc + curr.valor, 0) + salarioEfetivoFolha; 
  const totalDescontos = descontos.reduce((acc, curr) => acc + curr.valor, 0);
  const totalLiquido = totalProventos - totalDescontos;

  // LÓGICA DE FÉRIAS
  const calcularFerias = () => {
    const salario = parseFloat(salarioBaseFerias);
    const dias = parseInt(diasFerias, 10);
    
    if (!salario || !dias || dias < 1 || dias > 30) {
        return alert("Preencha o salário e os dias (entre 1 e 30) corretamente!");
    }
    
    const valorDias = (salario / 30) * dias;
    const tercoConstitucional = valorDias / 3;
    const total = valorDias + tercoConstitucional;

    setResultadoFerias({ 
        valorDias, 
        tercoConstitucional, 
        total, 
        dias 
    });
  };

  // LÓGICA DE 13º SALÁRIO
  const calcular13 = () => {
    const salario = parseFloat(salarioBase13);
    const meses = parseInt(mesesTrabalhados13, 10);
    
    if (!salario || !meses || meses < 1 || meses > 12) {
        return alert("Preencha o salário e os meses trabalhados (1 a 12) corretamente!");
    }

    const valor13 = (salario / 12) * meses;
    
    setResultado13({ 
        valor: valor13, 
        meses 
    });
  };

  // LÓGICA DE RESCISÃO
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
    
    const saldoSalario = (salario / 30) * diasTrabalhados;
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
    
    setResultadoRescisao({ 
        saldoSalario, 
        decimoTerceiro, 
        ferias: feriasBase, 
        tercoFerias, 
        avisoPrevio: valorAviso, 
        total: totalLiquido, 
        avos: avosValidos 
    });
  };

  // GERADORES DE PDF BASE (Helper)
  const drawPDFHeader = (doc, title) => {
    const drawField = (label, value, x, y) => {
      doc.setFontSize(8); 
      doc.setTextColor(100, 116, 139); 
      doc.setFont('helvetica', 'normal'); 
      doc.text(label, x, y);
      
      doc.setFontSize(10); 
      doc.setTextColor(15, 23, 42); 
      doc.setFont('helvetica', 'bold'); 
      doc.text(value, x, y + 5);
    };

    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 26, 'F');
    
    doc.setTextColor(255, 255, 255); 
    doc.setFontSize(14); 
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 16, { align: 'center' });

    let currentY = 34;
    doc.setDrawColor(226, 232, 240); 
    doc.setFillColor(248, 250, 252); 
    doc.roundedRect(14, currentY, 182, 18, 2, 2, 'FD'); 
    drawField('EMPREGADOR / RAZÃO SOCIAL', razaoSocial || 'Não informado', 18, currentY + 6);
    drawField('CNPJ', cnpj || 'Não informado', 130, currentY + 6);
    
    currentY += 22;
    doc.setDrawColor(226, 232, 240); 
    doc.setFillColor(248, 250, 252); 
    doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');
    drawField('NOME DO FUNCIONÁRIO', funcionario || 'Não informado', 18, currentY + 6);
    drawField('CPF', cpf || 'Não informado', 100, currentY + 6);
    drawField('CARGO / FUNÇÃO', cargo || 'Não informado', 145, currentY + 6);

    return { currentY: currentY + 18, drawField };
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

    // Aviso de validade jurídica discreto
    doc.setFontSize(6); 
    doc.setTextColor(200, 200, 200);
    doc.text('DOCUMENTO SEM VALIDADE JURÍDICA — MERAMENTE INFORMATIVO', 105, finalY + 38, { align: 'center' });

    // Código de Download Blob para Mobile e PC
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

  // PDF: FOLHA
  const gerarPDF = () => {
    if (!salarioFuncionario) return alert("O campo 'Salário Base' é obrigatório para gerar o PDF!");
    
    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'RECIBO DE PAGAMENTO DE SALÁRIO');
    
    let compFormatada = dataCompetencia ? dataCompetencia.split('-').reverse().join('/') : 'Não informada';
    drawField('COMPETÊNCIA', compFormatada, 170, currentY - 12); 
    
    let admFormatada = dataEntrada ? dataEntrada.split('-').reverse().join('/') : 'Não informada';
    drawField('ADMISSÃO', admFormatada, 90, currentY);
    drawField('SALÁRIO BASE', formatarMoeda(salarioVal), 130, currentY);

    const tableData = [];
    if (salarioEfetivoFolha > 0) {
        tableData.push(['001', descricaoSalarioBase, formatarNumeroBr(salarioEfetivoFolha), '']);
    }
    
    proventos.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descontos.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));
    
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
    doc.text('VALOR LÍQUIDO', 168, finalY + 12, { align: 'center' });
    
    doc.setFontSize(14); 
    doc.setTextColor(15, 23, 42); 
    doc.text(formatarMoeda(totalLiquido), 168, finalY + 22, { align: 'center' });

    doc.setFontSize(8); 
    doc.setTextColor(100, 116, 139); 
    doc.setFont('helvetica', 'normal');
    doc.text('DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO.', 14, finalY + 45);

    drawPDFFooter(doc, finalY + 25, `Holerite_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  // PDF: RESCISÃO
  const gerarPDFRescisao = () => {
    if (!resultadoRescisao) return alert("Calcule a rescisão primeiro!");
    
    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'TERMO DE RESCISÃO DO CONTRATO');

    drawField('ADMISSÃO', admissao ? admissao.split('-').reverse().join('/') : 'Não informada', 18, currentY);
    drawField('DEMISSÃO', demissao ? demissao.split('-').reverse().join('/') : 'Não informada', 60, currentY);
    drawField('SALÁRIO BASE', formatarMoeda(parseFloat(salarioBase) || 0), 100, currentY);

    const tableData = [['Saldo de Salário', formatarNumeroBr(resultadoRescisao.saldoSalario)]];
    
    if (resultadoRescisao.decimoTerceiro > 0) {
        tableData.push(['13º Salário Proporcional', formatarNumeroBr(resultadoRescisao.decimoTerceiro)]);
    }
    if (resultadoRescisao.ferias > 0) {
        tableData.push(['Férias Proporcionais', formatarNumeroBr(resultadoRescisao.ferias)]);
    }
    if (resultadoRescisao.tercoFerias > 0) {
        tableData.push(['1/3 de Férias (Terço Constitucional)', formatarNumeroBr(resultadoRescisao.tercoFerias)]);
    }
    if (resultadoRescisao.avisoPrevio > 0) {
        tableData.push(['Aviso Prévio Indenizado', formatarNumeroBr(resultadoRescisao.avisoPrevio)]);
    }

    autoTable(doc, {
      startY: currentY + 16, 
      head: [['Descrição das Verbas', 'Valor (R$)']], 
      body: tableData, 
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', halign: 'left' },
      columnStyles: { 
          1: { halign: 'right', cellWidth: 50, textColor: [21, 128, 61] } 
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] }, 
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    
    doc.setFillColor(240, 249, 255); 
    doc.setDrawColor(186, 230, 253); 
    doc.roundedRect(14, finalY, 182, 16, 2, 2, 'FD');
    
    doc.setFontSize(11); 
    doc.setTextColor(15, 23, 42); 
    doc.setFont('helvetica', 'bold'); 
    doc.text('Total Líquido Rescisório:', 18, finalY + 10);
    
    doc.setFontSize(12); 
    doc.setTextColor(3, 105, 161); 
    doc.text(formatarMoeda(resultadoRescisao.total), 190, finalY + 11, { align: 'right' });

    drawPDFFooter(doc, finalY + 15, `Rescisao_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  // PDF: FÉRIAS
  const gerarPDFFerias = () => {
    if (!resultadoFerias) return alert("Calcule as Férias primeiro!");
    
    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'RECIBO DE FÉRIAS');

    drawField('SALÁRIO BASE', formatarMoeda(parseFloat(salarioBaseFerias) || 0), 18, currentY);
    drawField('DIAS DE FÉRIAS', `${resultadoFerias.dias} dias`, 80, currentY);

    const tableData = [
      [`Férias Proporcionais (${resultadoFerias.dias} dias)`, formatarNumeroBr(resultadoFerias.valorDias)],
      ['1/3 Constitucional de Férias', formatarNumeroBr(resultadoFerias.tercoConstitucional)]
    ];

    autoTable(doc, {
      startY: currentY + 16, 
      head: [['Descrição das Verbas', 'Valor (R$)']], 
      body: tableData, 
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', halign: 'left' },
      columnStyles: { 
          1: { halign: 'right', cellWidth: 50, textColor: [21, 128, 61] } 
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] }, 
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    
    doc.setFillColor(240, 249, 255); 
    doc.setDrawColor(186, 230, 253); 
    doc.roundedRect(14, finalY, 182, 16, 2, 2, 'FD');
    
    doc.setFontSize(11); 
    doc.setTextColor(15, 23, 42); 
    doc.setFont('helvetica', 'bold'); 
    doc.text('Total Líquido de Férias:', 18, finalY + 10);
    
    doc.setFontSize(12); 
    doc.setTextColor(3, 105, 161); 
    doc.text(formatarMoeda(resultadoFerias.total), 190, finalY + 11, { align: 'right' });

    drawPDFFooter(doc, finalY + 15, `Ferias_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  // PDF: 13º SALÁRIO
  const gerarPDF13 = () => {
    if (!resultado13) return alert("Calcule o 13º Salário primeiro!");
    
    const doc = new jsPDF();
    const { currentY, drawField } = drawPDFHeader(doc, 'RECIBO DE PAGAMENTO - 13º SALÁRIO');

    drawField('SALÁRIO BASE', formatarMoeda(parseFloat(salarioBase13) || 0), 18, currentY);
    drawField('MESES DE DIREITO', `${resultado13.meses} / 12`, 80, currentY);

    const tableData = [
      [`13º Salário (${resultado13.meses}/12 avos)`, formatarNumeroBr(resultado13.valor)]
    ];

    autoTable(doc, {
      startY: currentY + 16, 
      head: [['Descrição das Verbas', 'Valor (R$)']], 
      body: tableData, 
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', halign: 'left' },
      columnStyles: { 
          1: { halign: 'right', cellWidth: 50, textColor: [21, 128, 61] } 
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] }, 
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    
    doc.setFillColor(240, 249, 255); 
    doc.setDrawColor(186, 230, 253); 
    doc.roundedRect(14, finalY, 182, 16, 2, 2, 'FD');
    
    doc.setFontSize(11); 
    doc.setTextColor(15, 23, 42); 
    doc.setFont('helvetica', 'bold'); 
    doc.text('Total Líquido 13º Salário:', 18, finalY + 10);
    
    doc.setFontSize(12); 
    doc.setTextColor(3, 105, 161); 
    doc.text(formatarMoeda(resultado13.valor), 190, finalY + 11, { align: 'right' });

    drawPDFFooter(doc, finalY + 15, `Decimo_Terceiro_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  // LÓGICA DA CALCULADORA RÁPIDA
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
    setResultadoHE({ 
        total: valorFinal, 
        tipo: tipoResultado, 
        titulo: tituloResultado 
    });
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

  // RENDERS GLOBAIS DE UI
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

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* OVERLAY PARA O MENU MOBILE */}
      {menuAberto && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setMenuAberto(false)}
          ></div>
      )}

      {/* BARRA LATERAL (SIDEBAR) */}
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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* HEADER MOBILE */}
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

        {/* HEADER DESKTOP */}
        <header className="hidden md:block bg-white border-b border-gray-200 h-16 shrink-0"></header>

        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
            
            {/* ======================================================== */}
            {/* ABA: GERAR FOLHA                                         */}
            {/* ======================================================== */}
            {abaAtiva === 'gerar-folha' && (
                <div className="animate-in fade-in duration-500">
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gerar Folha de Pagamento</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* DADOS DA EMPRESA E FUNCIONÁRIO (FOLHA) */}
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

                            {/* ADIÇÃO DE RUBRICAS */}
                            <div className="flex flex-col space-y-4">
                                {modoAdicao === 'inativo' && (
                                    <button 
                                        onClick={() => setModoAdicao('selecionando_tipo')} 
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
                                                if (!salarioFuncionario) return alert("Preencha o Salário Base!"); 
                                                setTipoNovoItem('fixa'); 
                                                setRubricaFixaSelecionada('falta'); 
                                                setModoAdicao('preenchendo_fixa'); 
                                            }} 
                                            className="bg-slate-700 text-white px-4 py-2 rounded text-sm flex-1 md:flex-none hover:bg-slate-800"
                                        >
                                            Fixa
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
                                                className="w-full border border-gray-300 p-2 text-sm rounded" 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                                            <input 
                                                type="text" 
                                                value={novaDescricao} 
                                                onChange={(e) => setNovaDescricao(e.target.value)} 
                                                className="w-full border border-gray-300 p-2 text-sm rounded" 
                                            />
                                        </div>
                                        <div className="w-full md:w-32">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
                                            <input 
                                                type="text" 
                                                value={novoValor} 
                                                onChange={(e) => setNovoValor(e.target.value.replace(/[^0-9.,]/g, ''))} 
                                                className="w-full border border-gray-300 p-2 text-sm rounded" 
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
                                                <option value="atraso">Atraso (HH:MM)</option>
                                                <option value="adicional_noturno">Adicional Noturno 20%</option>
                                                <option value="he_50">Hora Extra 50%</option>
                                                <option value="he_60">Hora Extra 60%</option>
                                                <option value="he_100">Hora Extra 100%</option>
                                                <option value="cred_50">Crédito 50%</option>
                                                <option value="cred_60">Crédito 60%</option>
                                                <option value="cred_100">Crédito 100%</option>
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Tempo (HH:MM)</label>
                                                <input 
                                                    type="text" 
                                                    value={tempoHEFixa} 
                                                    onChange={handleTempoHEFixaChange} 
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
                                    </div>
                                )}
                            </div>

                            {/* TABELAS DA FOLHA */}
                            {proventos.length > 0 || salarioEfetivoFolha > 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                                        <h3 className="text-blue-500 text-lg font-medium">Proventos</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[500px] text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="py-3 px-4 text-sm font-medium w-24">Cód</th>
                                                    <th className="py-3 px-4 text-sm font-medium">Descrição</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-right w-32">Valor</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-center w-20">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {salarioEfetivoFolha > 0 && (
                                                    <tr className="border-b border-gray-100 bg-blue-50/30">
                                                        <td className="p-3 px-4 text-sm text-gray-600">001</td>
                                                        <td className="p-3 px-4 text-sm text-gray-800 font-medium">{descricaoSalarioBase}</td>
                                                        <td className="p-3 px-4 text-right text-sm">{formatarNumeroBr(salarioEfetivoFolha)}</td>
                                                        <td className="p-3 px-4 text-center text-gray-400">-</td>
                                                    </tr>
                                                )}
                                                {proventos.map(p => (
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
                                        <span className="text-sm font-medium">Total Proventos</span>
                                        <span className="text-blue-600 font-bold">{formatarMoeda(totalProventos)}</span>
                                    </div>
                                </div>
                            ) : null}

                            {descontos.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full mt-6">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                                        <h3 className="text-red-500 text-lg font-medium">Descontos</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[500px] text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="py-3 px-4 text-sm font-medium w-24">Cód</th>
                                                    <th className="py-3 px-4 text-sm font-medium">Descrição</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-right w-32">Valor</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-center w-20">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {descontos.map(d => (
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
                                        <span className="text-sm font-medium">Total Descontos</span>
                                        <span className="text-red-600 font-bold">{formatarMoeda(totalDescontos)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RESUMO LATERAL (FOLHA) */}
                        <div className="space-y-6 sticky top-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Proventos</span>
                                        <span className="text-blue-600 font-medium">{formatarMoeda(totalProventos)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Descontos</span>
                                        <span className="text-red-600 font-medium">{formatarMoeda(totalDescontos)}</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-2 font-bold">
                                        <span className="text-gray-900">Líquido</span>
                                        <span className="text-lg text-gray-900">{formatarMoeda(totalLiquido)}</span>
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

            {/* ======================================================== */}
            {/* ABA: FÉRIAS                                              */}
            {/* ======================================================== */}
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
                                
                                <div className="flex justify-between font-bold text-xl md:text-2xl mt-6 border-t border-gray-200 pt-6">
                                    <span className="text-slate-900">Total Férias:</span>
                                    <span className="text-blue-600">{formatarMoeda(resultadoFerias.total)}</span>
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

            {/* ======================================================== */}
            {/* ABA: 13º SALÁRIO                                         */}
            {/* ======================================================== */}
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
                                    <span className="text-gray-600">Base de Cálculo:</span>
                                    <span className="font-medium text-gray-900">{formatarMoeda(parseFloat(salarioBase13))}</span>
                                </div>
                                
                                <div className="flex justify-between font-bold text-xl md:text-2xl mt-6 border-t border-gray-200 pt-6">
                                    <span className="text-slate-900">Valor a Receber ({resultado13.meses}/12):</span>
                                    <span className="text-blue-600">{formatarMoeda(resultado13.valor)}</span>
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

            {/* ======================================================== */}
            {/* ABA: RESCISÃO                                            */}
            {/* ======================================================== */}
            {abaAtiva === 'rescisao' && (
                <div className="max-w-3xl mx-auto w-full animate-in slide-in-from-right duration-500">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Cálculo de Rescisão</h2>
                    
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
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Saldo de Salário:</span>
                                    <span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.saldoSalario)}</span>
                                </div>
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
                                
                                <div className="flex justify-between items-center font-bold text-xl md:text-2xl mt-6 border-t border-gray-200 pt-6 text-slate-900">
                                    <span>Total Líquido:</span>
                                    <span className="text-blue-600">{formatarMoeda(resultadoRescisao.total)}</span>
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
                </div>
            )}

            {/* ======================================================== */}
            {/* ABA: CALCULADORAS RÁPIDAS                                */}
            {/* ======================================================== */}
            {abaAtiva === 'calculadora' && (
                <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-right duration-500 pb-12">
                    
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Calculadora Rápida (Decimal)</h2>
                    
                    {/* CAIXA 1: CÁLCULO DECIMAL (PADRÃO SISTEMA/CONTÁBIL) */}
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
                    
                    {/* CAIXA 2: CÁLCULO PADRÃO CELULAR (MANUAL / DP) */}
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
                    
                    {/* CAIXA 3: ADICIONAL NOTURNO (EXCLUSIVA) */}
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