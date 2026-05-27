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

    const { error } = await supabase
        .from('organizations')
        .update(data)
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
