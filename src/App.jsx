import React, { useState } from 'react';
import { 
  Droplet, DollarSign, Clock, ShieldAlert, Plus, Send, 
  CheckCircle, Truck, UserCheck, AlertTriangle, Lock, User, 
  LogOut, Eye, EyeOff, UserPlus, Key, Edit, Trash2, Shield, Users, UserCheck as UserCheckIcon
} from 'lucide-react';

export default function App() {
  // --- BASE DE DADOS DE USUÁRIOS (CRUD) ---
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Gestor AM', login: 'admin', email: 'admin@amagua.com.br', senha: 'admin123', role: 'admin' },
    { id: 2, nome: 'João Entregador', login: 'joao', email: 'joao@amagua.com.br', senha: 'vendedor123', role: 'vendedor' },
    { id: 3, nome: 'Carlos Moto', login: 'carlos', email: 'carlos@amagua.com.br', senha: 'vendedor123', role: 'vendedor' },
  ]);

  // --- BASE DE DADOS DE CLIENTES (CRUD) ---
  const [clientes, setClientes] = useState([
    { id: 1, nome: 'Posto Ipiranga Centro', consumoMedio: 5, telefone: '(79) 9999-1111', endereco: 'Av. Ivo Silva, 100' },
    { id: 2, nome: 'Supermercado Bom Preço', consumoMedio: 15, telefone: '(79) 9999-2222', endereco: 'Rua da Frente, 45' },
    { id: 3, nome: 'Escritório Contabilidade Silva', consumoMedio: 3, telefone: '(79) 9999-3333', endereco: 'Travessa Joana, 12' },
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

  const [pedidos, setPedidos] = useState([
    { id: 101, clienteId: 1, clienteNome: 'Posto Ipiranga Centro', quantidade: 5, status: 'Pendente', vendedor: 'João Entregador' },
    { id: 102, clienteId: 2, clienteNome: 'Supermercado Bom Preço', quantidade: 10, status: 'Pendente', vendedor: 'Carlos Moto' },
  ]);

  const [perdasDiarias, setPerdasDiarias] = useState([
    { id: 1, data: '2026-06-07', clienteNome: 'Academia Corpo Livre', quantidadeDesejada: 8, motivo: 'Falta de Estoque' }
  ]);

  // Formulários & Modais de Edição
  const [formCliente, setFormCliente] = useState({ id: null, nome: '', consumoMedio: 2, telefone: '', endereco: '' });
  const [formUsuario, setFormUsuario] = useState({ id: null, nome: '', login: '', senha: '', role: 'vendedor' });
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
  const clientesAtendiveis = consumoDiarioMedio > 0 ? Math.floor(estoqueGarroes / (consumoDiarioMedio / (clientes.length || 1))) : 0;
  const totalPerdasQtdMes = perdasDiarias.reduce((acc, item) => acc + item.quantidadeDesejada, 0);
  const prejuizoMes = totalPerdasQtdMes * precoGarrao * 30;

  // ================= CRUD DE USUÁRIOS =================
  const handleSalvarUsuario = (e) => {
    e.preventDefault();
    if (formUsuario.id) {
      // Editar
      setUsuarios(usuarios.map(u => u.id === formUsuario.id ? { ...formUsuario } : u));
      alert(`Usuário ${formUsuario.nome} atualizado com sucesso!`);
    } else {
      // Cadastrar
      if (usuarios.some(u => u.login.toLowerCase() === formUsuario.login.trim().toLowerCase())) {
        alert('Este nome de usuário já está em uso!');
        return;
      }
      const novouser = {
        id: Date.now(),
        ...formUsuario,
        email: `${formUsuario.login}@amagua.com.br`
      };
      setUsuarios([...usuarios, novouser]);
      alert(`Usuário ${novouser.nome} cadastrado com sucesso!`);
    }
    setFormUsuario({ id: null, nome: '', login: '', senha: '', role: 'vendedor' });
  };

  const handleEditarUsuario = (user) => {
    setFormUsuario({ ...user });
  };

  const handleExcluirUsuario = (id) => {
    if (usuarioLogado && usuarioLogado.id === id) {
      alert('Você não pode excluir o seu próprio usuário enquanto está logado!');
      return;
    }
    if (window.confirm('Tem certeza de que deseja excluir este usuário?')) {
      setUsuarios(usuarios.filter(u => u.id !== id));
      alert('Usuário removido com sucesso!');
    }
  };

  // ================= CRUD DE CLIENTES =================
  const handleSalvarCliente = (e) => {
    e.preventDefault();
    if (formCliente.id) {
      // Editar
      setClientes(clientes.map(c => c.id === formCliente.id ? { ...formCliente, consumoMedio: Number(formCliente.consumoMedio) } : c));
      alert('Cliente atualizado com sucesso!');
    } else {
      // Cadastrar
      setClientes([...clientes, { id: Date.now(), ...formCliente, consumoMedio: Number(formCliente.consumoMedio) }]);
      alert('Cliente cadastrado com sucesso!');
    }
    setFormCliente({ id: null, nome: '', consumoMedio: 2, telefone: '', endereco: '' });
  };

  const handleEditarCliente = (cliente) => {
    setFormCliente({ ...cliente });
  };

  const handleExcluirCliente = (id) => {
    if (window.confirm('Tem certeza de que deseja excluir este cliente da carteira?')) {
      setClientes(clientes.filter(c => c.id !== id));
      alert('Cliente excluído com sucesso!');
    }
  };

  // --- DEMAIS AÇÕES ---
  const handleAdicionarEstoque = (e) => {
    e.preventDefault();
    setEstoqueGarroes(prev => prev + Number(qtdEntrada));
    alert(`Entrada de ${qtdEntrada} garrafões de 20L registrada com sucesso!`);
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
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-cyan-400">
              AM
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">AM DISTRIBUIDORA</h1>
            <p className="text-xs text-cyan-300">Sistema de Gestão & Controle de Água 20L</p>
          </div>

          {erroLogin && (
            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{erroLogin}</span>
            </div>
          )}

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

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block mb-1">💡 Acessos Rápidos de Teste:</span>
            <div className="flex justify-between">
              <span>👑 Admin: <strong>admin</strong> / <strong>admin123</strong></span>
            </div>
            <div className="flex justify-between">
              <span>📱 Vendedor: <strong>joao</strong> / <strong>vendedor123</strong></span>
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
              <button onClick={() => setActiveTab('clientes')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'clientes' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>👥 Carteira de Clientes</button>
              <button onClick={() => setActiveTab('usuarios')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'usuarios' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>🔐 Gestão de Usuários</button>
              <button onClick={() => setActiveTab('perdas')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'perdas' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>⚠️ Perdas & Não Atendidos</button>
            </>
          )}
          
          <button onClick={() => setActiveTab('pedidos-vendedor')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'pedidos-vendedor' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            🚚 Pedidos & Entregas em Tempo Real
          </button>
        </div>
      </nav>

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

        {/* ================= GESTÃO DE ESTOQUE ================= */}
        {usuarioLogado.role === 'admin' && activeTab === 'estoque' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Dar Entrada em Garrafões (20 Litros)
              </h3>
              <form onSubmit={handleAdicionarEstoque} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Quantidade Recebida</label>
                  <input 
                    type="number" min="1"
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
                <p className="text-sm text-slate-400 mb-4">Cálculo baseado no preço unitário de R$ {precoGarrao.toFixed(2)} por garrafão.</p>
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

        {/* ================= CARTEIRA DE CLIENTES (CADASTRO / EDICÃO / EXCLUSÃO) ================= */}
        {usuarioLogado.role === 'admin' && activeTab === 'clientes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulário de Cadastro / Edição de Cliente */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl h-fit">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>{formCliente.id ? '✏️ Editar Cliente' : '➕ Novo Cliente'}</span>
                {formCliente.id && (
                  <button onClick={() => setFormCliente({ id: null, nome: '', consumoMedio: 2, telefone: '', endereco: '' })} className="text-xs text-rose-400 hover:underline">
                    Cancelar Edição
                  </button>
                )}
              </h3>
              <form onSubmit={handleSalvarCliente} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nome do Estabelecimento / Cliente</label>
                  <input type="text" value={formCliente.nome} onChange={e => setFormCliente({...formCliente, nome: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Consumo Médio (Garrafões/Semana)</label>
                  <input type="number" min="1" value={formCliente.consumoMedio} onChange={e => setFormCliente({...formCliente, consumoMedio: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Telefone / WhatsApp</label>
                  <input type="text" value={formCliente.telefone} onChange={e => setFormCliente({...formCliente, telefone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Endereço</label>
                  <input type="text" value={formCliente.endereco} onChange={e => setFormCliente({...formCliente, endereco: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm shadow">
                  {formCliente.id ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                </button>
              </form>
            </div>

            {/* Tabela de Clientes */}
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Carteira de Clientes ({clientes.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-3 rounded-l-xl">Cliente</th>
                      <th className="p-3">Telefone</th>
                      <th className="p-3">Endereço</th>
                      <th className="p-3">Consumo</th>
                      <th className="p-3 text-right rounded-r-xl">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {clientes.map(c => (
                      <tr key={c.id} className="hover:bg-slate-750">
                        <td className="p-3 font-semibold text-white">{c.nome}</td>
                        <td className="p-3">{c.telefone}</td>
                        <td className="p-3 text-slate-400">{c.endereco}</td>
                        <td className="p-3 font-bold text-cyan-400">{c.consumoMedio} un</td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => handleEditarCliente(c)} className="p-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-lg transition" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleExcluirCliente(c.id)} className="p-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 rounded-lg transition" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= GESTÃO DE USUÁRIOS (CADASTRO / EDIÇÃO / EXCLUSÃO / PRIVILÉGIOS) ================= */}
        {usuarioLogado.role === 'admin' && activeTab === 'usuarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulário do Usuário */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl h-fit">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>{formUsuario.id ? '✏️ Editar Usuário' : '➕ Novo Usuário'}</span>
                {formUsuario.id && (
                  <button onClick={() => setFormUsuario({ id: null, nome: '', login: '', senha: '', role: 'vendedor' })} className="text-xs text-rose-400 hover:underline">
                    Cancelar Edição
                  </button>
                )}
              </h3>
              <form onSubmit={handleSalvarUsuario} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nome Completo</label>
                  <input type="text" value={formUsuario.nome} onChange={e => setFormUsuario({...formUsuario, nome: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Usuário / Login</label>
                  <input type="text" value={formUsuario.login} onChange={e => setFormUsuario({...formUsuario, login: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Senha de Acesso</label>
                  <input type="password" value={formUsuario.senha} onChange={e => setFormUsuario({...formUsuario, senha: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Privilégio de Acesso</label>
                  <select 
                    value={formUsuario.role}
                    onChange={e => setFormUsuario({...formUsuario, role: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold"
                  >
                    <option value="vendedor">📱 Vendedor / Entregador (Acesso Restrito)</option>
                    <option value="admin">👑 Gestor / Administrador (Acesso Total)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm shadow">
                  {formUsuario.id ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
                </button>
              </form>
            </div>

            {/* Tabela de Usuários */}
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Usuários Cadastrados ({usuarios.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-3 rounded-l-xl">Nome</th>
                      <th className="p-3">Login</th>
                      <th className="p-3">Privilégio</th>
                      <th className="p-3 text-right rounded-r-xl">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {usuarios.map(u => (
                      <tr key={u.id} className="hover:bg-slate-750">
                        <td className="p-3 font-semibold text-white">{u.nome}</td>
                        <td className="p-3"><code className="text-cyan-300 bg-slate-900 px-2 py-0.5 rounded">{u.login}</code></td>
                        <td className="p-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
                            {u.role === 'admin' ? '👑 Admin' : '📱 Vendedor'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => handleEditarUsuario(u)} className="p-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-lg transition" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleExcluirUsuario(u.id)} className="p-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 rounded-lg transition" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= PERDAS E NÃO ATENDIDOS ================= */}
        {usuarioLogado.role === 'admin' && activeTab === 'perdas' && (
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
