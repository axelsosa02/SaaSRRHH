// 3️UI TYPES
// Representan joins o datos transformados.
// tablas, cards, kanban, dashboard
// Acá van joins o tipos visuales.

import { CandidateDB } from "./database"
import { KanbanEstado } from "./enums"

// Candidato dentro de un puesto (job_candidates join candidates)
export interface JobCandidate {
    id: string                  // id de job_candidates
    job_id: string
    candidate_id: string
    estado: KanbanEstado
    orden: number
    created_at: string
    candidate: CandidateDB      // join con candidates
}

export type Candidates = {
    id: string
    nombre: string
    apellido: string
    email: string

    area: string
    experiencia: string
    disponibilidad: string

    localidad: string
    provincia?: string

    cv_url?: string
    fechaPostulacion: string
    puesto: string
    tags: string[]

}