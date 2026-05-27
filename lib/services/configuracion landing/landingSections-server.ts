import { createClientServer } from '@/lib/supabase/server'
import type { SectionMap } from '@/types/landingSections'

// ── Lectura pública — para la landing ────────────────────────────────────────

// Trae todas las secciones de una org por slug (sin login)
export async function getLandingSections(orgId: string): Promise<SectionMap> {
    const supabase = await createClientServer()

    const { data, error } = await supabase
        .from('landing_sections')
        .select('type, content')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('order', { ascending: true })

    if (error) {
        console.error('Error al obtener secciones:', error)
        return {}
    }

    // Convertimos el array en un objeto mapa { hero: {...}, quienes_somos: {...} }
    return Object.fromEntries(
        (data || []).map(s => [s.type, s.content])
    ) as SectionMap
}

// ── Lectura autenticada — para el panel de configuración ─────────────────────

export async function getOrgSections(): Promise<SectionMap> {
    const supabase = await createClientServer()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return {}

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    if (!profile?.org_id) return {}

    const { data, error } = await supabase
        .from('landing_sections')
        .select('type, content')
        .eq('org_id', profile.org_id)
        .order('order', { ascending: true })

    if (error) {
        console.error('Error al obtener secciones:', error)
        return {}
    }

    // Convertimos el array en un objeto mapa { hero: {...}, quienes_somos: {...} }
    return Object.fromEntries(
        (data || []).map(s => [s.type, s.content])
    ) as SectionMap
}
