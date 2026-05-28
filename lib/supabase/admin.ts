import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase con service_role key.
 * Bypasea todas las políticas RLS — usar SOLO en rutas de servidor (API routes).
 * NUNCA exponer en el cliente (browser).
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        throw new Error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
