'use server'

import { createClientServer } from '@/lib/supabase/server'

export async function updateProfile(values: {
    id: string;
    nombre: string,
    phone: string | null,
    country_code: string | null,
}) {
    const supabase = await createClientServer()

    const { error } = await supabase.from('users').update({
        nombre: values.nombre,
        phone: values.phone,
        country_code: values.country_code,
        updated_at: new Date().toISOString(),
    }).eq('id', values.id)

    if (error) {
        console.log(error)
        throw new Error('Error al actualizar el perfil', { cause: error.message })
    }

    return { success: true }
}