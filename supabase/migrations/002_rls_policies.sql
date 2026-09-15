-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security — Acceso completo solo a usuarios autenticados
-- jade y victor comparten todos los datos (finanza familiar)
-- ============================================================

-- ─── Habilitar RLS en todas las tablas ─────────────────────
alter table accounts              enable row level security;
alter table categories            enable row level security;
alter table payment_methods       enable row level security;
alter table movements             enable row level security;
alter table tags                  enable row level security;
alter table movement_tags         enable row level security;
alter table attachments           enable row level security;
alter table transfers             enable row level security;
alter table budgets               enable row level security;
alter table savings_goals         enable row level security;
alter table savings_contributions enable row level security;
alter table recurring_transactions enable row level security;
alter table app_settings          enable row level security;

-- ─── Políticas: acceso total a usuarios autenticados ───────
-- accounts
create policy "authenticated_full_access" on accounts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- categories
create policy "authenticated_full_access" on categories
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- payment_methods
create policy "authenticated_full_access" on payment_methods
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- movements
create policy "authenticated_full_access" on movements
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- tags
create policy "authenticated_full_access" on tags
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- movement_tags
create policy "authenticated_full_access" on movement_tags
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- attachments
create policy "authenticated_full_access" on attachments
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- transfers
create policy "authenticated_full_access" on transfers
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- budgets
create policy "authenticated_full_access" on budgets
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- savings_goals
create policy "authenticated_full_access" on savings_goals
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- savings_contributions
create policy "authenticated_full_access" on savings_contributions
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- recurring_transactions
create policy "authenticated_full_access" on recurring_transactions
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- app_settings (solo lectura para todos, escritura solo autenticados)
create policy "authenticated_full_access" on app_settings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── Storage: Bucket "receipts" para comprobantes ──────────
-- Ejecutar esto en el Dashboard de Supabase > Storage > Buckets
-- o via API. Se incluye como referencia:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
-- create policy "authenticated_upload" on storage.objects
--   for insert with check (auth.role() = 'authenticated' and bucket_id = 'receipts');
-- create policy "authenticated_read" on storage.objects
--   for select using (auth.role() = 'authenticated' and bucket_id = 'receipts');
-- create policy "authenticated_delete" on storage.objects
--   for delete using (auth.role() = 'authenticated' and bucket_id = 'receipts');
