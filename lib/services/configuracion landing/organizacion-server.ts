import { createClientServer } from '@/lib/supabase/server'
import type { OrgConfig } from '@/types/organizacion'

export async function getOrgConfig(): Promise<OrgConfig | null> {
    const supabase = await createClientServer()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return null

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    if (!profile?.org_id) return null

    const { data, error } = await supabase
        .from('organizations')
        .select(`
            id,
            slug,
            nombre,
            logo_url,
            color_primario,
            color_secundario,
            email_contacto,
            whatsapp,
            mail_bienvenida_asunto,
            mail_bienvenida,
            mail_rechazo_asunto,
            mail_rechazo
        `)
        .eq('id', profile.org_id)
        .single()

    if (error) {
        console.error('Error al obtener la organización:', error)
        return null
    }

    return data as OrgConfig
}
