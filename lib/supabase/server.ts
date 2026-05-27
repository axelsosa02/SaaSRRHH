import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClientServer() {
    const cookieStore = await cookies()

    // Crear un cliente Supabase del servidor con la cookie recién configurada,
    // que podría utilizarse para mantener la sesión del usuario
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet, _headers) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // El método `setAll` se invocó desde un componente de servidor.
                        // Esto se puede ignorar si se cuenta con un proxy que actualiza
                        // las sesiones de los usuarios.
                    }
                },
            },
        }
    )
}