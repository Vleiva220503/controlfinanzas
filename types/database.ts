// types/database.ts
// Tipos TypeScript para todas las tablas de Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MovementType = 'ingreso' | 'gasto'
export type FrequencyType = 'semanal' | 'quincenal' | 'mensual' | 'anual'

export interface Account {
  id: string
  name: string
  type: string
  icon?: string | null
  color?: string | null
  initial_balance: number
  current_balance: number
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  type: MovementType
  color?: string | null
  icon?: string | null
  created_by?: string | null
  created_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  created_by?: string | null
  created_at: string
}

export interface Movement {
  id: string
  date: string
  description: string
  type: MovementType
  income_type?: string | null
  category_id?: string | null
  payment_method_id?: string | null
  expense_type?: string | null
  amount: number
  account_id?: string | null
  month: string
  notes?: string | null
  is_recurring: boolean
  recurring_id?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
  // Joined relations
  category?: Category | null
  payment_method?: PaymentMethod | null
  account?: Account | null
  tags?: Tag[]
  attachments?: Attachment[]
}

export interface Tag {
  id: string
  name: string
  color?: string | null
  created_by?: string | null
  created_at?: string
}

export interface MovementTag {
  movement_id: string
  tag_id: string
}

export interface Attachment {
  id: string
  movement_id: string
  file_path: string
  file_name: string
  file_size?: number | null
  mime_type?: string | null
  uploaded_by?: string | null
  created_at: string
}

export interface Transfer {
  id: string
  date: string
  from_account_id: string
  to_account_id: string
  amount: number
  notes?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
  // Joined
  from_account?: Account | null
  to_account?: Account | null
}

export interface Budget {
  id: string
  category_id: string
  month: string
  amount: number
  created_by?: string | null
  created_at: string
  updated_at: string
  // Joined
  category?: Category | null
  spent?: number // calculado
}

export interface SavingsGoal {
  id: string
  name: string
  target_amount: number
  target_date?: string | null
  icon?: string | null
  color?: string | null
  notes?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
  // Calculados
  total_contributed?: number
  remaining?: number
}

export interface SavingsContribution {
  id: string
  goal_id: string
  date: string
  amount: number
  notes?: string | null
  created_by?: string | null
  created_at: string
  // Joined
  goal?: SavingsGoal | null
}

export interface RecurringTransaction {
  id: string
  description: string
  type: MovementType
  income_type?: string | null
  category_id?: string | null
  amount: number
  account_id?: string | null
  payment_method_id?: string | null
  frequency: FrequencyType
  day_of_month?: number | null
  start_date: string
  end_date?: string | null
  active: boolean
  last_generated_month?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
  // Joined
  category?: Category | null
  account?: Account | null
}

export interface AppSettings {
  id: number
  currency_code: string
  currency_symbol: string
  date_format: string
  theme: string
  updated_at: string
}

// ─── Dashboard stats ────────────────────────────────────────
export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  savings: number
  savingsPercent: number
  availableBalance: number
  totalAccountsBalance: number
  previousMonthIncome: number
  previousMonthExpenses: number
  incomeVariation: number
  expensesVariation: number
}

// ─── Filtros de movimientos ─────────────────────────────────
export interface MovementFilters {
  month?: string
  startDate?: string
  endDate?: string
  type?: MovementType | 'all'
  categoryId?: string
  accountId?: string
  paymentMethodId?: string
  tagId?: string
  search?: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}
