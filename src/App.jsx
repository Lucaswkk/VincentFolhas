import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  // --- ESTADO DE NAVEGAÇÃO ---
  const [abaAtiva, setAbaAtiva] = useState('gerar-folha');

  // --- DATA ATUAL PARA SIDEBAR ---
  const dataAtual = new Date();
  const mesString = dataAtual.toLocaleString('pt-BR', { month: 'long' });
  const competenciaAutomatica = `${mesString.charAt(0).toUpperCase() + mesString.slice(1)}/${dataAtual.getFullYear()}`;

  // ==========================================
  // ESTADOS GLOBAIS (EMPRESA / FUNCIONÁRIO)
  // ==========================================
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cpf, setCpf] = useState('');
  const [funcionario, setFuncionario] = useState('');
  const [cargo, setCargo] = useState('');

  // ==========================================
  // ESTADOS DA ABA: GERAR FOLHA
  // ==========================================
  const [dataEntrada, setDataEntrada] = useState(''); 
  const [dataCompetencia, setDataCompetencia] = useState('');
  const [salarioFuncionario, setSalarioFuncionario] = useState(''); 
  
  // Controle de Dias Proporcionais
  const [usarDiasProporcionais, setUsarDiasProporcionais] = useState(false);
  const [dataInicioProp, setDataInicioProp] = useState('');
  const [dataFimProp, setDataFimProp] = useState('');

  // Rubricas
  const [rubricas, setRubricas] = useState([]);
  const [modoAdicao, setModoAdicao] = useState('inativo'); 
  const [tipoNovoItem, setTipoNovoItem] = useState(''); 
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoValor, setNovoValor] = useState('');
  
  // Rubricas Fixas
  const [rubricaFixaSelecionada, setRubricaFixaSelecionada] = useState('falta');
  const [diasFalta, setDiasFalta] = useState(''); 
  const [tempoHEFixa, setTempoHEFixa] = useState(''); 

  // ==========================================
  // ESTADOS DA ABA: RESCISÃO
  // ==========================================
  const [salarioBase, setSalarioBase] = useState('');
  const [admissao, setAdmissao] = useState('');
  const [demissao, setDemissao] = useState('');
  const [tipoRescisao, setTipoRescisao] = useState('sem_justa_causa');
  const [avisoPrevioIndenizado, setAvisoPrevioIndenizado] = useState(false);
  const [resultadoRescisao, setResultadoRescisao] = useState(null);

  // ==========================================
  // ESTADOS DA ABA: CALCULADORA RÁPIDA
  // ==========================================
  const [salarioBaseHE, setSalarioBaseHE] = useState('');
  const [tipoCalculoRapido, setTipoCalculoRapido] = useState('he_50');
  const [tempoCalculadora, setTempoCalculadora] = useState('');
  const [diasCalculadora, setDiasCalculadora] = useState('');
  const [resultadoHE, setResultadoHE] = useState(null);

  // --- MÁSCARAS E FORMATAÇÕES ---
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

  // --- LÓGICA DE DIAS PROPORCIONAIS (FOLHA) ---
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

  // --- LÓGICA DE RUBRICAS AVULSAS E FIXAS ---
  const handleSalvarRubrica = () => {
    if (!novoCodigo || !novaDescricao || !novoValor) return;
    const valorNumerico = parseFloat(novoValor.replace(/\./g, '').replace(',', '.')) || 0;
    
    setRubricas([...rubricas, { id: Date.now(), tipo: tipoNovoItem, codigo: novoCodigo, descricao: novaDescricao, valor: valorNumerico }]);
    setModoAdicao('inativo'); setNovoCodigo(''); setNovaDescricao(''); setNovoValor('');
  };

  const handleSalvarRubricaFixa = () => {
    if (rubricaFixaSelecionada === 'falta') {
        if (!diasFalta || diasFalta <= 0) return;
        const valorFalta = (salarioVal / 30) * parseInt(diasFalta);
        setRubricas([...rubricas, { id: Date.now(), tipo: 'desconto', codigo: 'FLT', descricao: `Falta (${diasFalta} dias)`, valor: valorFalta }]);
        setModoAdicao('inativo'); setDiasFalta('');
    } 
    else if (rubricaFixaSelecionada === 'atraso') {
        if (!tempoHEFixa || tempoHEFixa.length !== 5) return alert("Preencha as horas no formato HH:MM corretamente!");
        const [h, m] = tempoHEFixa.split(':').map(Number);
        if (m > 59) return alert("Os minutos não podem ser maiores que 59!");

        const horasDecimais = h + (m / 60);
        const valorAtraso = horasDecimais * (salarioVal / 220);

        setRubricas([...rubricas, { id: Date.now(), tipo: 'desconto', codigo: 'ATR', descricao: `Atraso (${tempoHEFixa})`, valor: valorAtraso }]);
        setModoAdicao('inativo'); setTempoHEFixa('');
    }
    else if (rubricaFixaSelecionada.startsWith('he_')) {
        if (!tempoHEFixa || tempoHEFixa.length !== 5) return alert("Preencha as horas no formato HH:MM corretamente!");
        const [h, m] = tempoHEFixa.split(':').map(Number);
        if (m > 59) return alert("Os minutos não podem ser maiores que 59!");

        const perc = parseInt(rubricaFixaSelecionada.split('_')[1]); 
        const horasDecimais = h + (m / 60);
        const valorTotalHE = horasDecimais * ((salarioVal / 220) * (1 + (perc / 100)));

        setRubricas([...rubricas, { id: Date.now(), tipo: 'provento', codigo: `HE${perc}`, descricao: `Hora Extra ${perc}% (${tempoHEFixa})`, valor: valorTotalHE }]);
        setModoAdicao('inativo'); setTempoHEFixa('');
    }
    else if (rubricaFixaSelecionada.startsWith('cred_')) {
        if (!tempoHEFixa || tempoHEFixa.length !== 5) return alert("Preencha as horas no formato HH:MM corretamente!");
        const [h, m] = tempoHEFixa.split(':').map(Number);
        if (m > 59) return alert("Os minutos não podem ser maiores que 59!");

        const perc = parseInt(rubricaFixaSelecionada.split('_')[1]); 
        const horasDecimais = h + (m / 60);
        const valorTotalCredito = horasDecimais * ((salarioVal / 120) * (1 + (perc / 100)));

        setRubricas([...rubricas, { id: Date.now(), tipo: 'provento', codigo: `CRD`, descricao: `Crédito Diversos`, valor: valorTotalCredito }]);
        setModoAdicao('inativo'); setTempoHEFixa('');
    }
  };

  const handleRemoverRubrica = (id) => setRubricas(rubricas.filter(item => item.id !== id));

  // --- TOTAIS DA FOLHA ---
  const proventos = rubricas.filter(r => r.tipo === 'provento');
  const descontos = rubricas.filter(r => r.tipo === 'desconto');
  
  const totalProventos = proventos.reduce((acc, curr) => acc + curr.valor, 0) + salarioEfetivoFolha; 
  const totalDescontos = descontos.reduce((acc, curr) => acc + curr.valor, 0);
  const totalLiquido = totalProventos - totalDescontos;

  // ========================================================
  // PDF MODERNO: GERAR FOLHA (HOLERITE)
  // ========================================================
  const gerarPDF = () => {
    if (!salarioFuncionario) return alert("O campo 'Salário Base' é obrigatório para gerar o PDF!");

    const doc = new jsPDF();
    
    // Helper para desenhar os campos organizados
    const drawField = (label, value, x, y) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont('helvetica', 'normal');
      doc.text(label, x, y);
      
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.text(value, x, y + 5);
    };

    // 1. Cabeçalho Moderno Neutro (Faixa Azul Escuro)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 26, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGAMENTO DE SALÁRIO', 105, 16, { align: 'center' });

    let currentY = 34;

    // 2. Box: Dados da Empresa
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, currentY, 182, 18, 2, 2, 'FD'); // Box com cantos arredondados
    drawField('EMPREGADOR / RAZÃO SOCIAL', razaoSocial || 'Não informado', 18, currentY + 6);
    drawField('CNPJ', cnpj || 'Não informado', 130, currentY + 6);
    
    currentY += 22;

    // 3. Box: Dados do Funcionário
    // REINICIA A COR DE FUNDO PARA NÃO VAZAR O PRETO DO TEXTO ANTERIOR
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');
    
    drawField('CÓD.', '001', 18, currentY + 6);
    drawField('NOME DO FUNCIONÁRIO', funcionario || 'Não informado', 35, currentY + 6);
    drawField('CPF', cpf || 'Não informado', 130, currentY + 6);
    
    let compFormatada = dataCompetencia ? dataCompetencia.split('-').reverse().join('/') : 'Não informada';
    drawField('COMPETÊNCIA', compFormatada, 170, currentY + 6);

    drawField('CARGO / FUNÇÃO', cargo || 'Não informado', 18, currentY + 18);
    let admFormatada = dataEntrada ? dataEntrada.split('-').reverse().join('/') : 'Não informada';
    drawField('ADMISSÃO', admFormatada, 90, currentY + 18);
    drawField('SALÁRIO BASE', formatarMoeda(salarioVal), 130, currentY + 18);

    currentY += 34;

    // 4. Tabela de Verbas (autoTable)
    const tableData = [];
    if (salarioEfetivoFolha > 0) tableData.push(['001', descricaoSalarioBase, formatarNumeroBr(salarioEfetivoFolha), '']);
    proventos.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descontos.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));
    if (tableData.length === 0) tableData.push(['-', 'Nenhuma rubrica adicionada', '-', '-']);

    autoTable(doc, {
      startY: currentY,
      head: [['Cód', 'Descrição', 'Proventos (R$)', 'Descontos (R$)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', halign: 'center' }, // blue-600
      columnStyles: { 
          0: { halign: 'center', cellWidth: 20 }, 
          1: { halign: 'left' }, 
          2: { halign: 'right', cellWidth: 40, textColor: [21, 128, 61] }, // green-700
          3: { halign: 'right', cellWidth: 40, textColor: [185, 28, 28] }  // red-700
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;

    // 5. Box: Totais e Resumo
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255); // Branco
    doc.roundedRect(14, finalY, 182, 30, 2, 2, 'FD');
    
    // Separador vertical
    doc.line(140, finalY, 140, finalY + 30);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Total de Proventos', 18, finalY + 10);
    doc.text('Total de Descontos', 18, finalY + 20);
    
    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61); // verde
    doc.setFont('helvetica', 'bold');
    doc.text(formatarMoeda(totalProventos), 135, finalY + 10, { align: 'right' });
    
    doc.setTextColor(185, 28, 28); // vermelho
    doc.text(formatarMoeda(totalDescontos), 135, finalY + 20, { align: 'right' });

    // Destaque Líquido
    doc.setFillColor(240, 249, 255); // sky-50
    doc.setDrawColor(240, 249, 255); // evitar borda preta
    doc.roundedRect(142, finalY + 2, 52, 26, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(3, 105, 161); // sky-700
    doc.setFont('helvetica', 'bold');
    doc.text('VALOR LÍQUIDO', 168, finalY + 12, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(formatarMoeda(totalLiquido), 168, finalY + 22, { align: 'center' });

    finalY += 45;

    // 6. Rodapé e Assinaturas
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO.', 14, finalY);
    
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.line(14, finalY + 20, 70, finalY + 20);
    doc.text('DATA', 42, finalY + 25, { align: 'center' });

    doc.line(80, finalY + 20, 196, finalY + 20);
    doc.text('ASSINATURA DO FUNCIONÁRIO', 138, finalY + 25, { align: 'center' });

    doc.save(`Holerite_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  // --- LÓGICA DE RESCISÃO ---
  const calcularAvosUnificados = (d1, d2) => {
    const dataInicio = new Date(`${d1}T12:00:00`); 
    const dataFim = new Date(`${d2}T12:00:00`); 
    
    let avos = 0;
    let dAtual = new Date(dataInicio);
    
    while (true) {
      let proximoMes = new Date(dAtual);
      proximoMes.setMonth(proximoMes.getMonth() + 1);
      
      if (proximoMes > dataFim) {
        const diffTime = dataFim - dAtual;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        if (diffDays >= 15) {
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
    if (!salario || !admissao || !demissao) return alert("Preencha todos os campos corretamente!");
    
    const [ano, mes, dia] = demissao.split('-');
    const diasTrabalhados = parseInt(dia, 10);
    
    const avosValidos = calcularAvosUnificados(admissao, demissao);
    
    const saldoSalario = (salario / 30) * diasTrabalhados;
    let decimoTerceiro = (salario / 12) * avosValidos;
    let feriasBase = (salario / 12) * avosValidos;
    let tercoFerias = feriasBase / 3;
    let valorAviso = 0;

    if (avisoPrevioIndenizado) {
        valorAviso = salario;
    }

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

  // ========================================================
  // PDF MODERNO: RESCISÃO
  // ========================================================
  const gerarPDFRescisao = () => {
    if (!resultadoRescisao) return alert("Calcule a rescisão primeiro!");

    const doc = new jsPDF();
    
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

    // Cabeçalho Escuro Neutro
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 26, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DE RESCISÃO DO CONTRATO', 105, 16, { align: 'center' });

    let currentY = 34;

    // Box Empresa
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252); 
    doc.roundedRect(14, currentY, 182, 18, 2, 2, 'FD'); 
    drawField('EMPREGADOR / RAZÃO SOCIAL', razaoSocial || 'Não informado', 18, currentY + 6);
    drawField('CNPJ', cnpj || 'Não informado', 130, currentY + 6);
    
    currentY += 22;

    // Box Funcionário
    // REINICIA A COR PARA NÃO VAZAR
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252); 
    doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');
    
    drawField('NOME DO FUNCIONÁRIO', funcionario || 'Não informado', 18, currentY + 6);
    drawField('CPF', cpf || 'Não informado', 100, currentY + 6);
    drawField('CARGO / FUNÇÃO', cargo || 'Não informado', 145, currentY + 6);
    
    let admFormatada = admissao ? admissao.split('-').reverse().join('/') : 'Não informada';
    let demFormatada = demissao ? demissao.split('-').reverse().join('/') : 'Não informada';
    
    drawField('ADMISSÃO', admFormatada, 18, currentY + 18);
    drawField('DEMISSÃO', demFormatada, 60, currentY + 18);
    drawField('SALÁRIO BASE', formatarMoeda(parseFloat(salarioBase) || 0), 100, currentY + 18);

    currentY += 34;
    
    // Tabela Verbas
    const tableData = [];
    tableData.push(['Saldo de Salário', formatarNumeroBr(resultadoRescisao.saldoSalario)]);
    if (resultadoRescisao.decimoTerceiro > 0) tableData.push(['13º Salário Proporcional', formatarNumeroBr(resultadoRescisao.decimoTerceiro)]);
    if (resultadoRescisao.ferias > 0) tableData.push(['Férias Proporcionais', formatarNumeroBr(resultadoRescisao.ferias)]);
    if (resultadoRescisao.tercoFerias > 0) tableData.push(['1/3 de Férias (Terço Constitucional)', formatarNumeroBr(resultadoRescisao.tercoFerias)]);
    if (resultadoRescisao.avisoPrevio > 0) tableData.push(['Aviso Prévio Indenizado', formatarNumeroBr(resultadoRescisao.avisoPrevio)]);

    autoTable(doc, {
      startY: currentY,
      head: [['Descrição das Verbas', 'Valor (R$)']], 
      body: tableData, 
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', halign: 'left' },
      columnStyles: { 
          0: { halign: 'left' }, 
          1: { halign: 'right', cellWidth: 50, textColor: [21, 128, 61] } // verde
      },
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] }, 
      margin: { left: 14, right: 14 }
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    
    // Box Destaque Rescisão
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
    
    finalY += 35;

    // Assinaturas
    doc.setDrawColor(148, 163, 184); 
    doc.line(14, finalY, 70, finalY);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('DATA', 42, finalY + 5, { align: 'center' });

    doc.line(80, finalY, 196, finalY);
    doc.text('ASSINATURA DO FUNCIONÁRIO', 138, finalY + 5, { align: 'center' });
    
    doc.save(`Rescisao_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  // --- LÓGICA DA CALCULADORA RÁPIDA ---
  const calcularRapido = () => {
    const salario = parseFloat(salarioBaseHE);
    if (!salario) return alert("Preencha o Salário Base corretamente!");

    let valorFinal = 0;
    let tipoResultado = 'provento';
    let tituloResultado = 'Total a Receber:';

    if (tipoCalculoRapido === 'falta') {
        if (!diasCalculadora || diasCalculadora <= 0) return alert("Preencha a quantidade de dias corretamente!");
        valorFinal = (salario / 30) * parseInt(diasCalculadora);
        tipoResultado = 'desconto';
        tituloResultado = 'Total a Descontar:';
    } else {
        if (!tempoCalculadora || tempoCalculadora.length !== 5) return alert("Preencha o tempo no formato HH:MM corretamente!");
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

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center space-x-3 mb-4">
             <img src="/logo.png" alt="Logo Grupo Vincent" className="w-8 h-8 object-contain rounded" />
             <div>
                <h1 className="font-bold text-lg leading-tight">Grupo Vincent</h1>
                <p className="text-xs text-slate-400">Folha de Pagamento</p>
             </div>
          </div>
          <nav className="space-y-2 px-4">
            <button onClick={() => setAbaAtiva('gerar-folha')} className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'gerar-folha' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><span>Gerar Folha</span></button>
            <button onClick={() => setAbaAtiva('rescisao')} className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'rescisao' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><span>Rescisão</span></button>
            <button onClick={() => setAbaAtiva('calculadora')} className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${abaAtiva === 'calculadora' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><span>Calculadora</span></button>
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
        <header className="bg-white border-b border-gray-200 h-16 shrink-0"></header>

        <div className="p-8 w-full max-w-7xl mx-auto">
            
            {/* ======================================================== */}
            {/* ABA 1: GERAR FOLHA                                       */}
            {/* ======================================================== */}
            {abaAtiva === 'gerar-folha' && (
                <div className="animate-in fade-in duration-500">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Gerar Folha de Pagamento</h2>
                        <p className="text-gray-500 text-sm mt-1">Adicione manualmente as rubricas e valores para cada funcionário</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Funcionário e Competência</h3>
                                <p className="text-sm text-gray-500 mb-6">Valores em tempo real</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                                        <input type="text" maxLength="18" value={cnpj} onChange={handleCnpjChange} placeholder="00.000.000/0000-00" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Razão Social / Empresa</label>
                                        <input type="text" maxLength="150" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Nome completo da empresa..." className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                                        <input type="text" maxLength="14" value={cpf} onChange={handleCpfChange} placeholder="000.000.000-00" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Funcionário</label>
                                        <input type="text" maxLength="100" value={funcionario} onChange={(e) => setFuncionario(e.target.value)} placeholder="Nome completo..." className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cargo / Função</label>
                                        <input type="text" maxLength="80" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Analista" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Admissão</label>
                                        <input type="date" value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Competência</label>
                                        <input type="month" value={dataCompetencia} onChange={(e) => setDataCompetencia(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Salário Base (R$)<span className="text-red-500 ml-1">*</span></label>
                                            <label className="flex items-center space-x-2 text-xs font-medium text-gray-600 cursor-pointer">
                                                <input type="checkbox" checked={usarDiasProporcionais} onChange={(e) => setUsarDiasProporcionais(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                                                <span>Dias Proporcionais</span>
                                            </label>
                                        </div>
                                        <input type="number" value={salarioFuncionario} onChange={(e) => setSalarioFuncionario(e.target.value)} placeholder="Ex: 3200" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 bg-gray-50" />
                                        
                                        {usarDiasProporcionais && (
                                            <div className="flex space-x-3 mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Início</label>
                                                    <input type="date" value={dataInicioProp} onChange={(e) => setDataInicioProp(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Fim</label>
                                                    <input type="date" value={dataFimProp} onChange={(e) => setDataFimProp(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-4">
                                {modoAdicao === 'inativo' && (
                                    <button onClick={() => setModoAdicao('selecionando_tipo')} className="bg-blue-50 text-blue-600 border border-blue-200 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors w-fit flex items-center">
                                        <span className="mr-2 text-xl leading-none">+</span> Adicionar Rubrica
                                    </button>
                                )}
                                
                                {modoAdicao === 'selecionando_tipo' && (
                                    <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm flex items-center space-x-3">
                                        <p className="text-sm font-medium text-gray-700 mr-2">Qual tipo de rubrica deseja adicionar?</p>
                                        
                                        <button onClick={() => { setTipoNovoItem('provento'); setModoAdicao('preenchendo'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">Provento</button>
                                        <button onClick={() => { setTipoNovoItem('desconto'); setModoAdicao('preenchendo'); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors">Desconto</button>
                                        
                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                        
                                        <button onClick={() => { 
                                            if (!salarioFuncionario || parseFloat(salarioFuncionario) <= 0) {
                                                return alert("Por favor, preencha o Salário Base do funcionário primeiro!");
                                            }
                                            setTipoNovoItem('fixa'); 
                                            setRubricaFixaSelecionada('falta');
                                            setModoAdicao('preenchendo_fixa'); 
                                        }} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm transition-colors">Fixa</button>
                                        
                                        <button onClick={() => setModoAdicao('inativo')} className="text-gray-500 text-sm hover:underline ml-auto">Cancelar</button>
                                    </div>
                                )}
                                
                                {modoAdicao === 'preenchendo' && (
                                    <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-medium text-gray-800">Novo {tipoNovoItem === 'provento' ? <span className="text-blue-600">Provento</span> : <span className="text-red-600">Desconto</span>} (Avulso)</h4>
                                            <button onClick={() => setModoAdicao('inativo')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                                        </div>
                                        <div className="flex items-end space-x-4">
                                            <div className="w-24">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Código</label>
                                                <input type="text" value={novoCodigo} onChange={(e) => setNovoCodigo(e.target.value.replace(/\D/g, '').slice(0,3))} placeholder="001" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                                                <input type="text" value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} placeholder="Ex: Bonificação" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
                                                <input type="text" value={novoValor} onChange={(e) => setNovoValor(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="3200,00" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                            </div>
                                            <button onClick={handleSalvarRubrica} className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm h-[38px]">Salvar</button>
                                        </div>
                                    </div>
                                )}

                                {modoAdicao === 'preenchendo_fixa' && tipoNovoItem === 'fixa' && (
                                    <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm bg-slate-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-medium text-slate-800">Nova Rubrica Fixa</h4>
                                            <button onClick={() => setModoAdicao('inativo')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                                        </div>
                                        <div className="flex items-end space-x-4">
                                            <div className="w-56">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                                <select 
                                                    value={rubricaFixaSelecionada} 
                                                    onChange={(e) => {
                                                        setRubricaFixaSelecionada(e.target.value);
                                                        setDiasFalta('');
                                                        setTempoHEFixa('');
                                                    }} 
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="falta">Falta (Dias)</option>
                                                    <option value="atraso">Atraso (HH:MM)</option>
                                                    <option value="he_50">Hora Extra 50%</option>
                                                    <option value="he_60">Hora Extra 60%</option>
                                                    <option value="he_100">Hora Extra 100%</option>
                                                    <option value="cred_50">Hora Extra 50% ( Cred. Div. )</option>
                                                    <option value="cred_60">Hora Extra 60% ( Cred. Div. )</option>
                                                    <option value="cred_100">Hora Extra 100% ( Cred. Div. )</option>
                                                </select>
                                            </div>
                                            
                                            {rubricaFixaSelecionada === 'falta' && (
                                                <div className="w-32">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Qtd. de Dias</label>
                                                    <input type="number" value={diasFalta} onChange={(e) => setDiasFalta(e.target.value)} placeholder="Ex: 2" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                </div>
                                            )}

                                            {(rubricaFixaSelecionada.startsWith('he_') || rubricaFixaSelecionada.startsWith('cred_') || rubricaFixaSelecionada === 'atraso') && (
                                                <div className="w-32">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tempo (HH:MM)</label>
                                                    <input type="text" value={tempoHEFixa} onChange={handleTempoHEFixaChange} placeholder="Ex: 01:30" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-medium" />
                                                </div>
                                            )}

                                            <div className="flex-1 flex flex-col justify-end pb-2">
                                                <span className="text-sm text-gray-500">
                                                    {rubricaFixaSelecionada === 'falta' || rubricaFixaSelecionada === 'atraso' ? 'Valor Descontado:' : 'Valor do Provento:'}
                                                </span>
                                                <span className={`text-lg font-bold ${rubricaFixaSelecionada === 'falta' || rubricaFixaSelecionada === 'atraso' ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {(() => {
                                                        const salario = parseFloat(salarioFuncionario) || 0;
                                                        if (rubricaFixaSelecionada === 'falta' && diasFalta > 0) {
                                                            return formatarMoeda((salario / 30) * parseInt(diasFalta));
                                                        }
                                                        if ((rubricaFixaSelecionada.startsWith('he_') || rubricaFixaSelecionada.startsWith('cred_') || rubricaFixaSelecionada === 'atraso') && tempoHEFixa.length === 5) {
                                                            const [h, m] = tempoHEFixa.split(':').map(Number);
                                                            if (m <= 59) {
                                                                const horasDecimais = h + (m / 60);
                                                                if (rubricaFixaSelecionada === 'atraso') {
                                                                    return formatarMoeda(horasDecimais * (salario / 220));
                                                                } else if (rubricaFixaSelecionada.startsWith('he_')) {
                                                                    const perc = parseInt(rubricaFixaSelecionada.split('_')[1]);
                                                                    return formatarMoeda(horasDecimais * ((salario / 220) * (1 + (perc / 100))));
                                                                } else if (rubricaFixaSelecionada.startsWith('cred_')) {
                                                                    const perc = parseInt(rubricaFixaSelecionada.split('_')[1]);
                                                                    return formatarMoeda(horasDecimais * ((salario / 120) * (1 + (perc / 100))));
                                                                }
                                                            }
                                                        }
                                                        return 'R$ 0,00';
                                                    })()}
                                                </span>
                                            </div>
                                            <button onClick={handleSalvarRubricaFixa} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-md text-sm h-[38px] transition-colors">Adicionar</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(proventos.length > 0 || salarioEfetivoFolha > 0) && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-gray-100"><h3 className="text-blue-500 text-lg font-medium">Proventos</h3></div>
                                    <table className="w-full text-left border-collapse">
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
                                                    <td className="py-3 px-4 text-sm text-gray-600">001</td>
                                                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">{descricaoSalarioBase}</td>
                                                    <td className="py-3 px-4 text-right text-sm">{formatarNumeroBr(salarioEfetivoFolha)}</td>
                                                    <td className="py-3 px-4 text-center text-gray-400">-</td>
                                                </tr>
                                            )}
                                            {proventos.map(p => (
                                                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm text-gray-600">{p.codigo}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-800">{p.descricao}</td>
                                                    <td className="py-3 px-4 text-right text-sm">{formatarNumeroBr(p.valor)}</td>
                                                    <td className="py-3 px-4 text-center"><button onClick={() => handleRemoverRubrica(p.id)} className="text-red-500 hover:text-red-700 font-bold">✕</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="bg-gray-50/80 p-4 flex justify-between items-center border-t border-gray-200">
                                        <span className="text-sm font-medium">Total Proventos</span>
                                        <span className="text-blue-600 font-bold">{formatarMoeda(totalProventos)}</span>
                                    </div>
                                </div>
                            )}

                            {descontos.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                                    <div className="p-4 border-b border-gray-100"><h3 className="text-red-500 text-lg font-medium">Descontos</h3></div>
                                    <table className="w-full text-left border-collapse">
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
                                                    <td className="py-3 px-4 text-sm text-gray-600">{d.codigo}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-800">{d.descricao}</td>
                                                    <td className="py-3 px-4 text-right text-sm">{formatarNumeroBr(d.valor)}</td>
                                                    <td className="py-3 px-4 text-center"><button onClick={() => handleRemoverRubrica(d.id)} className="text-red-500 hover:text-red-700 font-bold">✕</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="bg-gray-50/80 p-4 flex justify-between items-center border-t border-gray-200">
                                        <span className="text-sm font-medium">Total Descontos</span>
                                        <span className="text-red-600 font-bold">{formatarMoeda(totalDescontos)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 sticky top-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Resumo</h3>
                                <div className="space-y-3 text-sm mt-4">
                                    <div className="flex justify-between"><span className="text-gray-600">Proventos</span><span className="text-blue-600 font-medium">{formatarMoeda(totalProventos)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Descontos</span><span className="text-red-600 font-medium">{formatarMoeda(totalDescontos)}</span></div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-2 font-bold"><span className="text-gray-900">Líquido</span><span className="text-lg text-gray-900">{formatarMoeda(totalLiquido)}</span></div>
                                </div>
                            </div>
                            <button onClick={gerarPDF} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                                <span>Gerar PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* ABA 2: RESCISÃO                                          */}
            {/* ======================================================== */}
            {abaAtiva === 'rescisao' && (
                <div className="max-w-3xl mx-auto w-full animate-in slide-in-from-right duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Cálculo de Rescisão</h2>
                    
                    {/* BLOCO: DADOS DA EMPRESA E FUNCIONÁRIO (Sincronizado) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Empresa e Funcionário</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                                <input type="text" maxLength="18" value={cnpj} onChange={handleCnpjChange} placeholder="00.000.000/0000-00" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social / Empresa</label>
                                <input type="text" maxLength="150" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Nome completo da empresa..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                                <input type="text" maxLength="14" value={cpf} onChange={handleCpfChange} placeholder="000.000.000-00" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
                                <input type="text" maxLength="100" value={funcionario} onChange={(e) => setFuncionario(e.target.value)} placeholder="Nome completo..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Função</label>
                                <input type="text" maxLength="80" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Analista" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* BLOCO: DADOS DA RESCISÃO */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Salário Base (R$)</label>
                                    <label className="flex items-center space-x-2 text-xs font-medium text-gray-600 cursor-pointer">
                                        <input type="checkbox" checked={avisoPrevioIndenizado} onChange={(e) => setAvisoPrevioIndenizado(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                                        <span>Aviso Prévio Indenizado</span>
                                    </label>
                                </div>
                                <input type="number" placeholder="Ex: 3200" value={salarioBase} onChange={(e) => setSalarioBase(e.target.value)} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Rescisão</label>
                                <select value={tipoRescisao} onChange={(e) => setTipoRescisao(e.target.value)} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="sem_justa_causa">Sem Justa Causa</option>
                                    <option value="pedido_demissao">Pedido de Demissão</option>
                                    <option value="justa_causa">Justa Causa</option>
                                    <option value="acordo">Acordo (Art. 484-A)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
                                <input type="date" value={admissao} onChange={(e) => setAdmissao(e.target.value)} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Desligamento</label>
                                <input type="date" value={demissao} onChange={(e) => setDemissao(e.target.value)} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-gray-600" />
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <button onClick={calcularRescisao} className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-700 transition-all flex justify-center items-center space-x-2 text-lg">
                                <span>Calcular Verbas Rescisórias</span>
                            </button>
                        </div>

                        {resultadoRescisao && (
                            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-4">
                                <h4 className="font-bold text-lg text-slate-800 mb-4 border-b border-gray-200 pb-3">
                                    Resumo do Cálculo 
                                    <span className="text-sm font-normal text-gray-500 ml-2">({resultadoRescisao.avos} avos de direito)</span>
                                </h4>
                                <div className="flex justify-between items-center"><span className="text-gray-600">Saldo de Salário:</span><span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.saldoSalario)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-600">13º Salário Proporcional:</span><span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.decimoTerceiro)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-600">Férias Proporcionais:</span><span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.ferias)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-600">1/3 de Férias:</span><span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.tercoFerias)}</span></div>
                                
                                {resultadoRescisao.avisoPrevio > 0 && (
                                    <div className="flex justify-between items-center pt-2"><span className="text-blue-600 font-medium">Aviso Prévio Indenizado:</span><span className="font-bold text-blue-600 text-base">{formatarMoeda(resultadoRescisao.avisoPrevio)}</span></div>
                                )}
                                
                                <div className="flex justify-between items-center font-bold text-2xl mt-6 border-t border-gray-200 pt-6 text-slate-900">
                                    <span>Total Líquido:</span><span className="text-blue-600">{formatarMoeda(resultadoRescisao.total)}</span>
                                </div>

                                {/* Botão de Gerar PDF da Rescisão */}
                                <div className="pt-4">
                                    <button onClick={gerarPDFRescisao} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center">
                                        <span>Gerar PDF da Rescisão</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* ABA 3: CALCULADORA RÁPIDA                                */}
            {/* ======================================================== */}
            {abaAtiva === 'calculadora' && (
                <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-right duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Calculadora Rápida</h2>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                                <input type="number" placeholder="Ex: 2000" value={salarioBaseHE} onChange={(e) => setSalarioBaseHE(e.target.value)} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
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
                                    className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
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
                                        <input type="number" placeholder="Ex: 2" value={diasCalculadora} onChange={(e) => setDiasCalculadora(e.target.value)} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-center" />
                                    </>
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (HH:MM)</label>
                                        <input type="text" placeholder="Ex: 05:45" value={tempoCalculadora} onChange={(e) => setTempoCalculadora(aplicarMascaraHora(e.target.value))} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-medium" />
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <button onClick={calcularRapido} className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-700 transition-all flex justify-center items-center space-x-2 text-lg">
                                <span>Calcular</span>
                            </button>
                        </div>

                        {resultadoHE && (
                            <div className={`mt-8 p-6 rounded-xl border ${resultadoHE.tipo === 'desconto' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex justify-between items-center font-bold text-2xl text-slate-900">
                                    <span>{resultadoHE.titulo}</span>
                                    <span className={resultadoHE.tipo === 'desconto' ? 'text-red-600' : 'text-blue-600'}>{formatarMoeda(resultadoHE.total)}</span>
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