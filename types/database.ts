// DB TYPES
// Representan EXACTAMENTE la tabla de Supabase.
// ids, created_at, org_id, relaciones

export interface Area {
    id: string
    org_id: string
    nombre: string
    created_at: string | null
}

export interface Experience {
    id: string
    org_id: string
    description: string
    created_at: string
}

export interface Availability {
    id: string
    org_id: string
    nombre: string
    created_at: string
}

export type CandidateDB = {
    id: string
    org_id: string
    nombre: string
    apellido: string
    email: string
    telefono: string | null
    localidad: string | null
    provincia: string | null
    area: string | null
    experiencie_id: string | null
    availability_id: string | null
    estudios: string | null
    resumen: string | null
    cv_url: string | null
    entrevistado: boolean
    pago_requerido: boolean
    estado_global: string
    created_at: string
}

export interface Job {
    id: string
    titulo: string
    descripcion?: string | null
    area: string
    modalidad: string
    localidad: string
    created_at?: string | null
    visibility: boolean
}

export interface User {
    id: string
    nombre: string
    email: string
    role: string
    avatar_url?: string | null
    phone?: string | null
    created_at?: string | null
    country_code?: string | null
}

// Historial de trabajo
export interface WorkHistory {
    id: string
    candidate_id: string
    org_id: string
    empresa: string
    cargo: string
    localidad?: string
    fecha_inicio: string
    fecha_fin?: string
    actual: boolean
    descripcion?: string
    created_at: string
}

// Educación
export interface Education {
    id: string
    candidate_id: string
    org_id: string
    institucion: string
    titulo: string
    fecha_inicio: string
    fecha_fin?: string
    created_at: string
}

// Evaluación
export interface Evaluation {
    id: string
    candidate_id: string
    job_id?: string
    org_id: string
    notas: string
    created_at: string
    updated_at: string
}

// Nota interna
export interface Note {
    id: string
    candidate_id: string
    org_id: string
    user_id?: string
    contenido: string
    created_at: string
}

// Documento subido
export interface Document {
    id: string
    candidate_id: string
    org_id: string
    nombre: string
    url: string
    tipo: 'cv' | 'certificado' | 'referencia' | 'otro'
    created_at: string
}

// Referencia laboral
export interface Reference {
    id: string
    candidate_id: string
    org_id: string
    nombre: string
    empresa?: string
    cargo?: string
    telefono?: string
    email?: string
    relacion?: string
    created_at: string
}

// Email enviado
export interface EmailRecord {
    id: string
    candidate_id?: string
    org_id: string
    user_id?: string
    asunto: string
    cuerpo: string
    tipo: 'individual' | 'bienvenida' | 'rechazo' | 'masivo'
    enviado: boolean
    enviado_en?: string
    created_at: string
}

// Pago de postulación (tabla payments)
export interface Payment {
    id: string
    org_id: string
    candidate_email: string
    monto: number
    estado: 'pendiente' | 'aprobado' | 'rechazado'
    mp_payment_id: string | null
    token: string
    token_usado: boolean
    created_at: string
}

export interface Tag {
    id: string
    nombre: string
    org_id: string
    color?: string | null
    created_at: string | null
}

export interface CandidateTag {
    id: string
    candidate_id: string
    tag_id: string
    tag?: Tag
}

