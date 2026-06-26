import { createClient } from '@/lib/supabase/client'

export type CandidateInput = {
    org_id: string
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
    tags?: string[]
}

export async function createCandidate(input: CandidateInput, jobId?: string) {
    const supabase = createClient()

    // 1. Insertar el candidato
    const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
            org_id: input.org_id,
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

    // Insertar etiquetas si las hay (ahora input.tags son nombres de etiquetas)
    if (input.tags && input.tags.length > 0) {
        // 1. Obtener las etiquetas existentes para esta org que coincidan con los nombres
        const { data: existingTags } = await supabase
            .from('tags')
            .select('id, nombre')
            .eq('org_id', input.org_id)
            .in('nombre', input.tags)

        const existingTagsMap = new Map((existingTags || []).map(t => [t.nombre, t.id]))
        const tagIdsToLink: string[] = []

        // 2. Procesar cada etiqueta
        for (const tagName of input.tags) {
            let tagId = existingTagsMap.get(tagName)

            // Si no existe, crearla
            if (!tagId) {
                const { data: newTag, error: newTagError } = await supabase
                    .from('tags')
                    .insert({ org_id: input.org_id, nombre: tagName })
                    .select('id')
                    .single()

                if (!newTagError && newTag) {
                    tagId = newTag.id
                }
            }

            if (tagId) {
                tagIdsToLink.push(tagId)
            }
        }

        // 3. Vincular al candidato
        if (tagIdsToLink.length > 0) {
            const candidateTags = tagIdsToLink.map(id => ({
                candidate_id: candidate.id,
                tag_id: id,
            }))
            const { error: tagsError } = await supabase
                .from('candidate_tags')
                .insert(candidateTags)

            if (tagsError) throw tagsError
        }
    }

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

export async function updateCandidate(id: string, input: CandidateInput) {
    const supabase = createClient();

    const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .update({
            org_id: input.org_id,
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
        })
        .eq('id', id)
        .select()
        .single()

    if (candidateError) throw candidateError

    // Actualizar etiquetas: eliminar las actuales y luego insertar las nuevas
    await supabase.from('candidate_tags').delete().eq('candidate_id', candidate.id)
    
    if (input.tags && input.tags.length > 0) {
        const { data: existingTags } = await supabase
            .from('tags')
            .select('id, nombre')
            .eq('org_id', input.org_id)
            .in('nombre', input.tags)
            
        const existingTagsMap = new Map((existingTags || []).map(t => [t.nombre, t.id]))
        const tagIdsToLink: string[] = []
        
        for (const tagName of input.tags) {
            let tagId = existingTagsMap.get(tagName)
            if (!tagId) {
                const { data: newTag, error: newTagError } = await supabase
                    .from('tags')
                    .insert({ org_id: input.org_id, nombre: tagName })
                    .select('id')
                    .single()
                    
                if (!newTagError && newTag) tagId = newTag.id
            }
            if (tagId) tagIdsToLink.push(tagId)
        }

        if (tagIdsToLink.length > 0) {
            const candidateTags = tagIdsToLink.map(id => ({
                candidate_id: candidate.id,
                tag_id: id,
            }))
            await supabase.from('candidate_tags').insert(candidateTags)
        }
    }

    return candidate
}
