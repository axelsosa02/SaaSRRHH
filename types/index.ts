export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

// Para crear un candidato rápido desde el Kanban
export interface QuickCandidateInput {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    resumen?: string
}

