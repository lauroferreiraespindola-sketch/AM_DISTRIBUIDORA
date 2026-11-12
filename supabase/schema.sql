-- AM Distribuidora de Água — esquema do banco (Supabase / Postgres)
-- Rode este arquivo inteiro uma vez no SQL Editor do Supabase.

create extension if not exists pgcrypto;

-- ---------- Perfis (gestor / vendedor) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  role text not null default 'vendedor' check (role in ('gestor','vendedor')),
  ativo boolean not null default false,
  created_at timestamptz not null default now()
);

-- O primeiro usuário cadastrado vira gestor ativo. Os demais entram como
-- vendedor inativo, até o gestor liberar na tela de Configurações.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare primeiro boolean;
begin
  primeiro := not exists (select 1 from public.profiles);
  insert into public.profiles (id, nome, role, ativo)
  values (new.id,
          coalesce(nullif(new.raw_user_meta_data->>'nome',''), split_part(new.email,'@',1)),
          case when primeiro then 'gestor' else 'vendedor' end,
          primeiro);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create function public.is_gestor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'gestor' and ativo)
$$;

create function public.is_ativo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ativo)
$$;

-- ---------- Tabelas ----------
create table public.config (
  id int primary key default 1 check (id = 1),
  preco_venda numeric(10,2) not null default 10,
  custo numeric(10,2) not null default 6
);
insert into public.config (id) values (1);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tel text not null default '',
  endereco text not null default '',
  bairro text not null default '',
  qtd int not null default 1 check (qtd > 0),
  dias int[] not null default '{}',          -- 0=Dom ... 6=Sáb
  criado_em date not null default current_date,
  ativo boolean not null default true
);

create table public.entradas (               -- entradas de garrafões e ajustes (quebra, contagem)
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'entrada' check (tipo in ('entrada','ajuste')),
  qtd int not null check (qtd <> 0),
  custo numeric(10,2) not null default 0,
  fornecedor text not null default '',
  motivo text not null default '',
  data date not null default current_date,
  criado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.pedidos (                -- um pedido por cliente por dia
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  data date not null,
  qtd int not null check (qtd > 0),
  valor_unit numeric(10,2) not null default 0,
  nome text not null default '',
  endereco text not null default '',
  bairro text not null default '',
  tel text not null default '',
  obs text not null default '',
  cancelado boolean not null default false,
  created_at timestamptz not null default now(),
  unique (cliente_id, data)
);

create table public.entregas (               -- confirmação do vendedor = saída de estoque + caixa
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  data date not null,
  status text not null check (status in ('entregue','nao_entregue','desfeito')),
  qtd int not null default 0,
  valor numeric(10,2) not null default 0,
  forma text not null default '',
  motivo text not null default '',
  vendedor_id uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (cliente_id, data)
);

create index on public.pedidos (data);
create index on public.entregas (data);

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger entregas_touch before update on public.entregas
for each row execute function public.touch_updated_at();

-- ---------- Estoque ----------
-- Estoque = soma das entradas/ajustes - soma das entregas confirmadas.
create view public.v_estoque as
select
  (select coalesce(sum(qtd),0)::int from public.entradas) as ent,
  (select coalesce(sum(qtd),0)::int from public.entregas where status = 'entregue') as sai;
grant select on public.v_estoque to authenticated;

-- Bloqueia confirmar entrega maior que o estoque disponível.
create function public.checa_estoque() returns trigger
language plpgsql security definer set search_path = public as $$
declare disponivel int;
begin
  if new.status = 'entregue' then
    select coalesce((select sum(qtd) from entradas),0)
         - coalesce((select sum(qtd) from entregas where status = 'entregue' and id is distinct from new.id),0)
      into disponivel;
    if new.qtd > disponivel then
      raise exception 'Estoque insuficiente: restam % garrafões', disponivel;
    end if;
  end if;
  return new;
end $$;
create trigger entregas_estoque before insert or update on public.entregas
for each row execute function public.checa_estoque();

-- ---------- Segurança (RLS) ----------
alter table public.profiles enable row level security;
alter table public.config   enable row level security;
alter table public.clientes enable row level security;
alter table public.entradas enable row level security;
alter table public.pedidos  enable row level security;
alter table public.entregas enable row level security;

-- profiles: cada um lê o próprio; gestor lê e altera todos
create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_gestor());
create policy profiles_update on public.profiles for update using (public.is_gestor()) with check (public.is_gestor());

-- config: usuários ativos leem; só gestor altera
create policy config_select on public.config for select using (public.is_ativo());
create policy config_write  on public.config for all using (public.is_gestor()) with check (public.is_gestor());

-- clientes e entradas: somente gestor
create policy clientes_all on public.clientes for all using (public.is_gestor()) with check (public.is_gestor());
create policy entradas_all on public.entradas for all using (public.is_gestor()) with check (public.is_gestor());

-- pedidos: ativos leem; só gestor cria/edita
create policy pedidos_select on public.pedidos for select using (public.is_ativo());
create policy pedidos_write  on public.pedidos for all using (public.is_gestor()) with check (public.is_gestor());

-- entregas: ativos leem; cada vendedor grava as próprias; gestor altera todas
create policy entregas_select on public.entregas for select using (public.is_ativo());
create policy entregas_insert on public.entregas for insert with check (public.is_ativo() and vendedor_id = auth.uid());
create policy entregas_update on public.entregas for update
  using (public.is_ativo() and (vendedor_id = auth.uid() or public.is_gestor()))
  with check (public.is_ativo() and (vendedor_id = auth.uid() or public.is_gestor()));
create policy entregas_delete on public.entregas for delete using (public.is_gestor());

-- ---------- Tempo real ----------
alter publication supabase_realtime add table public.pedidos, public.entregas, public.entradas, public.clientes, public.config, public.profiles;
