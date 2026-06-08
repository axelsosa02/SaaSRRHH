import { createClient } from '@/lib/supabase/client'
import { WorkHistory, Education, Evaluation, Note, Document, Reference } from '@/types/database'
import { Tag, CandidateTag } from '@/types/database'

// ─── EXPERIENCIA ─────────────────────────────────────────────────────────────

export async function getWorkHistory(candidateId: string): Promise<WorkHistory[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('work_history')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('fecha_inicio', { ascending: false })
    if (error) throw error
    return data as WorkHistory[]
}

export async function addWorkHistory(candidateId: string, input: Omit<WorkHistory, 'id' | 'candidate_id' | 'org_id' | 'created_at'>) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')
    const { data: profile } = await supabase.from('users').select('org_id').eq('id', userData.user.id).single()
    console.log('el usuario es:', profile?.org_id)
    const { error } = await supabase.from('work_history').insert({
        candidate_id: candidateId,
        org_id: profile?.org_id,
        ...input,
    })
    if (error) throw error
    console.error(error)
}

export async function deleteWorkHistory(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('work_history').delete().eq('id', id)
    if (error) throw error
}

// ─── EDUCACIÓN ───────────────────────────────────────────────────────────────

export async function getEducation(candidateId: string): Promise<Education[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('fecha_inicio', { ascending: false })
    if (error) throw error
    return data as Education[]
}

export async function addEducation(candidateId: string, input: Omit<Education, 'id' | 'candidate_id' | 'org_id' | 'created_at'>) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')
    const { data: profile } = await supabase.from('users').select('org_id').eq('id', userData.user.id).single()

    const { error } = await supabase.from('education').insert({
        candidate_id: candidateId,
        org_id: profile?.org_id,
        ...input,
    })
    if (error) throw error
}

// ─── EVALUACIÓN ──────────────────────────────────────────────────────────────

export async function getEvaluation(candidateId: string, jobId?: string): Promise<Evaluation | null> {
    const supabase = createClient()
    let query = supabase
        .from('evaluations')
        .select('*')
        .eq('candidate_id', candidateId)

    if (jobId) query = query.eq('job_id', jobId)

    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return data as Evaluation | null
}

export async function upsertEvaluation(candidateId: string, notas: string, jobId?: string) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')
    const { data: profile } = await supabase.from('users').select('org_id').eq('id', userData.user.id).single()

    const { error } = await supabase.from('evaluations').upsert({
        candidate_id: candidateId,
        org_id: profile?.org_id,
        job_id: jobId || null,
        notas,
        updated_at: new Date().toISOString(),
    }, {
        onConflict: 'candidate_id,job_id',
    })
    if (error) throw error
}

// ─── NOTAS ───────────────────────────────────────────────────────────────────

export async function getNotes(candidateId: string): Promise<Note[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data as Note[]
}

export async function addNote(candidateId: string, contenido: string) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')
    const { data: profile } = await supabase.from('users').select('org_id').eq('id', userData.user.id).single()

    const { error } = await supabase.from('notes').insert({
        candidate_id: candidateId,
        org_id: profile?.org_id,
        user_id: userData.user.id,
        contenido,
    })
    if (error) throw error
}

// ─── DOCUMENTOS ──────────────────────────────────────────────────────────────

export async function getDocuments(candidateId: string): Promise<Document[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data as Document[]
}

export async function uploadDocument(
    candidateId: string,
    file: File,
    tipo: Document['tipo'] = 'otro'
) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')
    const { data: profile } = await supabase.from('users').select('org_id').eq('id', userData.user.id).single()

    const ext = file.name.split('.').pop()
    const path = `${profile?.org_id}/${candidateId}/${Date.now()}.${ext}`

    // Subir el archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file)

    if (uploadError) throw uploadError

    // Obtener la URL pública
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)

    // Guardar referencia en la tabla documents
    const { error: dbError } = await supabase.from('documents').insert({
        candidate_id: candidateId,
        org_id: profile?.org_id,
        nombre: file.name,
        url: urlData.publicUrl,
        tipo,
    })

    if (dbError) throw dbError
}

export async function deleteDocument(id: string, url: string) {
    const supabase = createClient()

    // Extraer el path del storage desde la URL
    const path = url.split('/documents/')[1]
    if (path) {
        await supabase.storage.from('documents').remove([path])
    }

    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (error) throw error
}

// ─── REFERENCIAS ─────────────────────────────────────────────────────────────

export async function getReferences(candidateId: string): Promise<Reference[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('referencesjobs')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data as Reference[]
}

export async function addReference(candidateId: string, input: Omit<Reference, 'id' | 'candidate_id' | 'org_id' | 'created_at'>) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')
    const { data: profile } = await supabase.from('users').select('org_id').eq('id', userData.user.id).single()

    const { error } = await supabase.from('referencesjobs').insert({
        candidate_id: candidateId,
        org_id: profile?.org_id,
        ...input,
    })
    if (error) throw error
}

export async function deleteReference(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('referencesjobs').delete().eq('id', id)
    if (error) throw error
}

/** Obtiene todas las etiquetas de la organización */
export async function getOrgTags(): Promise<Tag[]> {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')
    const { data: profile } = await supabase.from('users').select('org_id').eq('id', userData.user.id).single()

    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('org_id', profile?.org_id)
        .order('nombre', { ascending: true })
    if (error) throw error
    return data as Tag[]
}

/** Obtiene las etiquetas asignadas a un candidato (con join a tags) */
export async function getCandidateTags(candidateId: string): Promise<CandidateTag[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('candidate_tags')
        .select('*, tag:tags(*)')
        .eq('candidate_id', candidateId)
    if (error) throw error
    return data as CandidateTag[]
}

/** Crea una nueva etiqueta en la organización */
export async function createTag(nombre: string): Promise<Tag> {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')
    const { data: profile } = await supabase.from('users').select('org_id').eq('id', userData.user.id).single()

    const { data, error } = await supabase
        .from('tags')
        .insert({ nombre, org_id: profile?.org_id })
        .select()
        .single()
    if (error) throw error
    return data as Tag
}

/** Asigna una etiqueta existente a un candidato */
export async function assignTagToCandidate(candidateId: string, tagId: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('candidate_tags')
        .insert({ candidate_id: candidateId, tag_id: tagId })
    if (error) throw error
}

/** Quita una etiqueta de un candidato */
export async function removeTagFromCandidate(candidateTagId: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('candidate_tags')
        .delete()
        .eq('id', candidateTagId)
    if (error) throw error
}