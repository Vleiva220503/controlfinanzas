-- ============================================================
-- 001_initial_schema.sql
-- Control de Finanzas — Esquema inicial
-- Tabla movements unificada (ingresos + gastos en una tabla)
-- ============================================================

-- ─── Cuentas ───────────────────────────────────────────────
create table if not exists accounts (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  type             text not null, -- efectivo, banco, tarjeta, ahorro, etc.
  icon             text,          -- nombre de ícono Lucide (opcional)
  color            text,          -- hex color (opcional)
  initial_balance  numeric(12,2) not null default 0,
  current_balance  numeric(12,2) not null default 0,
  created_by       uuid references auth.users on delete set null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─── Categorías ────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('ingreso','gasto')),
  color       text,
  icon        text,
  created_by  uuid references auth.users on delete set null,
  created_at  timestamptz default now()
);

-- ─── Métodos de pago ───────────────────────────────────────
create table if not exists payment_methods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid references auth.users on delete set null,
  created_at  timestamptz default now()
);

-- ─── Movimientos (tabla unificada: ingresos + gastos) ──────
create table if not exists movements (
  id                uuid primary key default gen_random_uuid(),
  date              date not null,
  description       text not null,
  type              text not null check (type in ('ingreso','gasto')),
  -- Campos de ingreso
  income_type       text,          -- salario, bono, comision, adicional, etc.
  -- Campos de gasto
  category_id       uuid references categories on delete set null,
  payment_method_id uuid references payment_methods on delete set null,
  expense_type      text,          -- fijo, variable, etc.
  -- Campos compartidos
  amount            numeric(12,2) not null check (amount > 0),
  account_id        uuid references accounts on delete set null,
  month             text not null, -- se calculará via trigger o frontend ('YYYY-MM')
  notes             text,
  is_recurring      boolean not null default false,
  recurring_id      uuid,          -- referencia a recurring_transactions (FK circular, se añade después)
  created_by        uuid references auth.users on delete set null,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ─── Etiquetas (tags) ──────────────────────────────────────
create table if not exists tags (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  color       text,
  created_by  uuid references auth.users on delete set null,
  created_at  timestamptz default now()
);

-- ─── Relación movimientos ↔ etiquetas ─────────────────────
create table if not exists movement_tags (
  movement_id  uuid references movements on delete cascade,
  tag_id       uuid references tags on delete cascade,
  primary key (movement_id, tag_id)
);

-- ─── Adjuntos / Recibos ────────────────────────────────────
create table if not exists attachments (
  id           uuid primary key default gen_random_uuid(),
  movement_id  uuid references movements on delete cascade not null,
  file_path    text not null,   -- ruta dentro del bucket de Supabase Storage
  file_name    text not null,
  file_size    bigint,          -- bytes
  mime_type    text,
  uploaded_by  uuid references auth.users on delete set null,
  created_at   timestamptz default now()
);

-- ─── Transferencias entre cuentas ──────────────────────────
create table if not exists transfers (
  id              uuid primary key default gen_random_uuid(),
  date            date not null,
  from_account_id uuid references accounts on delete set null not null,
  to_account_id   uuid references accounts on delete set null not null,
  amount          numeric(12,2) not null check (amount > 0),
  notes           text,
  created_by      uuid references auth.users on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── Presupuestos mensuales por categoría ──────────────────
create table if not exists budgets (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references categories on delete cascade not null,
  month        text not null,          -- formato 'YYYY-MM'
  amount       numeric(12,2) not null check (amount > 0),
  created_by   uuid references auth.users on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (category_id, month)          -- un presupuesto por categoría por mes
);

-- ─── Metas de ahorro ───────────────────────────────────────
create table if not exists savings_goals (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  target_amount  numeric(12,2) not null check (target_amount > 0),
  target_date    date,
  icon           text,
  color          text,
  notes          text,
  created_by     uuid references auth.users on delete set null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── Aportes a metas de ahorro ─────────────────────────────
create table if not exists savings_contributions (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid references savings_goals on delete cascade not null,
  date        date not null,
  amount      numeric(12,2) not null check (amount > 0),
  notes       text,
  created_by  uuid references auth.users on delete set null,
  created_at  timestamptz default now()
);

-- ─── Movimientos recurrentes ───────────────────────────────
create table if not exists recurring_transactions (
  id           uuid primary key default gen_random_uuid(),
  description  text not null,
  type         text not null check (type in ('ingreso','gasto')),
  income_type  text,
  category_id  uuid references categories on delete set null,
  amount       numeric(12,2) not null check (amount > 0),
  account_id   uuid references accounts on delete set null,
  payment_method_id uuid references payment_methods on delete set null,
  frequency    text not null check (frequency in ('semanal','quincenal','mensual','anual')),
  day_of_month int check (day_of_month between 1 and 31),
  start_date   date not null,
  end_date     date,               -- null = indefinido
  active       boolean not null default true,
  last_generated_month text,       -- último mes en que se generó el movimiento (YYYY-MM)
  created_by   uuid references auth.users on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Ahora sí añadimos la FK circular de movements → recurring_transactions
alter table movements
  add constraint fk_movements_recurring
  foreign key (recurring_id) references recurring_transactions(id) on delete set null;

-- ─── Configuración general de la app ───────────────────────
create table if not exists app_settings (
  id               int primary key default 1,
  currency_code    text not null default 'NIO',
  currency_symbol  text not null default 'C$',
  date_format      text not null default 'DD/MM/YYYY',
  theme            text not null default 'light',
  updated_at       timestamptz default now(),
  constraint single_row check (id = 1)
);

-- Insertar fila única de configuración por defecto
insert into app_settings (id) values (1) on conflict (id) do nothing;

-- ─── Función para updated_at automático ────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers de updated_at
create trigger trg_accounts_updated_at
  before update on accounts
  for each row execute function update_updated_at_column();

create trigger trg_movements_updated_at
  before update on movements
  for each row execute function update_updated_at_column();

create trigger trg_transfers_updated_at
  before update on transfers
  for each row execute function update_updated_at_column();

create trigger trg_budgets_updated_at
  before update on budgets
  for each row execute function update_updated_at_column();

create trigger trg_savings_goals_updated_at
  before update on savings_goals
  for each row execute function update_updated_at_column();

create trigger trg_recurring_updated_at
  before update on recurring_transactions
  for each row execute function update_updated_at_column();
