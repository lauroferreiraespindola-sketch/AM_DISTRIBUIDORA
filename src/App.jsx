import React, { useState } from 'react';
import { 
  Droplet, DollarSign, Clock, ShieldAlert, Plus, Send, 
  CheckCircle, Truck, UserCheck, AlertTriangle
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('admin'); 
  const [activeTab, setActiveTab] = useState('dashboard');

  const [estoqueGarroes, setEstoqueGarroes] = useState(150);
  const [precoGarrao] = useState(12.00);
  const [consumoDiarioMedio, setConsumoDiarioMedio] = useState(30);
  const [caixaTotal, setCaixaTotal] = useState(1450.00);

  const [clientes, setClientes] = useState([
    { id: 1, nome: 'Posto Ipiranga Centro', consumoMedio: 5, telefone: '(79) 9999-1111', endereco: 'Av. Ivo Silva, 100' },
    { id: 2, nome: 'Supermercado Bom Preço', consumoMedio: 15, telefone: '(79) 9999-2222', endereco: 'Rua da Frente, 45' },
    { id: 3, nome: 'Escritório Contabilidade Silva', consumoMedio: 3, telefone: '(79) 9999-3333', endereco: 'Travessa Joana, 12' },
  ]);

  const [pedidos, setPedidos] = useState([
    { id: 101, clienteId: 1, clienteNome: 'Posto Ipiranga Centro', quantidade: 5, status: 'Pendente', vendedor: 'João Entregador' },
    { id: 102, clienteId: 2, clienteNome: 'Supermercado Bom Preço', quantidade: 10, status: 'Pendente', vendedor: 'Carlos Moto' },
  ]);

  const [perdasDiarias, setPerdasDiarias] = useState([
    { id: 1, data: '2026-06-07', clienteNome: 'Academia Corpo Livre', quantidadeDesejada: 8, motivo: 'Falta de Estoque' }
  ]);

  const [novoCliente, setNovoCliente] = useState({ nome: '', consumoMedio: 2, telefone: '', endereco: '' });
  const [novoPedido, setNovoPedido] = useState({ clienteId: '', quantidade: 2, vendedor: 'João Entregador' });
  const [qtdEntrada, setQtdEntrada] = useState(50);

  const valorTotalEstoque = estoqueGarroes * precoGarrao;
  const diasAutonomia = consumoDiarioMedio > 0 ? (estoqueGarroes / consumoDiarioMedio).toFixed(1) : 0;
  const clientesAtendiveis = consumoDiarioMedio > 0 ? Math.floor(estoqueGarroes / (consumoDiarioMedio / clientes.length || 1)) : 0;

  const totalPerdasQtdMes = perdasDiarias.reduce((acc, item) => acc + item.quantidadeDesejada, 0);
  const prejuizoMes = totalPerdasQtdMes * precoGarrao * 30;

  const handleAdicionarEstoque = (e) => {
    e.preventDefault();
    setEstoqueGarroes(prev => prev + Number(qtdEntrada));
    alert(`Entrada de ${qtdEntrada} garrafões de 20L registrada com sucesso!`);
  };

  const handleCadastrarCliente = (e) => {
    e.preventDefault();
    setClientes([...clientes, { id: Date.now(), ...novoCliente, consumoMedio: Number(novoCliente.consumoMedio) }]);
    setNovoCliente({ nome: '', consumoMedio: 2, telefone: '', endereco: '' });
    alert('Cliente cadastrado com sucesso!');
  };

  const handleCriarPedido = (e) => {
    e.preventDefault();
    const clienteObj = clientes.find(c => c.id === Number(novoPedido.clienteId));
    if (!clienteObj) return alert('Selecione um cliente válido.');

    const pedidoItem = {
      id: Date.now(),
      clienteId: clienteObj.id,
      clienteNome: clienteObj.nome,
      quantidade: Number(novoPedido.quantidade),
      status: 'Pendente',
      vendedor: novoPedido.vendedor
    };

    setPedidos([...pedidos, pedidoItem]);
    alert('Pedido enviado em tempo real para o telemóvel do vendedor!');
  };

  const handleConfirmarEntrega = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    if (estoqueGarroes < pedido.quantidade) {
      alert('Erro: Estoque insuficiente para concluir esta entrega!');
      return;
    }

    setEstoqueGarroes(prev => prev - pedido.quantidade);
    const valorVenda = pedido.quantidade * precoGarrao;
    setCaixaTotal(prev => prev + valorVenda);

    setPedidos(pedidos.map(p => p.id === pedidoId ? { ...p, status: 'Entregue' } : p));
    alert(`Entrega confirmada! Baixa de ${pedido.quantidade} garrafões efetuada.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 shadow-lg border-b border-blue-500/30 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-inner flex items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md border border-cyan-400">
                AM
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-white drop-shadow">AM DISTRIBUIDORA</h1>
              <p className="text-xs text-cyan-200 font-medium">Água Mineral 20L • (79) 99988-5380</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-950/60 p-1.5 rounded-2xl border border-blue-400/30">
            <span className="text-xs text-slate-300 font-semibold px-2">Perfil Ativo:</span>
            <button 
              onClick={() => { setRole('admin'); setActiveTab('dashboard'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${role === 'admin' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              👑 Gestor / Admin
            </button>
            <button 
              onClick={() => { setRole('vendedor'); setActiveTab('pedidos-vendedor'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${role === 'vendedor' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              📱 Vendedor / Entregador
            </button>
          </div>
        </div>
      </header>

      <nav className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>📊 Dashboard Geral</button>
              <button onClick={() => setActiveTab('estoque')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'estoque' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>💧 Estoque & Entradas</button>
              <button onClick={() => setActiveTab('clientes')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'clientes' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>👥 Carteira de Clientes</button>
              <button onClick={() => setActiveTab('perdas')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'perdas' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>⚠️ Perdas & Não Atendidos</button>
            </>
          )}
          
          <button onClick={() => setActiveTab('pedidos-vendedor')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'pedidos-vendedor' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            🚚 Pedidos & Entregas em Tempo Real
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {role === 'admin' && activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl backdrop-blur">
                <div className="flex justify-between items-center text-cyan-400 mb-2">
                  <span className="text-sm font-medium">Estoque Atual (20L)</span>
                  <Droplet className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black">{estoqueGarroes} <span className="text-sm text-slate-400 font-normal">garrafões</span></div>
                <p className="text-xs text-slate-400 mt-1">Valor imobilizado: <strong className="text-emerald-400">R$ {valorTotalEstoque.toFixed(2)}</strong></p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl backdrop-blur">
                <div className="flex justify-between items-center text-emerald-400 mb-2">
                  <span className="text-sm font-medium">Caixa da Empresa</span>
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-emerald-400">R$ {caixaTotal.toFixed(2)}</div>
                <p className="text-xs text-slate-400 mt-1">Alimentado via confirmação de entregas</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl backdrop-blur">
                <div className="flex justify-between items-center text-amber-400 mb-2">
                  <span className="text-sm font-medium">Autonomia do Estoque</span>
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black">{diasAutonomia} <span className="text-sm text-slate-400 font-normal">dias</span></div>
                <p className="text-xs text-slate-400 mt-1">Atende aprox. {clientesAtendiveis} clientes</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl backdrop-blur">
                <div className="flex justify-between items-center text-rose-400 mb-2">
                  <span className="text-sm font-medium">Prejuízo Mensal (Falta)</span>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-rose-400">R$ {prejuizoMes.toFixed(2)}</div>
                <p className="text-xs text-slate-400 mt-1">Deixou de ganhar com não atendidos</p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" /> Emitir Novo Pedido para os Vendedores (Tempo Real)
              </h3>
              <form onSubmit={handleCriarPedido} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cliente</label>
                  <select 
                    value={novoPedido.clienteId} 
                    onChange={e => setNovoPedido({...novoPedido, clienteId: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    required
                  >
                    <option value="">Selecione o cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} (Consumo: {c.consumoMedio} un)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Quantidade (Garrafões 20L)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={novoPedido.quantidade}
                    onChange={e => setNovoPedido({...novoPedido, quantidade: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Vendedor Atribuído</label>
                  <input 
                    type="text" 
                    value={novoPedido.vendedor}
                    onChange={e => setNovoPedido({...novoPedido, vendedor: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition">
                    Enviar para o Celular
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {role === 'admin' && activeTab === 'estoque' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Dar Entrada em Garrafões (20 Litros)
              </h3>
              <form onSubmit={handleAdicionarEstoque} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Quantidade Recebida da Fábrica</label>
                  <input 
                    type="number" 
                    min="1"
                    value={qtdEntrada}
                    onChange={e => setQtdEntrada(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow transition">
                  Confirmar Entrada no Estoque
                </button>
              </form>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Resumo Financeiro do Estoque</h3>
                <p className="text-sm text-slate-400 mb-4">Cálculo baseado no preço unitário configurado de R$ {precoGarrao.toFixed(2)} por garrafão de 20L.</p>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Garrafões em Estoque:</span>
                    <span className="font-bold text-white">{estoqueGarroes} un</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Valor Total Equivalente:</span>
                    <span className="font-bold text-emerald-400">R$ {valorTotalEstoque.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Autonomia estimada:</span>
                    <span className="font-bold text-cyan-400">{diasAutonomia} dias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {role === 'admin' && activeTab === 'clientes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl h-fit">
              <h3 className="text-lg font-bold text-white mb-4">Novo Cliente</h3>
              <form onSubmit={handleCadastrarCliente} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nome do Estabelecimento / Cliente</label>
                  <input type="text" value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Consumo Médio (Garrafões/Semana)</label>
                  <input type="number" min="1" value={novoCliente.consumoMedio} onChange={e => setNovoCliente({...novoCliente, consumoMedio: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Telefone / WhatsApp</label>
                  <input type="text" value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Endereço</label>
                  <input type="text" value={novoCliente.endereco} onChange={e => setNovoCliente({...novoCliente, endereco: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm shadow">Cadastrar Cliente</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Carteira Ativa ({clientes.length} Clientes)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-3 rounded-l-xl">Cliente</th>
                      <th className="p-3">Telefone</th>
                      <th className="p-3">Endereço</th>
                      <th className="p-3 rounded-r-xl">Consumo Médio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {clientes.map(c => (
                      <tr key={c.id} className="hover:bg-slate-750">
                        <td className="p-3 font-semibold text-white">{c.nome}</td>
                        <td className="p-3">{c.telefone}</td>
                        <td className="p-3 text-slate-400">{c.endereco}</td>
                        <td className="p-3 font-bold text-cyan-400">{c.consumoMedio} un</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {role === 'admin' && activeTab === 'perdas' && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Relatório de Clientes Não Atendidos e Deixar de Ganhar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">Volume Total Não Atendido no Mês</span>
                <span className="text-2xl font-bold text-rose-400">{totalPerdasQtdMes * 4} garrafões</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">Prejuízo Financeiro Estimado</span>
                <span className="text-2xl font-bold text-rose-400">R$ {prejuizoMes.toFixed(2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3 rounded-l-xl">Data</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Qtd Desejada</th>
                    <th className="p-3 rounded-r-xl">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {perdasDiarias.map(p => (
                    <tr key={p.id}>
                      <td className="p-3">{p.data}</td>
                      <td className="p-3 font-semibold text-white">{p.clienteNome}</td>
                      <td className="p-3 text-rose-400 font-bold">{p.quantidadeDesejada} un</td>
                      <td className="p-3 text-slate-400">{p.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pedidos-vendedor' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-cyan-200 text-sm">Painel do Entregador (Tempo Real)</h3>
                <p className="text-xs text-slate-300">Confirme a entrega para dar baixa no estoque e atualizar o sistema.</p>
              </div>
              <Truck className="w-8 h-8 text-cyan-400" />
            </div>

            <div className="space-y-3">
              {pedidos.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum pedido atribuído no momento.</p>
              ) : (
                pedidos.map(p => (
                  <div key={p.id} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{p.clienteNome}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === 'Entregue' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm text-cyan-300 mt-1">📦 Quantidade: <strong>{p.quantidade} garrafões (20L)</strong></p>
                      <p className="text-xs text-slate-400">👤 Entregador responsável: {p.vendedor}</p>
                    </div>

                    {p.status === 'Pendente' ? (
                      <button 
                        onClick={() => handleConfirmarEntrega(p.id)}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle className="w-5 h-5" /> Confirmar Entrega
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-400 font-semibold text-sm">
                        <UserCheck className="w-5 h-5" /> Concluído
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
