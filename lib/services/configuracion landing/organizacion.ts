import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { OrgConfig } from '@/types/organizacion'

export type { OrgConfig }

// ── Mutaciones — corren en el browser ────────────────────────────────────────

export async function updateOrgGeneral(data: {
    nombre: string
    email_contacto: string
    whatsapp?: string
    color_primario: string
    color_secundario: string
}) {
    const supabase = createBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    // Validación que elimina la posibilidad de 'undefined':
    if (!profile?.org_id) throw new Error("No se encontró la organización del usuario")

    const { error } = await supabase
        .from('organizations')
        .update({
            nombre: data.nombre,
            email_contacto: data.email_contacto,
            whatsapp: data.whatsapp,
            color_primario: data.color_primario,
            color_secundario: data.color_secundario,
        })
        .eq('id', profile?.org_id)

    if (error) throw error
}

export async function updateOrgEmails(data: {
    mail_bienvenida_asunto: string
    mail_bienvenida: string
    mail_rechazo_asunto: string
    mail_rechazo: string
}) {
    const supabase = createBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    // Validación que elimina la posibilidad de 'undefined':
    if (!profile?.org_id) throw new Error("No se encontró la organización del usuario")

    const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', profile?.org_id)

    if (error) throw error
}

export async function updateOrgPago(cobro_postulacion: boolean, monto_postulacion?: number) {
    const supabase = createBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    // Validación que elimina la posibilidad de 'undefined':
    if (!profile?.org_id) throw new Error("No se encontró la organización del usuario")

    const updateData: { cobro_postulacion: boolean, monto_postulacion?: number } = { cobro_postulacion }
    if (monto_postulacion !== undefined) {
        updateData.monto_postulacion = monto_postulacion
    }

    const { error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', profile?.org_id)

    if (error) throw error
}

export async function updateOrgLogo(file: File): Promise<string> {
    const supabase = createBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    // Validación que elimina la posibilidad de 'undefined':
    if (!profile?.org_id) throw new Error("No se encontró la organización del usuario")

    const ext = file.name.split('.').pop()
    const path = `${profile?.org_id}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)

    const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', profile?.org_id)

    if (updateError) throw updateError

    return urlData.publicUrl
}

/**
 * Sube una imagen de sección a Supabase Storage y retorna la URL pública.
 * No actualiza la DB — el form se encarga de persistir la URL al guardar.
 * @param file  Archivo a subir
 * @param slot  Identificador único del slot (e.g. "servicios_0", "servicios_1")
 */
export async function uploadSectionImage(file: File, slot: string): Promise<string> {
    const supabase = createBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    const ext = file.name.split('.').pop()
    const path = `${profile?.org_id}/sections/${slot}.${ext}`

    const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)

    return urlData.publicUrl
}

export async function updateOrgNavItems(nav_items: string[]) {
    const supabase = createBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    // Validación que elimina la posibilidad de 'undefined':
    if (!profile?.org_id) throw new Error("No se encontró la organización del usuario")

    // 1. Consultamos si el plan permite personalizar la landing
    const { data: org } = await supabase
        .from('organizations')
        .select('plan_id, plans(has_custom_landing)')
        .eq('id', profile?.org_id)
        .single()

    const plan = org?.plans as unknown as { has_custom_landing: boolean } | null

    // 2. Bloqueamos si el plan es Starter
    if (plan && plan.has_custom_landing === false) {
        throw new Error('Tu plan actual no incluye personalización del menú de navegación')
    }

    // 3. Si todo está correcto, actualizamos la base de datos
    const { error } = await supabase
        .from('organizations')
        .update({ nav_items })
        .eq('id', profile?.org_id)

    if (error) throw error
}

