-- ============================================================
-- 004_triggers.sql
-- Trigger: actualización automática de accounts.current_balance
-- Se dispara al INSERT / UPDATE / DELETE en movements y transfers
-- ============================================================

-- ─── Función principal del trigger ─────────────────────────
create or replace function update_account_balance()
returns trigger as $$
declare
  v_account_id  uuid;
  v_amount      numeric(12,2);
  v_type        text;
begin
  -- ── Caso 1: DELETE ────────────────────────────────────────
  if TG_OP = 'DELETE' then

    -- movements
    if TG_TABLE_NAME = 'movements' then
      v_account_id := OLD.account_id;
      if v_account_id is null then return OLD; end if;

      if OLD.type = 'ingreso' then
        update accounts
          set current_balance = current_balance - OLD.amount
          where id = v_account_id;
      else
        update accounts
          set current_balance = current_balance + OLD.amount
          where id = v_account_id;
      end if;

    -- transfers
    elsif TG_TABLE_NAME = 'transfers' then
      update accounts
        set current_balance = current_balance + OLD.amount
        where id = OLD.from_account_id;
      update accounts
        set current_balance = current_balance - OLD.amount
        where id = OLD.to_account_id;
    end if;

    return OLD;

  -- ── Caso 2: INSERT ────────────────────────────────────────
  elsif TG_OP = 'INSERT' then

    if TG_TABLE_NAME = 'movements' then
      v_account_id := NEW.account_id;
      if v_account_id is null then return NEW; end if;

      if NEW.type = 'ingreso' then
        update accounts
          set current_balance = current_balance + NEW.amount
          where id = v_account_id;
      else
        update accounts
          set current_balance = current_balance - NEW.amount
          where id = v_account_id;
      end if;

    elsif TG_TABLE_NAME = 'transfers' then
      update accounts
        set current_balance = current_balance - NEW.amount
        where id = NEW.from_account_id;
      update accounts
        set current_balance = current_balance + NEW.amount
        where id = NEW.to_account_id;
    end if;

    return NEW;

  -- ── Caso 3: UPDATE ────────────────────────────────────────
  elsif TG_OP = 'UPDATE' then

    if TG_TABLE_NAME = 'movements' then
      -- Revertir el efecto del movimiento anterior
      if OLD.account_id is not null then
        if OLD.type = 'ingreso' then
          update accounts
            set current_balance = current_balance - OLD.amount
            where id = OLD.account_id;
        else
          update accounts
            set current_balance = current_balance + OLD.amount
            where id = OLD.account_id;
        end if;
      end if;

      -- Aplicar el efecto del movimiento nuevo
      if NEW.account_id is not null then
        if NEW.type = 'ingreso' then
          update accounts
            set current_balance = current_balance + NEW.amount
            where id = NEW.account_id;
        else
          update accounts
            set current_balance = current_balance - NEW.amount
            where id = NEW.account_id;
        end if;
      end if;

    elsif TG_TABLE_NAME = 'transfers' then
      -- Revertir transferencia anterior
      update accounts
        set current_balance = current_balance + OLD.amount
        where id = OLD.from_account_id;
      update accounts
        set current_balance = current_balance - OLD.amount
        where id = OLD.to_account_id;

      -- Aplicar transferencia nueva
      update accounts
        set current_balance = current_balance - NEW.amount
        where id = NEW.from_account_id;
      update accounts
        set current_balance = current_balance + NEW.amount
        where id = NEW.to_account_id;
    end if;

    return NEW;
  end if;

  return null;
end;
$$ language plpgsql security definer;

-- ─── Trigger en movements ───────────────────────────────────
create trigger trg_movements_balance
  after insert or update or delete on movements
  for each row execute function update_account_balance();

-- ─── Trigger en transfers ───────────────────────────────────
create trigger trg_transfers_balance
  after insert or update or delete on transfers
  for each row execute function update_account_balance();

-- ─── Trigger para calcular 'month' en movements ────────────
create or replace function set_movement_month()
returns trigger as $$
begin
  NEW.month := to_char(NEW.date, 'YYYY-MM');
  return NEW;
end;
$$ language plpgsql;

create trigger trg_set_movement_month
  before insert or update on movements
  for each row execute function set_movement_month();



-- ============================================================
-- Función de recálculo completo (útil para corrección de datos)
-- Uso: SELECT recalculate_all_balances();
-- ============================================================
create or replace function recalculate_all_balances()
returns void as $$
declare
  acc record;
  v_ingresos   numeric(12,2);
  v_gastos     numeric(12,2);
  v_salidas    numeric(12,2);
  v_entradas   numeric(12,2);
begin
  for acc in select id, initial_balance from accounts loop
    -- Ingresos directos en esta cuenta
    select coalesce(sum(amount), 0) into v_ingresos
      from movements
      where account_id = acc.id and type = 'ingreso';

    -- Gastos directos en esta cuenta
    select coalesce(sum(amount), 0) into v_gastos
      from movements
      where account_id = acc.id and type = 'gasto';

    -- Transferencias salientes
    select coalesce(sum(amount), 0) into v_salidas
      from transfers
      where from_account_id = acc.id;

    -- Transferencias entrantes
    select coalesce(sum(amount), 0) into v_entradas
      from transfers
      where to_account_id = acc.id;

    update accounts
      set current_balance = acc.initial_balance + v_ingresos - v_gastos - v_salidas + v_entradas
      where id = acc.id;
  end loop;
end;
$$ language plpgsql security definer;
