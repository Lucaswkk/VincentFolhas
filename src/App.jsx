import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  // --- ESTADO DE NAVEGAÇÃO ---
  const [abaAtiva, setAbaAtiva] = useState('gerar-folha');

  // ==========================================
  // DATA AUTOMÁTICA PARA A SIDEBAR
  // ==========================================
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
  const [rubricas, setRubricas] = useState([]);
  const [modoAdicao, setModoAdicao] = useState('inativo'); 
  const [tipoNovoItem, setTipoNovoItem] = useState(''); 
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoValor, setNovoValor] = useState('');

  // --- NOVOS ESTADOS: CALCULADORA DE RESCISÃO ---
  const [salarioBase, setSalarioBase] = useState('');
  const [admissao, setAdmissao] = useState('');
  const [demissao, setDemissao] = useState('');
  const [tipoRescisao, setTipoRescisao] = useState('sem_justa_causa');
  const [resultadoRescisao, setResultadoRescisao] = useState(null);


  // --- MÁSCARAS E FORMATAÇÕES ---
  const handleCnpjChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
    setCnpj(value);
  };

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
    setCpf(value);
  };

  const formatarNumeroBr = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // --- LÓGICA DE RUBRICAS ---
  const handleSalvarRubrica = () => {
    if (!novoCodigo || !novaDescricao || !novoValor) return;
    const valorNumerico = parseFloat(novoValor.replace(/\./g, '').replace(',', '.')) || 0;
    const novaRubrica = { 
      id: Date.now(), 
      tipo: tipoNovoItem, 
      codigo: novoCodigo, 
      descricao: novaDescricao, 
      valor: valorNumerico 
    };
    setRubricas([...rubricas, novaRubrica]);
    setModoAdicao('inativo'); 
    setNovoCodigo(''); 
    setNovaDescricao(''); 
    setNovoValor('');
  };

  const handleRemoverRubrica = (id) => {
    setRubricas(rubricas.filter(item => item.id !== id));
  };

  const proventos = rubricas.filter(r => r.tipo === 'provento');
  const descontos = rubricas.filter(r => r.tipo === 'desconto');
  const totalProventos = proventos.reduce((acc, curr) => acc + curr.valor, 0);
  const totalDescontos = descontos.reduce((acc, curr) => acc + curr.valor, 0);
  const totalLiquido = totalProventos - totalDescontos;

  // --- GERAÇÃO DO PDF ---
  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14); 
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGAMENTO DE SALÁRIO', 105, 15, { align: 'center' });
    
    doc.setLineWidth(0.3); 
    doc.rect(14, 20, 182, 15);
    doc.setFontSize(9); 
    
    doc.setFont('helvetica', 'bold'); 
    doc.text('Empregador:', 16, 25);
    doc.setFont('helvetica', 'normal'); 
    doc.text(`${razaoSocial || 'Não informado'}`, 40, 25);
    
    doc.setFont('helvetica', 'bold'); 
    doc.text('CNPJ:', 16, 31);
    doc.setFont('helvetica', 'normal'); 
    doc.text(`${cnpj || 'Não informado'}`, 27, 31);
    
    doc.setFont('helvetica', 'bold'); 
    doc.text('Competência:', 145, 28);
    let compFormatada = dataCompetencia ? dataCompetencia.split('-').reverse().join('/') : 'Não informada';
    doc.setFont('helvetica', 'normal');
    doc.text(compFormatada, 170, 28);
    
    doc.rect(14, 35, 182, 15);
    doc.setFont('helvetica', 'bold'); 
    doc.text('Funcionário:', 16, 40);
    doc.setFont('helvetica', 'normal'); 
    doc.text(`${funcionario || 'Não informado'}`, 38, 40);
    
    doc.setFont('helvetica', 'bold'); 
    doc.text('CPF:', 145, 40); 
    doc.setFont('helvetica', 'normal'); 
    doc.text(`${cpf || 'Não informado'}`, 155, 40);
    
    doc.setFont('helvetica', 'bold'); 
    doc.text('Cargo/Função:', 16, 46); 
    doc.setFont('helvetica', 'normal'); 
    doc.text(`${cargo || 'Não informado'}`, 42, 46);
    
    doc.setFont('helvetica', 'bold'); 
    doc.text('Admissão:', 145, 46);
    let admFormatada = dataEntrada ? dataEntrada.split('-').reverse().join('/') : 'Não informada';
    doc.setFont('helvetica', 'normal');
    doc.text(admFormatada, 163, 46);
    
    const tableData = [];
    proventos.forEach(p => tableData.push([p.codigo, p.descricao, formatarNumeroBr(p.valor), '']));
    descontos.forEach(d => tableData.push([d.codigo, d.descricao, '', formatarNumeroBr(d.valor)]));
    
    if (tableData.length === 0) {
      tableData.push(['-', 'Nenhuma rubrica adicionada', '-', '-']);
    }

    autoTable(doc, {
      startY: 55, 
      head: [['Cód', 'Descrição', 'Vencimentos (R$)', 'Descontos (R$)']], 
      body: tableData, 
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], textColor: 20, fontStyle: 'bold', halign: 'center' },
      columnStyles: { 
        0: { halign: 'center', cellWidth: 20 }, 
        1: { halign: 'left' }, 
        2: { halign: 'right', cellWidth: 40 }, 
        3: { halign: 'right', cellWidth: 40 } 
      },
      styles: { fontSize: 9 }, 
      margin: { left: 14, right: 14 }
    });

    const finalY = doc.lastAutoTable.finalY || 70;
    
    doc.rect(14, finalY, 182, 15);
    doc.setFont('helvetica', 'bold'); 
    doc.text('Total de Vencimentos:', 65, finalY + 6);
    doc.setFont('helvetica', 'normal'); 
    doc.text(formatarMoeda(totalProventos), 143, finalY + 6, { align: 'right' });
    
    doc.setFont('helvetica', 'bold'); 
    doc.text('Total de Descontos:', 150, finalY + 6);
    doc.setFont('helvetica', 'normal'); 
    doc.text(formatarMoeda(totalDescontos), 193, finalY + 6, { align: 'right' });
    
    doc.setFont('helvetica', 'bold'); 
    doc.text('Valor Líquido:', 150, finalY + 12);
    doc.text(formatarMoeda(totalLiquido), 193, finalY + 12, { align: 'right' });
    
    doc.rect(14, finalY + 15, 182, 25);
    doc.setFontSize(8); 
    doc.setFont('helvetica', 'normal'); 
    doc.text('DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO.', 16, finalY + 22);
    doc.text('DATA: _____/_____/_______', 16, finalY + 34); 
    doc.text('ASSINATURA: ____________________________________________________', 80, finalY + 34);
    
    const nomeArquivo = `Holerite_${funcionario ? funcionario.replace(/\s+/g, '_') : 'Funcionario'}.pdf`;
    doc.save(nomeArquivo);
  };


  // --- LÓGICA DE RESCISÃO ---
  const calcularRescisao = () => {
    const salario = parseFloat(salarioBase);

    if (!salario || !admissao || !demissao) {
      return alert("Preencha todos os campos!");
    }

    const d1 = new Date(admissao);
    const d2 = new Date(demissao);

    const diffTime = Math.abs(d2 - d1);
    const mesesTrabalhados = Math.floor(
      diffTime / (1000 * 60 * 60 * 24 * 30)
    );

    const saldoSalario = (salario / 30) * d2.getDate();
    const decimoTerceiro = (salario / 12) * (d2.getMonth() + 1);

    const feriasBase =
      (salario / 12) * (mesesTrabalhados % 12);

    const feriasComTerco =
      feriasBase + (feriasBase / 3);

    let multaFgts = 0;

    if (tipoRescisao === 'sem_justa_causa') {
      multaFgts = salario * 0.40;
    }

    if (tipoRescisao === 'acordo') {
      multaFgts = salario * 0.20;
    }

    setResultadoRescisao({
      saldoSalario,
      decimoTerceiro,
      ferias: feriasComTerco,
      multaFgts,
      total:
        saldoSalario +
        decimoTerceiro +
        feriasComTerco +
        multaFgts,
    });
  };


  // ==========================================
  // ESTADOS E LÓGICAS DA NOVA ABA: CALCULADORA (APENAS FGTS)
  // ==========================================
  const [salarioBrutoCalc, setSalarioBrutoCalc] = useState('');
  const [resultadoCalc, setResultadoCalc] = useState(null);
  const [fgtsResultado, setFgtsResultado] = useState(null);

  const handleSalarioBrutoCalcChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (!value) {
      setSalarioBrutoCalc('');
      return;
    }
    value = (parseInt(value) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setSalarioBrutoCalc(value);
  };

  const calcularFGTS = () => {
    if (!salarioBrutoCalc) return;
    
    const bruto = parseFloat(salarioBrutoCalc.replace(/\./g, '').replace(',', '.'));
    if (isNaN(bruto) || bruto <= 0) return;

    const fgts = bruto * 0.08;

    setResultadoCalc({
      bruto,
      fgts
    });

    setFgtsResultado(fgts);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold">V</div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Grupo Vincent</h1>
              <p className="text-xs text-slate-400">Folha de Pagamento</p>
            </div>
          </div>
          <nav className="mt-4 px-4 space-y-2">
            <button 
              onClick={() => setAbaAtiva('gerar-folha')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${abaAtiva === 'gerar-folha' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <span>📄</span>
              <span>Gerar Folha</span>
            </button>

            <button 
              onClick={() => setAbaAtiva('calculadora')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${abaAtiva === 'calculadora' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <span>🧮</span>
              <span>Calculadora</span>
            </button>
          </nav>
        </div>
        <div className="p-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Competência atual</p>
            <p className="font-bold">{competenciaAutomatica}</p>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 shrink-0"></header>

        {abaAtiva === 'gerar-folha' ? (
          
          <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de entrada</label>
                      <input type="date" value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Competência</label>
                      <input type="date" value={dataCompetencia} onChange={(e) => setDataCompetencia(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  {modoAdicao === 'inativo' && (
                    <button onClick={() => setModoAdicao('selecionando_tipo')} className="bg-blue-50 text-blue-600 border border-blue-200 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors w-fit flex items-center">
                      <span className="mr-2 text-xl leading-none">+</span> Adicionar
                    </button>
                  )}
                  {modoAdicao === 'selecionando_tipo' && (
                    <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm flex items-center space-x-4">
                      <p className="text-sm font-medium text-gray-700">Qual tipo de rubrica deseja adicionar?</p>
                      <button onClick={() => { setTipoNovoItem('provento'); setModoAdicao('preenchendo'); }} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">Provento</button>
                      <button onClick={() => { setTipoNovoItem('desconto'); setModoAdicao('preenchendo'); }} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm">Desconto</button>
                      <button onClick={() => setModoAdicao('inativo')} className="text-gray-500 text-sm hover:underline ml-auto">Cancelar</button>
                    </div>
                  )}
                  {modoAdicao === 'preenchendo' && (
                    <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-800">
                          Novo {tipoNovoItem === 'provento' ? <span className="text-blue-600">Provento</span> : <span className="text-red-600">Desconto</span>}
                        </h4>
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
                </div>

                {proventos.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-blue-500 text-lg font-medium">Proventos</h3>
                    </div>
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
                        {proventos.map(p => (
                          <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">{p.codigo}</td>
                            <td className="py-3 px-4 text-sm text-gray-800">{p.descricao}</td>
                            <td className="py-3 px-4 text-right text-sm">{formatarNumeroBr(p.valor)}</td>
                            <td className="py-3 px-4 text-center">
                              <button onClick={() => handleRemoverRubrica(p.id)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                            </td>
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
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-red-500 text-lg font-medium">Descontos</h3>
                    </div>
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
                            <td className="py-3 px-4 text-center">
                              <button onClick={() => handleRemoverRubrica(d.id)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                            </td>
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
                <button onClick={gerarPDF} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <span>📄</span><span>Gerar PDF</span>
                </button>
              </div>
            </div>
          </div>

        ) : (
          <div className="p-8 max-w-2xl mx-auto w-full animate-in slide-in-from-right duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Calculadora de Rescisão
            </h2>

            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salário Base (R$)
                  </label>
                  <input
                    type="text"
                    value={salarioBase}
                    onChange={(e) => setSalarioBase(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="3200,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Rescisão
                  </label>
                  <select
                    value={tipoRescisao}
                    onChange={(e) => setTipoRescisao(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    <option value="sem_justa_causa">Sem Justa Causa</option>
                    <option value="pedido_demissao">Pedido de Demissão</option>
                    <option value="justa_causa">Justa Causa</option>
                    <option value="acordo">Acordo (Art. 484-A)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data Admissão
                  </label>
                  <input
                    type="date"
                    value={admissao}
                    onChange={(e) => setAdmissao(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data Desligamento
                  </label>
                  <input
                    type="date"
                    value={demissao}
                    onChange={(e) => setDemissao(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              <button
                onClick={calcularRescisao}
                className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition-all"
              >
                Calcular Rescisão
              </button>

              {resultadoRescisao && (
                <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-lg mb-4">
                    Resumo do Cálculo
                  </h4>

                  <div className="space-y-2 text-sm">
                    <p>
                      Saldo de Salário:{' '}
                      {formatarMoeda(resultadoRescisao.saldoSalario)}
                    </p>

                    <p>
                      13º Salário:{' '}
                      {formatarMoeda(resultadoRescisao.decimoTerceiro)}
                    </p>

                    <p>
                      Férias + 1/3:{' '}
                      {formatarMoeda(resultadoRescisao.ferias)}
                    </p>

                    {resultadoRescisao.multaFgts > 0 && (
                      <p className="text-red-600 font-medium">
                        Multa FGTS:{' '}
                        {formatarMoeda(resultadoRescisao.multaFgts)}
                      </p>
                    )}

                    <p className="font-bold text-xl mt-4 border-t pt-2">
                      Total: {formatarMoeda(resultadoRescisao.total)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;