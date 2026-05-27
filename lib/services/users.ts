import { createClientServer } from '@/lib/supabase/server'

export async function getCurrentUserWithOrg() {
    const supabase = await createClientServer()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('users')
        .select('org_id, role')
        .eq('id', user.id)
        .single()

    return {
        user,
        org_id: data?.org_id,
        role: data?.role,
    }
}