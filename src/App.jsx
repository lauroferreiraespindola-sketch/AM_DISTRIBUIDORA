import React, { useState } from 'react';
import { 
  Droplet, DollarSign, Clock, ShieldAlert, Plus, Send, 
  CheckCircle, Truck, UserCheck, AlertTriangle, Lock, User, 
  LogOut, Eye, EyeOff, UserPlus, Key
} from 'lucide-react';

export default function App() {
  // --- BASE DE DADOS DE USUÁRIOS ---
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Gestor AM', login: 'admin', email: 'admin@amagua.com.br', senha: 'admin123', role: 'admin' },
    { id: 2, nome: 'João Entregador', login: 'joao', email: 'joao@amagua.com.br', senha: 'vendedor123', role: 'vendedor' },
    { id: 3, nome: 'Carlos Moto', login: 'carlos', email: 'carlos@amagua.com.br', senha: 'vendedor123', role: 'vendedor' },
  ]);

  // --- ESTADO DE AUTENTICAÇÃO ---
  const [usuarioLogado, setUsuarioLogado] = useState(null); // null = Tela de Login
  const [inputLogin, setInputLogin] = useState('');
  const [inputSenha, setInputSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroLogin, setErroLogin] = useState('');

  // Navegação Interna
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- ESTADOS DO NEGÓCIO ---
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

  // Formulários
  const [novoCliente, setNovoCliente] = useState({ nome: '', consumoMedio: 2, telefone: '', endereco: '' });
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', login: '', senha: '', role: 'vendedor' });
  const [novoPedido, setNovoPedido] = useState({ clienteId: '', quantidade: 2, vendedor: 'João Entregador' });
  const [qtdEntrada, setQtdEntrada] = useState(50);

  // --- AUTENTICAÇÃO / LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    setErroLogin('');
    
    const user = usuarios.find(
      u => (u.login.toLowerCase() === inputLogin.trim().toLowerCase() || u.email.toLowerCase() === inputLogin.trim().toLowerCase()) && u.senha === inputSenha
    );

    if (user) {
      setUsuarioLogado(user);
      setInputLogin('');
      setInputSenha('');
      setActiveTab(user.role === 'admin' ? 'dashboard' : 'pedidos-vendedor');
    } else {
      setErroLogin('Usuário ou senha incorretos! Verifique as credenciais.');
    }
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setActiveTab('dashboard');
  };

  // --- CÁLCULOS DO NEGÓCIO ---
  const valorTotalEstoque = estoqueGarroes * precoGarrao;
  const diasAutonomia = consumoDiarioMedio > 0 ? (estoqueGarroes / consumoDiarioMedio).toFixed(1) : 0;
  const clientesAtendiveis = consumoDiarioMedio > 0 ? Math.floor(estoqueGarroes / (consumoDiarioMedio / clientes.length || 1)) : 0;
  const totalPerdasQtdMes = perdasDiarias.reduce((acc, item) => acc + item.quantidadeDesejada, 0);
  const prejuizoMes = totalPerdasQtdMes * precoGarrao * 30;

  // --- AÇÕES ADMIN ---
  const handleCadastrarUsuario = (e) => {
    e.preventDefault();
    if (usuarios.some(u => u.login.toLowerCase() === novoUsuario.login.trim().toLowerCase())) {
      alert('Este nome de usuário já está em uso!');
      return;
    }
    const novouser = {
      id: Date.now(),
      ...novoUsuario,
      email: `${novoUsuario.login}@amagua.com.br`
    };
    setUsuarios([...usuarios, novouser]);
    setNovoUsuario({ nome: '', login: '', senha: '', role: 'vendedor' });
    alert(`Usuário ${novouser.nome} cadastrado com sucesso!`);
  };

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
    alert('Pedido enviado em tempo real para o vendedor!');
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

  // ================= TELA DE LOGIN =================
  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          {/* Header da Logo no Login */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-cyan-400">
              AM
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">AM DISTRIBUIDORA</h1>
            <p className="text-xs text-cyan-300">Sistema de Controle de Água Mineral 20L</p>
          </div>

          {/* Mensagem de Erro */}
          {erroLogin && (
            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{erroLogin}</span>
            </div>
          )}

          {/* Form de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Usuário ou E-mail</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={inputLogin}
                  onChange={e => setInputLogin(e.target.value)}
                  placeholder="Ex: admin ou joao"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                <input 
                  type={mostrarSenha ? "text" : "password"}
                  value={inputSenha}
                  onChange={e => setInputSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl shadow-lg transition duration-200 mt-2"
            >
              Entrar no Sistema
            </button>
          </form>

          {/* Credenciais Rápidas de Teste */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block mb-1">💡 Credenciais de Teste:</span>
            <div className="flex justify-between">
              <span>👑 Admin: <strong>admin</strong> / <strong>admin123</strong></span>
            </div>
            <div className="flex justify-between">
              <span>📱 Entregador: <strong>joao</strong> / <strong>vendedor123</strong></span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ================= PAINEL LOGADO =================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* CABEÇALHO */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 shadow-lg border-b border-blue-500/30 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md border border-cyan-400">
              AM
            </div>
            <div>
              <h1 className="text-lg font-black text-white">AM DISTRIBUIDORA</h1>
              <p className="text-xs text-cyan-200">Água Mineral 20L • (79) 99988-5380</p>
            </div>
          </div>

          {/* Info do Usuário Logado & Botão Sair */}
          <div className="flex items-center gap-3 bg-blue-950/70 px-4 py-2 rounded-2xl border border-blue-400/30">
            <div className="text-right">
              <span className="text-xs text-white font-bold block">{usuarioLogado.nome}</span>
              <span className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">
                {usuarioLogado.role === 'admin' ? '👑 Gestor / Admin' : '📱 Vendedor / Entregador'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 p-2 rounded-xl transition"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* MENU DE NAVEGAÇÃO */}
      <nav className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {usuarioLogado.role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>📊 Dashboard Geral</button>
              <button onClick={() => setActiveTab('estoque')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'estoque' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>💧 Estoque & Entradas</button>
              <button onClick={() => setActiveTab('clientes')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'clientes' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>👥 Carteira & Usuários</button>
              <button onClick={() => setActiveTab('perdas')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'perdas' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>⚠️ Perdas & Não Atendidos</button>
            </>
          )}
          
          <button onClick={() => setActiveTab('pedidos-vendedor')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'pedidos-vendedor' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            🚚 Pedidos & Entregas em Tempo Real
          </button>
        </div>
      </nav>

      {/* CORPO DA APLICAÇÃO */}
      <main className="max-w-7xl mx-auto px-4 mt-6">

        {/* ================= DASHBOARD ADMIN ================= */}
        {usuarioLogado.role === 'admin' && activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center text-cyan-400 mb-2">
                  <span className="text-sm font-medium">Estoque (20L)</span>
                  <Droplet className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black">{estoqueGarroes} <span className="text-sm text-slate-400 font-normal">garrafões</span></div>
                <p className="text-xs text-slate-400 mt-1">Valor: <strong className="text-emerald-400">R$ {valorTotalEstoque.toFixed(2)}</strong></p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center text-emerald-400 mb-2">
                  <span className="text-sm font-medium">Caixa da Empresa</span>
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-emerald-400">R$ {caixaTotal.toFixed(2)}</div>
                <p className="text-xs text-slate-400 mt-1">Atualizado pelas entregas</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center text-amber-400 mb-2">
                  <span className="text-sm font-medium">Autonomia</span>
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black">{diasAutonomia} <span className="text-sm text-slate-400 font-normal">dias</span></div>
                <p className="text-xs text-slate-400 mt-1">Atende {clientesAtendiveis} clientes</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center text-rose-400 mb-2">
                  <span className="text-sm font-medium">Prejuízo Mensal</span>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-rose-400">R$ {prejuizoMes.toFixed(2)}</div>
                <p className="text-xs text-slate-400 mt-1">Não atendidos no período</p>
              </div>
            </div>

            {/* Emissão de Pedidos */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" /> Emitir Pedido em Tempo Real para Entregador
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
                    <option value="">Selecione...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Garrafões 20L</label>
                  <input 
                    type="number" min="1"
                    value={novoPedido.quantidade}
                    onChange={e => setNovoPedido({...novoPedido, quantidade: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Vendedor Atribuído</label>
                  <select
                    value={novoPedido.vendedor}
                    onChange={e => setNovoPedido({...novoPedido, vendedor: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    {usuarios.filter(u => u.role === 'vendedor').map(u => (
                      <option key={u.id} value={u.nome}>{u.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:brightness-110 transition">
                    Enviar para Celular
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= GESTÃO DE USUÁRIOS E CLIENTES ================= */}
        {usuarioLogado.role === 'admin' && activeTab === 'clientes' && (
          <div className="space-y-6">
            
            {/* Cadastro de Novos Usuários (Login/Senha) */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" /> Cadastrar Novo Usuário / Vendedor
              </h3>
              <form onSubmit={handleCadastrarUsuario} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nome Completo</label>
                  <input type="text" value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Usuário / Login</label>
                  <input type="text" value={novoUsuario.login} onChange={e => setNovoUsuario({...novoUsuario, login: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Senha de Acesso</label>
                  <input type="password" value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-xl shadow transition">
                    Criar Acesso
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Usuários do Sistema */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-3">Usuários com Acesso ao Sistema</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {usuarios.map(u => (
                  <div key={u.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-sm block">{u.nome}</span>
                      <span className="text-xs text-slate-400">Login: <code className="text-cyan-300">{u.login}</code></span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TELA DO VENDEDOR / ENTREGADOR ================= */}
        {activeTab === 'pedidos-vendedor' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-cyan-200 text-sm">Entregas Atribuídas</h3>
                <p className="text-xs text-slate-300">Confirme a entrega para dar baixa no estoque.</p>
              </div>
              <Truck className="w-8 h-8 text-cyan-400" />
            </div>

            <div className="space-y-3">
              {pedidos.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum pedido pendente.</p>
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
                    </div>

                    {p.status === 'Pendente' ? (
                      <button 
                        onClick={() => handleConfirmarEntrega(p.id)}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
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