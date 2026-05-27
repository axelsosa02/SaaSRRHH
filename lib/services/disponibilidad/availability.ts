import { createClient } from "@/lib/supabase/client"
import { AreaInput, AvailabilityInput } from "@/types/forms";
import { Availability } from "@/types/database";

export async function getAvailability(): Promise<Availability[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('availability')
        .select('*')
        .order('nombre', { ascending: true })

    if (error) {
        console.error("Error al obtener las disponibilidades:", error);
        return []
    }
    return data || []
}

export async function createAvailability(data: AvailabilityInput) {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("No se encontró el usuario")

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    const { error } = await supabase.from('availability').insert({
        org_id: profile?.org_id,
        nombre: data.nombre,
    })

    if (error) throw error
}

export async function updateAvailability(id: string, data: AvailabilityInput) {
    const supabase = createClient()

    const { error } = await supabase.from('availability').update({
        nombre: data.nombre,
    }).eq('id', id)

    if (error) throw error
}

export async function deleteAvailability(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('availability').delete().eq('id', id)
    if (error) throw error
}
