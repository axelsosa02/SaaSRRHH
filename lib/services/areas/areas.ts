import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/client";
import { AreaInput } from "@/types/forms";
import { Area } from "@/types/database";

export async function getAreas(orgId?: string): Promise<Area[]> {
    const supabase = createAdminClient()
    let query = supabase.from('areas').select('*')

    if (orgId) {
        query = query.eq('org_id', orgId)
    }

    const { data, error } = await query.order('nombre', { ascending: true })

    if (error) {
        console.error("Error al obtener las áreas:", error);
        return []
    }
    return data || []
}

export async function createArea(data: AreaInput) {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("No se encontró el usuario")

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    const { error } = await supabase.from('areas').insert({
        org_id: profile?.org_id,
        nombre: data.nombre,
    })

    if (error) throw error
}

export async function updateArea(id: string, data: AreaInput) {
    const supabase = createClient()

    const { error } = await supabase.from('areas').update({
        nombre: data.nombre,
    }).eq('id', id)

    if (error) throw error
}

export async function deleteArea(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('areas').delete().eq('id', id)
    if (error) throw error
}
