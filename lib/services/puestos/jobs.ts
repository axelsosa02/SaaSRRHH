import { getUser } from "@/actions/auth/getUser";
import { createClient } from "@/lib/supabase/client"
import { Job } from "@/types/database";
import { JobInput } from "@/types/forms";


export async function createJob(data: JobInput) {

    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) throw new Error("No se encontró el usuario")

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    const { error } = await supabase.from('jobs').insert({
        org_id: profile?.org_id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        area: data.area_id,
        modalidad: data.modalidad_id,
        localidad: data.localidad,
        visibility: data.visibility ?? true,
    })

    if (error) throw error
}

export async function updateJob(id: string, data: JobInput) {
    const supabase = createClient()

    const userData = await getUser()

    if (!userData?.id) throw new Error("No se encontró el usuario")

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.id)
        .single()

    const { error } = await supabase.from('jobs').update({
        org_id: profile?.org_id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        area: data.area_id,
        modalidad: data.modalidad_id,
        localidad: data.localidad,
        visibility: data.visibility,
    }).eq('id', id)

    if (error) throw error
}

export async function toggleJobVisibility(id: string, visibility: boolean) {
    const supabase = createClient()
    //hacemos el update de la visibilidad del puesto
    const { error } = await supabase
        .from('jobs')
        .update({ visibility })
        .eq('id', id)

    if (error) throw error
}