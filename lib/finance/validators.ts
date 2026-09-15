// lib/finance/validators.ts
// Schemas Zod para validación de formularios y escritura en Supabase

import { z } from 'zod'

// ─── Cuenta ────────────────────────────────────────────────
export const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  type: z.string().min(1, 'El tipo es requerido'),
  icon: z.string().optional(),
  color: z.string().optional(),
  initial_balance: z.coerce
    .number()
    .min(0, 'El saldo inicial no puede ser negativo'),
})

export type AccountFormValues = z.infer<typeof accountSchema>

// ─── Categoría ─────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  type: z.enum(['ingreso', 'gasto']),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

// ─── Método de pago ────────────────────────────────────────
export const paymentMethodSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
})

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>

// ─── Movimiento (ingreso o gasto) ──────────────────────────
export const movementSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripción es requerida').max(200),
  type: z.enum(['ingreso', 'gasto']),
  amount: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0'),
  account_id: z.string().uuid('Selecciona una cuenta').optional().or(z.literal('')),
  category_id: z.string().uuid().optional().or(z.literal('')),
  payment_method_id: z.string().uuid().optional().or(z.literal('')),
  income_type: z.string().optional(),
  expense_type: z.string().optional(),
  notes: z.string().max(500).optional(),
  is_recurring: z.boolean().default(false),
  tag_ids: z.array(z.string().uuid()).optional(),
})

export type MovementFormValues = z.infer<typeof movementSchema>

// ─── Transferencia ─────────────────────────────────────────
export const transferSchema = z
  .object({
    date: z.string().min(1, 'La fecha es requerida'),
    from_account_id: z.string().uuid('Selecciona la cuenta origen'),
    to_account_id: z.string().uuid('Selecciona la cuenta destino'),
    amount: z.coerce
      .number()
      .positive('El monto debe ser mayor a 0'),
    notes: z.string().max(500).optional(),
  })
  .refine(data => data.from_account_id !== data.to_account_id, {
    message: 'Las cuentas origen y destino deben ser diferentes',
    path: ['to_account_id'],
  })

export type TransferFormValues = z.infer<typeof transferSchema>

// ─── Presupuesto ───────────────────────────────────────────
export const budgetSchema = z.object({
  category_id: z.string().uuid('Selecciona una categoría'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM'),
  amount: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0'),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>

// ─── Meta de ahorro ────────────────────────────────────────
export const savingsGoalSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(150),
  target_amount: z.coerce
    .number()
    .positive('El monto objetivo debe ser mayor a 0'),
  target_date: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>

// ─── Aporte a meta ─────────────────────────────────────────
export const savingsContributionSchema = z.object({
  goal_id: z.string().uuid('Selecciona una meta'),
  date: z.string().min(1, 'La fecha es requerida'),
  amount: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0'),
  notes: z.string().max(500).optional(),
})

export type SavingsContributionFormValues = z.infer<typeof savingsContributionSchema>

// ─── Movimiento recurrente ─────────────────────────────────
export const recurringTransactionSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida').max(200),
  type: z.enum(['ingreso', 'gasto']),
  income_type: z.string().optional(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  amount: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0'),
  account_id: z.string().uuid().optional().or(z.literal('')),
  payment_method_id: z.string().uuid().optional().or(z.literal('')),
  frequency: z.enum(['semanal', 'quincenal', 'mensual', 'anual']),
  day_of_month: z.number().int().min(1).max(31).optional(),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional(),
  active: z.boolean().default(true),
})

export type RecurringTransactionFormValues = z.infer<typeof recurringTransactionSchema>

// ─── Configuración ─────────────────────────────────────────
export const appSettingsSchema = z.object({
  currency_code: z.string().min(1).max(10),
  currency_symbol: z.string().min(1).max(10),
  date_format: z.string().min(1),
})

export type AppSettingsFormValues = z.infer<typeof appSettingsSchema>

// ─── Login ─────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z.string().min(1, 'Ingresa tu usuario'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
