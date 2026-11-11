# AM Distribuidora de Água

Controle de garrafões de água mineral 20 L: entradas, saídas, estoque, carteira de clientes, pedidos em tempo real para o vendedor, caixa e perdas por não atendimento. Funciona no celular (instalável como app pela tela inicial).

- **Frontend:** React + Vite (hospedado na Vercel)
- **Backend:** Supabase (banco Postgres, login, permissões e tempo real)

## Perfis

| | Gestor | Vendedor |
|---|---|---|
| Entradas e ajustes de estoque | sim | não |
| Clientes, preços e pedidos | sim | não |
| Confirmar entrega (baixa estoque e alimenta o caixa) | sim | sim |
| Ver pedidos do dia em tempo real | sim | sim |
| Painel, perdas e valores em R$ | sim | não |

As permissões são impostas no banco (RLS), não só na tela.

## 1. Criar o banco (Supabase)

1. Crie um projeto em https://supabase.com.
2. Abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute uma vez.
3. Em **Authentication > Providers > Email**, deixe e-mail e senha ligados. Para o vendedor entrar sem confirmar e-mail, desligue "Confirm email" (opcional).
4. Em **Project Settings > API**, copie a **Project URL** e a chave **anon public**.

## 2. Rodar local

```bash
cp .env.example .env     # preencha as duas variáveis
npm install
npm run dev
```

## 3. Subir no GitHub

```bash
git remote add origin https://github.com/SEU-USUARIO/am-agua.git
git branch -M main
git push -u origin main
```

## 4. Publicar na Vercel

1. Em https://vercel.com, **Add New > Project** e importe o repositório.
2. O framework (Vite) é detectado sozinho. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy**. A cada `git push` na `main`, a Vercel publica de novo.
4. No Supabase, em **Authentication > URL Configuration**, coloque a URL da Vercel em **Site URL**.

## 5. Primeiro acesso

- **A primeira conta criada vira gestor** automaticamente. Crie a sua primeiro.
- Os vendedores criam conta pela tela de login e ficam em "Aguardando liberação". O gestor libera em **Configurações (ícone de ajustes) > Equipe**.
- No celular, abra a URL e use "Adicionar à tela inicial".

## Como o sistema calcula

- **Estoque** = entradas e ajustes − entregas confirmadas.
- **Estoque em R$** = estoque × custo médio das entradas (e × preço de venda).
- **Dias de estoque** = estoque ÷ consumo médio diário (garrafões por visita × dias de entrega por semana ÷ 7).
- **Clientes atendidos** = estoque ÷ média de garrafões por visita, limitado ao total de clientes com agenda.
- **Não atendido** = cliente previsto (pedido ou dia de entrega) sem entrega confirmada: marcado como "não entreguei" ou dia já encerrado.
- **Quanto deixei de ganhar** = quantidade não entregue × preço de venda; a margem usa o custo médio.
