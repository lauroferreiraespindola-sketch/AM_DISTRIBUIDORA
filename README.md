# AM Distribuidora de Água Mineral - Aplicação Web & Mobile

Aplicação desenvolvida sob medida para gestão de distribuidoras de água mineral (garrafões de 20 litros).

## Funcionalidades
1. **Controle de Estoque:** Entradas de garrafões de 20L e cálculo automático de valor em R$ e dias de autonomia.
2. **Carteira de Clientes:** Cadastro e monitoramento de consumo médio.
3. **Gestão de Perdas:** Relatório e cálculo de perdas financeiras por falta de atendimento diário e mensal.
4. **Perfis Diferenciados:** 
   - **Gestor / Administrador:** Acesso total a estoque, caixa, emissão de pedidos e relatórios.
   - **Vendedor / Entregador:** Acesso restrito apenas aos pedidos em tempo real no celular, com o botão de confirmação de entrega que atualiza o estoque e alimenta o caixa.

## Como Executar Localmente
1. Instale o [Node.js](https://nodejs.org/).
2. Abra a pasta do projeto no terminal e instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Para gerar a versão de produção (para hospedagem na Vercel, Netlify ou servidor próprio):
   ```bash
   npm run build
   ```
