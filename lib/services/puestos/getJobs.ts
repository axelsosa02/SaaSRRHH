import { createClient } from "@/lib/supabase/client"
import { Job } from "@/types/database"

export async function getJobs(): Promise<Job[]> {
    const supabase = createClient()

    // Obtener el org_id del usuario actual
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("No se encontró el usuario")

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    if (!profile?.org_id) return []

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false })

    if (error) throw error

    return data as Job[]
}