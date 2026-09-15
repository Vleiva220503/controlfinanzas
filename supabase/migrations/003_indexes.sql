-- ============================================================
-- 003_indexes.sql
-- Índices de rendimiento para consultas frecuentes
-- ============================================================

-- movements: consultas más frecuentes filtradas por mes, tipo, categoría, cuenta
create index if not exists idx_movements_date        on movements(date desc);
create index if not exists idx_movements_month       on movements(month);
create index if not exists idx_movements_type        on movements(type);
create index if not exists idx_movements_category    on movements(category_id);
create index if not exists idx_movements_account     on movements(account_id);
create index if not exists idx_movements_created_by  on movements(created_by);
create index if not exists idx_movements_month_type  on movements(month, type); -- combinado para dashboard

-- transfers
create index if not exists idx_transfers_date          on transfers(date desc);
create index if not exists idx_transfers_from_account  on transfers(from_account_id);
create index if not exists idx_transfers_to_account    on transfers(to_account_id);

-- budgets
create index if not exists idx_budgets_month         on budgets(month);
create index if not exists idx_budgets_category      on budgets(category_id);

-- savings_contributions
create index if not exists idx_savings_contributions_goal  on savings_contributions(goal_id);
create index if not exists idx_savings_contributions_date  on savings_contributions(date desc);

-- attachments
create index if not exists idx_attachments_movement  on attachments(movement_id);

-- movement_tags
create index if not exists idx_movement_tags_tag  on movement_tags(tag_id);

-- recurring_transactions
create index if not exists idx_recurring_active  on recurring_transactions(active) where active = true;
