import { createClient } from "@/lib/supabase/client"
import { Job } from "@/types/database"

export async function getJobs(): Promise<Job[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error

    return data as Job[]
}