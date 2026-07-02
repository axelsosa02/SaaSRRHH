// 3️UI TYPES
// Representan joins o datos transformados.
// tablas, cards, kanban, dashboard
// Acá van joins o tipos visuales.

import { CandidateDB } from "./database"
import { KanbanEstado } from "./enums"

export interface JobCandidate {
    id: string                  // id de job_candidates
    job_id: string
    candidate_id: string
    estado: KanbanEstado
    orden: number | null
    created_at: string | null
    candidate?: CandidateDB      // join con candidates (opcional si no se hace el join)
}

export type Candidates = {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string

    area: string
    experiencia: string
    disponibilidad: string

    localidad: string
    provincia?: string

    resumen?: string
    cv_url?: string
    fechaPostulacion: string
    puesto: string
    tags: string[]
}