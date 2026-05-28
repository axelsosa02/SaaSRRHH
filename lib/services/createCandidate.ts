import { createClient } from '@/lib/supabase/client'

export type CandidateInput = {
    org_id: string
    user_id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string
    resumen?: string
    cv_url?: string
    area: string
    disponibilidad: string
    experiencia: string
    localidad: string
    provincia: string
}

export async function createCandidate(input: CandidateInput, jobId?: string) {
    const supabase = createClient()

    // 1. Insertar el candidato
    const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
            org_id: input.org_id,
            user_id: input.user_id,
            nombre: input.nombre,
            apellido: input.apellido,
            email: input.email,
            telefono: input.telefono || null,
            resumen: input.resumen || null,
            cv_url: input.cv_url || null,
            area: input.area || null,
            availability_id: input.disponibilidad || null,
            experiencie_id: input.experiencia || null,
            localidad: input.localidad || null,
            provincia: input.provincia || null,
            estado_global: 'activo',
            pago_requerido: false
        })
        .select()
        .single()

    if (candidateError) throw candidateError

    // 2. Si hay un jobId, vincularlo al puesto en la tabla job_candidates
    if (jobId) {
        const { data: lastItem } = await supabase
            .from('job_candidates')
            .select('orden')
            .eq('job_id', jobId)
            .eq('estado', 'candidato')
            .order('orden', { ascending: false })
            .limit(1)
            .maybeSingle()

        const nuevoOrden = lastItem ? lastItem.orden + 1 : 0

        const { error: linkError } = await supabase
            .from('job_candidates')
            .insert({
                job_id: jobId,
                candidate_id: candidate.id,
                org_id: input.org_id,
                estado: 'candidato',
                orden: nuevoOrden,
            })

        if (linkError) throw linkError
    }

    return candidate
}
