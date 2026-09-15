-- =============================================================
-- 007_per_user_rls.sql
-- Reemplaza políticas compartidas por políticas por propietario
-- Todas las tablas se restringen a auth.uid() = created_by
-- =============================================================

-- ─── 1. ASIGNAR DATOS EXISTENTES A VICTOR ───────────────────
-- Victor: fc42abe4-f5c4-4eee-9f19-bb2fbe896c74

DO $$
DECLARE
  victor_id uuid := 'fc42abe4-f5c4-4eee-9f19-bb2fbe896c74';
BEGIN
  UPDATE accounts             SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE categories           SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE payment_methods      SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE movements            SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE budgets              SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE savings_goals        SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE savings_contributions SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE transfers            SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE tags                 SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE recurring_transactions SET created_by = victor_id WHERE created_by IS NULL;
  UPDATE notifications        SET user_id = victor_id WHERE user_id IS NULL;
  RAISE NOTICE 'Datos existentes asignados a Victor.';
END $$;


-- ─── 2. HACER COLUMNAS created_by NOT NULL ───────────────────
-- Ahora que todos los nulls se han limpiado, hacemos las columnas not null
-- (Por seguridad, primero borramos el default si existía y lo ponemos como auth.uid())

ALTER TABLE accounts              ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE categories            ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE payment_methods       ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE movements             ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE budgets               ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE savings_goals         ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE savings_contributions  ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE transfers             ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE tags                  ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE recurring_transactions ALTER COLUMN created_by SET NOT NULL;


-- ─── 3. REEMPLAZAR POLÍTICAS RLS ────────────────────────────

-- ── accounts ──
DROP POLICY IF EXISTS "authenticated_full_access" ON accounts;
DROP POLICY IF EXISTS "users_select_own" ON accounts;
DROP POLICY IF EXISTS "users_insert_own" ON accounts;
DROP POLICY IF EXISTS "users_update_own" ON accounts;
DROP POLICY IF EXISTS "users_delete_own" ON accounts;

CREATE POLICY "users_select_own" ON accounts FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON accounts FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON accounts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON accounts FOR DELETE USING (auth.uid() = created_by);

-- ── categories ──
DROP POLICY IF EXISTS "authenticated_full_access" ON categories;
DROP POLICY IF EXISTS "users_select_own" ON categories;
DROP POLICY IF EXISTS "users_insert_own" ON categories;
DROP POLICY IF EXISTS "users_update_own" ON categories;
DROP POLICY IF EXISTS "users_delete_own" ON categories;

CREATE POLICY "users_select_own" ON categories FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON categories FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON categories FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON categories FOR DELETE USING (auth.uid() = created_by);

-- ── payment_methods ──
DROP POLICY IF EXISTS "authenticated_full_access" ON payment_methods;
DROP POLICY IF EXISTS "users_select_own" ON payment_methods;
DROP POLICY IF EXISTS "users_insert_own" ON payment_methods;
DROP POLICY IF EXISTS "users_update_own" ON payment_methods;
DROP POLICY IF EXISTS "users_delete_own" ON payment_methods;

CREATE POLICY "users_select_own" ON payment_methods FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON payment_methods FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON payment_methods FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON payment_methods FOR DELETE USING (auth.uid() = created_by);

-- ── movements ──
DROP POLICY IF EXISTS "authenticated_full_access" ON movements;
DROP POLICY IF EXISTS "users_select_own" ON movements;
DROP POLICY IF EXISTS "users_insert_own" ON movements;
DROP POLICY IF EXISTS "users_update_own" ON movements;
DROP POLICY IF EXISTS "users_delete_own" ON movements;

CREATE POLICY "users_select_own" ON movements FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON movements FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON movements FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON movements FOR DELETE USING (auth.uid() = created_by);

-- ── budgets ──
DROP POLICY IF EXISTS "authenticated_full_access" ON budgets;
DROP POLICY IF EXISTS "users_select_own" ON budgets;
DROP POLICY IF EXISTS "users_insert_own" ON budgets;
DROP POLICY IF EXISTS "users_update_own" ON budgets;
DROP POLICY IF EXISTS "users_delete_own" ON budgets;

CREATE POLICY "users_select_own" ON budgets FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON budgets FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON budgets FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON budgets FOR DELETE USING (auth.uid() = created_by);

-- ── savings_goals ──
DROP POLICY IF EXISTS "authenticated_full_access" ON savings_goals;
DROP POLICY IF EXISTS "users_select_own" ON savings_goals;
DROP POLICY IF EXISTS "users_insert_own" ON savings_goals;
DROP POLICY IF EXISTS "users_update_own" ON savings_goals;
DROP POLICY IF EXISTS "users_delete_own" ON savings_goals;

CREATE POLICY "users_select_own" ON savings_goals FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON savings_goals FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON savings_goals FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON savings_goals FOR DELETE USING (auth.uid() = created_by);

-- ── savings_contributions ──
DROP POLICY IF EXISTS "authenticated_full_access" ON savings_contributions;
DROP POLICY IF EXISTS "users_select_own" ON savings_contributions;
DROP POLICY IF EXISTS "users_insert_own" ON savings_contributions;
DROP POLICY IF EXISTS "users_update_own" ON savings_contributions;
DROP POLICY IF EXISTS "users_delete_own" ON savings_contributions;

CREATE POLICY "users_select_own" ON savings_contributions FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON savings_contributions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON savings_contributions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON savings_contributions FOR DELETE USING (auth.uid() = created_by);

-- ── transfers ──
DROP POLICY IF EXISTS "authenticated_full_access" ON transfers;
DROP POLICY IF EXISTS "users_select_own" ON transfers;
DROP POLICY IF EXISTS "users_insert_own" ON transfers;
DROP POLICY IF EXISTS "users_update_own" ON transfers;
DROP POLICY IF EXISTS "users_delete_own" ON transfers;

CREATE POLICY "users_select_own" ON transfers FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON transfers FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON transfers FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON transfers FOR DELETE USING (auth.uid() = created_by);

-- ── tags ──
DROP POLICY IF EXISTS "authenticated_full_access" ON tags;
DROP POLICY IF EXISTS "users_select_own" ON tags;
DROP POLICY IF EXISTS "users_insert_own" ON tags;
DROP POLICY IF EXISTS "users_update_own" ON tags;
DROP POLICY IF EXISTS "users_delete_own" ON tags;

CREATE POLICY "users_select_own" ON tags FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON tags FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON tags FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON tags FOR DELETE USING (auth.uid() = created_by);

-- ── recurring_transactions ──
DROP POLICY IF EXISTS "authenticated_full_access" ON recurring_transactions;
DROP POLICY IF EXISTS "users_select_own" ON recurring_transactions;
DROP POLICY IF EXISTS "users_insert_own" ON recurring_transactions;
DROP POLICY IF EXISTS "users_update_own" ON recurring_transactions;
DROP POLICY IF EXISTS "users_delete_own" ON recurring_transactions;

CREATE POLICY "users_select_own" ON recurring_transactions FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "users_insert_own" ON recurring_transactions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "users_update_own" ON recurring_transactions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "users_delete_own" ON recurring_transactions FOR DELETE USING (auth.uid() = created_by);

-- ── notifications ── (ya tiene user_id de la migración 006)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "users_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ─── Verificación final ──────────────────────────────────────
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('accounts','categories','payment_methods','movements',
                    'budgets','savings_goals','savings_contributions',
                    'transfers','tags','recurring_transactions','notifications')
ORDER BY tablename, cmd;
