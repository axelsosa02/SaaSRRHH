import { createClientServer } from '@/lib/supabase/server'

export async function getActiveJobsByOrg(orgId: string) {
    const supabase = await createClientServer()

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('org_id', orgId)
        .eq('visibility', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
        return []
    }

    return data
}

export async function getJobById(id: string) {
    const supabase = await createClientServer()

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching job:', error)
        return null
    }

    return data
}
