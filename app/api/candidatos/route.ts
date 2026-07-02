import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { input, jobId } = body

        if (!input || !input.org_id) {
            return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
        }

        const supabase = createAdminClient()

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

        if (candidateError) {
            console.error('Error insertando candidato:', candidateError)
            return NextResponse.json({ error: 'Error al registrar candidato' }, { status: 500 })
        }

        // Insertar etiquetas
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

                    if (!newTagError && newTag) {
                        tagId = newTag.id
                    }
                }
                if (tagId) {
                    tagIdsToLink.push(tagId)
                }
            }

            if (tagIdsToLink.length > 0) {
                const candidateTags = tagIdsToLink.map(id => ({
                    candidate_id: candidate.id,
                    tag_id: id,
                }))
                await supabase.from('candidate_tags').insert(candidateTags)
            }
        }

        // 2. Vincular al puesto
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

            if (linkError) {
                console.error('Error vinculando candidato al puesto:', linkError)
                return NextResponse.json({ error: 'Error al vincular candidato al puesto' }, { status: 500 })
            }
        }

        return NextResponse.json({ candidate })
    } catch (err: any) {
        console.error('Error en candidatos API:', err)
        return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
    }
}
