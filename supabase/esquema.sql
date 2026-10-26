-- PRODUTOS ----
create table if not exists public.produtos (
  id bigint generated always as identity primary key,
  nome text not null,
  codigo_barras text not null,
  preco_venda numeric(12, 2) not null,
  id_categoria bigint not null,
  ativo boolean not null default true
);

alter table public.produtos enable row level security;

drop policy if exists "leitura anonima" on public.produtos;
drop policy if exists "inclusao anonima" on public.produtos;

create policy "leitura anonima" on public.produtos
  for select to anon using (true);
create policy "inclusao anonima" on public.produtos
  for insert to anon with check (true);

-- MOVIMENTACOES ---
create table if not exists public.movimentacoes (
  id bigint generated always as identity primary key,
  id_produto bigint not null,
  quantidade integer not null check (quantidade > 0),
  tipo text not null check (tipo in ('entrada', 'saida')),
  data timestamptz not null default now()
);

alter table public.movimentacoes enable row level security;

drop policy if exists "leitura anonima" on public.movimentacoes;
drop policy if exists "inclusao anonima" on public.movimentacoes;

create policy "leitura anonima" on public.movimentacoes
  for select to anon using (true);
create policy "inclusao anonima" on public.movimentacoes
  for insert to anon with check (true);

-- PRIVILEGIOS DO PAPEL anon (chave publicavel) --
grant usage on schema public to anon;

grant select, insert on public.produtos to anon;
grant usage, select on sequence public.produtos_id_seq to anon;

grant select, insert on public.movimentacoes to anon;
grant usage, select on sequence public.movimentacoes_id_seq to anon;

-- Endurecimento: o papel anon so le e inclui. Sem politica de alteracao ou
-- exclusao a RLS ja impede apagar; o revoke tira tambem o privilegio que o
-- projeto concede por padrao, e a API passa a recusar com 42501.
revoke update, delete on public.produtos from anon;
revoke update, delete on public.movimentacoes from anon;