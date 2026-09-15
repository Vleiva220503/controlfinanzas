-- ─── Notificaciones ──────────────────────────────────────────
create table if not exists notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users on delete cascade not null,
  title        text not null,
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz default now()
);

-- RLS
alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on notifications for delete
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on notifications for insert
  with check (auth.uid() = user_id);
