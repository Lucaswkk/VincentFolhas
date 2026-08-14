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
  // ESTADOS DA ABA: GERAR FOLHA
  // ==========================================
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cpf, setCpf] = useState('');
  const [funcionario, setFuncionario] = useState('');
  const [cargo, setCargo] = useState('');
  const [dataEntrada, setDataEntrada] = useState(''); 
  const [dataCompetencia, setDataCompetencia] = useState('');
  const [salarioFuncionario, setSalarioFuncionario] = useState(''); 

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
  const [tempoHEFixa, setTempoHEFixa] = useState(''); // NOVO: Tempo HH:MM para a rubrica fixa

  // ==========================================
  // ESTADOS DA ABA: RESCISÃO
  // ==========================================
  const [salarioBase, setSalarioBase] = useState('');
  const [admissao, setAdmissao] = useState('');
  const [demissao, setDemissao] = useState('');
  const [tipoRescisao, setTipoRescisao] = useState('sem_justa_causa');
  const [resultadoRescisao, setResultadoRescisao] = useState(null);

  // ==========================================
  // ESTADOS DA ABA: CALCULADORA (HORA EXTRA)
  // ==========================================
  const [salarioBaseHE, setSalarioBaseHE] = useState('');
  const [horasExtras, setHorasExtras] = useState('');
  const [percentualHE, setPercentualHE] = useState('50');
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

  const handleHorasChange = (e) => setHorasExtras(aplicarMascaraHora(e.target.value));
  const handleTempoHEFixaChange = (e) => setTempoHEFixa(aplicarMascaraHora(e.target.value));

  const formatarNumeroBr = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // --- LÓGICA DE RUBRICAS AVULSAS ---
  const handleSalvarRubrica = () => {
    if (!novoCodigo || !novaDescricao || !novoValor) return;
    const valorNumerico = parseFloat(novoValor.replace(/\./g, '').replace(',', '.')) || 0;
    
    setRubricas([...rubricas, { id: Date.now(), tipo: tipoNovoItem, codigo: novoCodigo, descricao: novaDescricao, valor: valorNumerico }]);
    setModoAdicao('inativo'); setNovoCodigo(''); setNovaDescricao(''); setNovoValor('');
  };

  // --- LÓGICA DE RUBRICAS FIXAS ---
  const handleSalvarRubricaFixa = () => {
    const salario = parseFloat(salarioFuncionario) || 0;

    if (rubricaFixaSelecionada === 'falta') {
        if (!diasFalta || diasFalta <= 0) return;
        const valorFalta = (salario / 30) * parseInt(diasFalta);
        setRubricas([...rubricas, { id: Date.now(), tipo: 'desconto', codigo: 'FLT', descricao: `Falta (${diasFalta} dias)`, valor: valorFalta }]);
        setModoAdicao('inativo'); setDiasFalta('');
    } 
    else if (rubricaFixaSelecionada.startsWith('he_')) {
        if (!tempoHEFixa || tempoHEFixa.length !== 5) return alert("Preencha as horas no formato HH:MM corretamente!");
        const [h, m] = tempoHEFixa.split(':').map(Number);
        if (m > 59) return alert("Os minutos não podem ser maiores que 59!");

        const perc = parseInt(rubricaFixaSelecionada.split('_')[1]); // Pega 50, 60 ou 100
        const horasDecimais = h + (m / 60);
        const valorTotalHE = horasDecimais * ((salario / 220) * (1 + (perc / 100)));

        setRubricas([...rubricas, { id: Date.now(), tipo: 'provento', codigo: `HE${perc}`, descricao: `Hora Extra ${perc}% (${tempoHEFixa})`, valor: valorTotalHE }]);
        setModoAdicao('inativo'); setTempoHEFixa('');
    }
  };

  const handleRemoverRubrica = (id) => setRubricas(rubricas.filter(item => item.id !== id));

  // --- TOTAIS DA FOLHA ---
  const proventos = rubricas.filter(r => r.tipo === 'provento');
  const descontos = rubricas.filter(r => r.tipo === 'desconto');
  
  const salarioVal = parseFloat(salarioFuncionario) || 0; 
  const totalProventos = proventos.reduce((acc, curr) => acc + curr.valor, 0) + salarioVal; 
  const totalDescontos = descontos.reduce((acc, curr) => acc + curr.valor, 0);
  const totalLiquido = totalProventos - totalDescontos;

  // --- GERAÇÃO DO PDF (GERAR FOLHA) ---
  const gerarPDF = () => {
    if (!salarioFuncionario) return alert("O campo 'Salário Base' é obrigatório para gerar o PDF!");

    const doc = new jsPDF();
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGAMENTO DE SALÁRIO', 105, 15, { align: 'center' });
    
    doc.setLineWidth(0.3); doc.rect(14, 20, 182, 15); doc.setFontSize(9); 
    
    doc.setFont('helvetica', 'bold'); doc.text('Empregador:', 16, 25);
    doc.setFont('helvetica', 'normal'); doc.text(`${razaoSocial || 'Não informado'}`, 40, 25);
    
    doc.setFont('helvetica', 'bold'); doc.text('CNPJ:', 16, 31);
    doc.setFont('helvetica', 'normal'); doc.text(`${cnpj || 'Não informado'}`, 27, 31);
    
    doc.setFont('helvetica', 'bold'); doc.text('Competência:', 145, 28);
    let compFormatada = 'Não informada';
    if (dataCompetencia) {
        const [ano, mes] = dataCompetencia.split('-');
        compFormatada = `${mes}/${ano}`;
    }
    doc.setFont('helvetica', 'normal'); doc.text(compFormatada, 170, 28);
    
    doc.rect(14, 35, 182, 21);
    
    doc.setFont('helvetica', 'bold'); doc.text('Funcionário:', 16, 40);
    doc.setFont('helvetica', 'normal'); doc.text(`${funcionario || 'Não informado'}`, 38, 40);
    
    doc.setFont('helvetica', 'bold'); doc.text('CPF:', 145, 40); 
    doc.setFont('helvetica', 'normal'); doc.text(`${cpf || 'Não informado'}`, 155, 40);
    
    doc.setFont('helvetica', 'bold'); doc.text('Cargo/Função:', 16, 46); 
    doc.setFont('helvetica', 'normal'); doc.text(`${cargo || 'Não informado'}`, 42, 46);
    
    doc.setFont('helvetica', 'bold'); doc.text('Admissão:', 145, 46);
    let admFormatada = dataEntrada ? dataEntrada.split('-').reverse().join('/') : 'Não informada';
    doc.setFont('helvetica', 'normal'); doc.text(admFormatada, 163, 46);

    doc.setFont('helvetica', 'bold'); doc.text('Salário Base:', 16, 52); 
    doc.setFont('helvetica', 'normal'); doc.text(formatarMoeda(salarioVal), 42, 52);
    
    const tableData = [];
    if (salarioVal > 0) tableData.push(['001', 'Salário Base', formatarNumeroBr(salarioVal), '']);
    proventos.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descontos.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));
    if (tableData.length === 0) tableData.push(['-', 'Nenhuma rubrica adicionada', '-', '-']);

    autoTable(doc, {
      startY: 60,
      head: [['Cód', 'Descrição', 'Vencimentos (R$)', 'Descontos (R$)']], 
      body: tableData, 
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], textColor: 20, fontStyle: 'bold', halign: 'center' },
      columnStyles: { 0: { halign: 'center', cellWidth: 20 }, 1: { halign: 'left' }, 2: { halign: 'right', cellWidth: 40 }, 3: { halign: 'right', cellWidth: 40 } },
      styles: { fontSize: 9 }, 
      margin: { left: 14, right: 14 }
    });

    const finalY = doc.lastAutoTable.finalY || 70;
    
    doc.rect(14, finalY, 182, 15);
    doc.setFont('helvetica', 'bold'); doc.text('Total de Vencimentos:', 80, finalY + 6);
    doc.setFont('helvetica', 'normal'); doc.text(formatarMoeda(totalProventos), 140, finalY + 6, { align: 'right' });
    
    doc.setFont('helvetica', 'bold'); doc.text('Total de Descontos:', 145, finalY + 6);
    doc.setFont('helvetica', 'normal'); doc.text(formatarMoeda(totalDescontos), 193, finalY + 6, { align: 'right' });
    
    doc.setFont('helvetica', 'bold'); doc.text('Valor Líquido:', 145, finalY + 12);
    doc.text(formatarMoeda(totalLiquido), 193, finalY + 12, { align: 'right' });
    
    doc.rect(14, finalY + 15, 182, 25);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); 
    doc.text('DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO.', 16, finalY + 22);
    doc.text('DATA: _____/_____/_______', 16, finalY + 34); 
    doc.text('ASSINATURA: ____________________________________________________', 80, finalY + 34);
    
    doc.save(`Holerite_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`);
  };

  // --- LÓGICA DE RESCISÃO ---
  const calcularMesesValidos = (d1, d2) => {
    let count = 0; let dataInicio = new Date(d1); let dataFim = new Date(d2); let d = new Date(dataInicio);
    while (d <= dataFim) {
      let mes = d.getMonth(); let ano = d.getFullYear();
      let startDay = (d.getMonth() === dataInicio.getMonth() && d.getFullYear() === dataInicio.getFullYear()) ? dataInicio.getDate() : 1;
      let endDay = (d.getMonth() === dataFim.getMonth() && d.getFullYear() === dataFim.getFullYear()) ? dataFim.getDate() : new Date(ano, mes + 1, 0).getDate();
      if ((endDay - startDay + 1) >= 15) count++;
      d.setMonth(d.getMonth() + 1); d.setDate(1);
    }
    return count;
  };

  const calcularRescisao = () => {
    const salario = parseFloat(salarioBase);
    if (!salario || !admissao || !demissao) return alert("Preencha todos os campos corretamente!");
    const d1 = new Date(admissao); const d2 = new Date(demissao);
    const mesesValidos = calcularMesesValidos(d1, d2);
    const saldoSalario = (salario / 30) * d2.getDate();
    const decimoTerceiro = (salario / 12) * mesesValidos;
    const feriasBase = (salario / 12) * mesesValidos;
    const feriasComTerco = feriasBase + (feriasBase / 3);
    let multaFgts = 0;
    if (tipoRescisao === 'sem_justa_causa') multaFgts = (salario * 0.40);
    else if (tipoRescisao === 'acordo') multaFgts = (salario * 0.20);
    setResultadoRescisao({ saldoSalario, decimoTerceiro, ferias: feriasComTerco, multaFgts, total: saldoSalario + decimoTerceiro + feriasComTerco + multaFgts });
  };

  // --- LÓGICA DE HORA EXTRA (CALCULADORA RÁPIDA) ---
  const calcularHoraExtra = () => {
    const salario = parseFloat(salarioBaseHE);
    if (!salario || !horasExtras || horasExtras.length !== 5) return alert("Preencha o salário e as horas no formato HH:MM corretamente!");
    const [h, m] = horasExtras.split(':').map(Number);
    if (m > 59) return alert("Os minutos não podem ser maiores que 59!");
    const horasDecimais = h + (m / 60);
    const valorHoraNormal = salario / 220;
    const valorHoraExtra = valorHoraNormal * (1 + (parseFloat(percentualHE) / 100));
    setResultadoHE({ total: horasDecimais * valorHoraExtra });
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Salário Base (R$)<span className="text-red-500 ml-1">*</span></label>
                                        <input type="number" value={salarioFuncionario} onChange={(e) => setSalarioFuncionario(e.target.value)} placeholder="Ex: 3200" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 bg-gray-50" />
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
                                                <input type="text" value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} placeholder="Salário Base" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
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
                                            <div className="w-48">
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
                                                    <option value="he_50">Hora Extra 50%</option>
                                                    <option value="he_60">Hora Extra 60%</option>
                                                    <option value="he_100">Hora Extra 100%</option>
                                                </select>
                                            </div>
                                            
                                            {rubricaFixaSelecionada === 'falta' && (
                                                <div className="w-32">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Qtd. de Dias</label>
                                                    <input type="number" value={diasFalta} onChange={(e) => setDiasFalta(e.target.value)} placeholder="Ex: 2" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                </div>
                                            )}

                                            {rubricaFixaSelecionada.startsWith('he_') && (
                                                <div className="w-32">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tempo (HH:MM)</label>
                                                    <input type="text" value={tempoHEFixa} onChange={handleTempoHEFixaChange} placeholder="Ex: 05:30" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-medium" />
                                                </div>
                                            )}

                                            <div className="flex-1 flex flex-col justify-end pb-2">
                                                <span className="text-sm text-gray-500">
                                                    {rubricaFixaSelecionada === 'falta' ? 'Valor Descontado:' : 'Valor do Provento:'}
                                                </span>
                                                <span className={`text-lg font-bold ${rubricaFixaSelecionada === 'falta' ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {(() => {
                                                        const salario = parseFloat(salarioFuncionario) || 0;
                                                        if (rubricaFixaSelecionada === 'falta' && diasFalta > 0) {
                                                            return formatarMoeda((salario / 30) * parseInt(diasFalta));
                                                        }
                                                        if (rubricaFixaSelecionada.startsWith('he_') && tempoHEFixa.length === 5) {
                                                            const [h, m] = tempoHEFixa.split(':').map(Number);
                                                            if (m <= 59) {
                                                                const perc = parseInt(rubricaFixaSelecionada.split('_')[1]);
                                                                const horasDecimais = h + (m / 60);
                                                                const valorHE = horasDecimais * ((salario / 220) * (1 + (perc / 100)));
                                                                return formatarMoeda(valorHE);
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

                            {(proventos.length > 0 || salarioVal > 0) && (
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
                                            {salarioVal > 0 && (
                                                <tr className="border-b border-gray-100 bg-blue-50/30">
                                                    <td className="py-3 px-4 text-sm text-gray-600">001</td>
                                                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">Salário Base</td>
                                                    <td className="py-3 px-4 text-right text-sm">{formatarNumeroBr(salarioVal)}</td>
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
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
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
                                <h4 className="font-bold text-lg text-slate-800 mb-4 border-b border-gray-200 pb-3">Resumo do Cálculo</h4>
                                <div className="flex justify-between items-center"><span className="text-gray-600">Saldo de Salário:</span><span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.saldoSalario)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-600">13º Salário Proporcional:</span><span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.decimoTerceiro)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-600">Férias + 1/3 Proporcional:</span><span className="font-medium text-gray-900 text-base">{formatarMoeda(resultadoRescisao.ferias)}</span></div>
                                {resultadoRescisao.multaFgts > 0 && (
                                    <div className="flex justify-between items-center pt-2"><span className="text-red-600 font-medium">Multa FGTS:</span><span className="font-bold text-red-600 text-base">{formatarMoeda(resultadoRescisao.multaFgts)}</span></div>
                                )}
                                <div className="flex justify-between items-center font-bold text-2xl mt-6 border-t border-gray-200 pt-6 text-slate-900">
                                    <span>Total Líquido:</span><span className="text-blue-600">{formatarMoeda(resultadoRescisao.total)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* ABA 3: CALCULADORA RÁPIDA (HORA EXTRA)                   */}
            {/* ======================================================== */}
            {abaAtiva === 'calculadora' && (
                <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-right duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Cálculo de Hora Extra</h2>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                                <input type="number" placeholder="Ex: 2000" value={salarioBaseHE} onChange={(e) => setSalarioBaseHE(e.target.value)} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (HH:MM)</label>
                                <input type="text" placeholder="Ex: 05:45" value={horasExtras} onChange={handleHorasChange} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adicional (%)</label>
                                <select value={percentualHE} onChange={(e) => setPercentualHE(e.target.value)} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="50">50%</option>
                                    <option value="60">60%</option>
                                    <option value="100">100%</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <button onClick={calcularHoraExtra} className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-700 transition-all flex justify-center items-center space-x-2 text-lg">
                                <span>Calcular Hora Extra</span>
                            </button>
                        </div>

                        {resultadoHE && (
                            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex justify-between items-center font-bold text-2xl text-slate-900">
                                    <span>Total a Receber:</span>
                                    <span className="text-blue-600">{formatarMoeda(resultadoHE.total)}</span>
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