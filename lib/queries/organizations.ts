import { createClientServer } from '@/lib/supabase/server'

export async function getOrganizationBySlug(slug: string) {
    const supabase = await createClientServer()

    const { data, error } = await supabase
        .from('organizations')
        .select(`
            *,
            landing_sections (*)
        `)
        .eq('slug', slug)
        .order('order', { foreignTable: 'landing_sections', ascending: true })
        .maybeSingle()

    if (error) {
        console.error('Error fetching organization:', error)
        return null
    }

    return data
}