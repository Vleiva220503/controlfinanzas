'use client'
// app/(auth)/login/page.tsx
// Login page — solo pide "usuario" y "contraseña"
// Mapea internamente el usuario al email de Supabase Auth

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, TrendingUp, Lock, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { clearQueryCache } from '@/components/providers/QueryProvider'
import { loginSchema, type LoginFormValues } from '@/lib/finance/validators'
import { usernameToEmail } from '@/lib/finance/formatters'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)

    const email = usernameToEmail(data.username)
    if (!email) {
      toast.error('Usuario no reconocido. Usa "jade", "victor".')
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    
    // Clear React Query cache BEFORE signing in
    clearQueryCache()
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: data.password,
    })

    if (error) {
      toast.error('Usuario o contraseña incorrectos.')
      setIsLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--background)' }}>

      {/* Background decorative gradient */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent)',
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[400px] fade-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'clamp(1.75rem, 5vw, 2.5rem)',
        }}
      >
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent)' }}
          >
            <TrendingUp size={28} color="white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Control de Finanzas
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
              Acceso privado
            </p>
          </div>
        </div>


        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

          {/* Username */}
          <div className="field">
            <label htmlFor="username" className="label">
              Usuario
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left"><User size={17} /></span>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="jade o victor"
                className={cn('input', errors.username && 'border-negative focus:border-negative')}
                {...register('username')}
                style={{
                  borderColor: errors.username ? 'var(--negative)' : undefined,
                }}
              />
            </div>
            {errors.username && (
              <span className="field-error">{errors.username.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="field">
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <span className="input-icon-left"><Lock size={17} /></span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn('input', errors.password && 'border-negative')}
                style={{
                  paddingRight: '2.75rem',
                  borderColor: errors.password ? 'var(--negative)' : undefined,
                }}
                {...register('password')}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-subtle)', lineHeight: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full mt-1"
            style={{ fontSize: '1rem', fontWeight: 600 }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ingresando…
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--foreground-subtle)' }}>
          Acceso restringido a usuarios autorizados
        </p>
      </div>
    </div>
  )
}
