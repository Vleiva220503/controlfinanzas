// create-user.js
// Script de utilidad para registrar un nuevo usuario en Supabase Auth
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Cargar variables de entorno desde .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Faltan las variables de entorno de Supabase en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createUser() {
  const email = 'sol@localfinance.app'
  const password = '22052005' // La contraseña solicitada

  console.log(`Intentando crear el usuario con email: ${email}...`)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error al crear el usuario:', error.message)
    return
  }

  console.log('✅ Usuario creado exitosamente.')
  console.log('ID del usuario:', data.user?.id)
  console.log('NOTA: Si tienes confirmación de email activada en Supabase, el usuario no podrá iniciar sesión hasta confirmar su email.')
  console.log('Puedes desactivar la confirmación de email en el panel de Supabase: Authentication -> Providers -> Email -> Confirm email.')
}

createUser()
