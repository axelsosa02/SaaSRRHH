import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SectionType, SectionContent } from '@/types/landingSections'

// ── Escritura — upsert de una sección ────────────────────────────────────────

export async function upsertSection(
    type: SectionType,
    content: SectionContent,
    order: number
) {
    const supabase = createBrowserClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    if (!profile?.org_id) throw new Error('No se encontró la organización')

    const { error } = await supabase
        .from('landing_sections')
        .upsert(
            {
                org_id: profile.org_id,
                type,
                content,
                order,
                is_active: true,
            },
            { onConflict: 'org_id,type' }
        )

    if (error) throw error
}

// ── Toggle visibilidad de una sección ────────────────────────────────────────

export async function toggleSection(type: SectionType, is_active: boolean) {
    const supabase = createBrowserClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    const { error } = await supabase
        .from('landing_sections')
        .update({ is_active })
        .eq('org_id', profile?.org_id)
        .eq('type', type)

    if (error) throw error
}