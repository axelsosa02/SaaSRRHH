import { createClient } from '@/lib/supabase/client'
import { QuickCandidateInput } from '@/types'
import { JobCandidate } from '@/types/ui'
import { KanbanEstado } from '@/types/enums'
// Trae todos los candidatos de un puesto con su estado kanban
export async function getJobCandidates(jobId: string): Promise<JobCandidate[]> {
    const supabase = createClient()

    //hacemos un join entre job_candidates y candidates para traer los datos de los candidatos

    const { data, error } = await supabase
        .from('job_candidates')
        .select(`
            id,
            job_id,
            candidate_id,
            estado,
            orden,
            created_at,
            candidate:candidates (
                id,
                org_id,
                nombre,
                apellido,
                email,
                telefono,
                localidad,
                provincia,
                area,
                experiencie_id,
                availability_id,
                estudios,
                resumen,
                cv_url,
                entrevistado,
                pago_requerido,
                estado_global,
                created_at
            )
        `)
        .eq('job_id', jobId)
        .order('orden', { ascending: true })
        .returns<JobCandidate[]>()

    if (error) throw error

    return data
}

// Mueve un candidato a otra columna y actualiza el orden
export async function moveCandidate(
    jobCandidateId: string,
    nuevoEstado: KanbanEstado,
    nuevoOrden: number
) {
    const supabase = createClient()

    const { error } = await supabase
        .from('job_candidates')
        .update({ estado: nuevoEstado, orden: nuevoOrden })
        .eq('id', jobCandidateId)

    if (error) throw error
}

// Crea un candidato rápido y lo agrega al puesto directamente
export async function addQuickCandidate(
    jobId: string,
    input: QuickCandidateInput
) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    // Obtener org_id del usuario actual
    if (!user) throw new Error('No autenticado')
    console.log('user:', user)

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!profile?.org_id) throw new Error('No se encontró la organización')

    // Crear el candidato
    const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
            org_id: profile.org_id,
            nombre: input.nombre,
            apellido: input.apellido,
            email: input.email,
            telefono: input.telefono || null,
            resumen: input.resumen || null,
            pago_requerido: false,          // cargado por urgencia, sin pago
            estado_global: 'activo',
        })
        .select()
        .single()

    if (candidateError) throw candidateError

    // Obtener el último orden en la columna 'candidato'
    const { data: lastItem } = await supabase
        .from('job_candidates')
        .select('orden')
        .eq('job_id', jobId)
        .eq('estado', 'candidato')
        .order('orden', { ascending: false })
        .limit(1)
        .single()

    const nuevoOrden = lastItem ? lastItem.orden + 1 : 0

    // Vincular al puesto
    const { error: linkError } = await supabase
        .from('job_candidates')
        .insert({
            job_id: jobId,
            candidate_id: candidate.id,
            org_id: profile.org_id,
            estado: 'candidato',
            orden: nuevoOrden,
        })

    if (linkError) throw linkError

    return candidate
}

// Agrega un candidato ya existente a un puesto
export async function linkCandidateToJob(jobId: string, candidateId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    // Obtener org_id del usuario actual
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    const { data: lastItem } = await supabase
        .from('job_candidates')
        .select('orden')
        .eq('job_id', jobId)
        .eq('estado', 'candidato')
        .order('orden', { ascending: false })
        .limit(1)
        .maybeSingle()

    const nuevoOrden = lastItem ? lastItem.orden + 1 : 0

    const { error } = await supabase
        .from('job_candidates')
        .insert({
            job_id: jobId,
            candidate_id: candidateId,
            org_id: profile?.org_id,
            estado: 'candidato',
            orden: nuevoOrden,
        })

    if (error) throw error
}

// Obtiene todos los candidatos de la organización que no están vinculados al puesto actual
export async function getAvailableCandidates(jobId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!profile?.org_id) return []

    // 1. Obtener candidatos que ya están vinculados a este puesto
    const { data: currentLinks, error: linksError } = await supabase
        .from('job_candidates')
        .select('candidate_id')
        .eq('job_id', jobId)

    if (linksError) throw linksError

    const excludedIds = currentLinks?.map(l => l.candidate_id) || []

    // 2. Obtener todos los candidatos de la organización
    let query = supabase
        .from('candidates')
        .select('id, nombre, apellido, email, telefono')
        .eq('org_id', profile.org_id)
        .order('apellido', { ascending: true })

    if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`)
    }

    const { data: candidates, error } = await query

    if (error) throw error
    return candidates
}

// Elimina un candidato de un puesto
export async function removeCandidateFromJob(jobCandidateId: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('job_candidates')
        .delete()
        .eq('id', jobCandidateId)
    if (error) throw error
}
