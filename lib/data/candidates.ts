import { createClientServer } from "@/lib/supabase/server"
import type { CandidateDB } from "@/types/database"
import type { Candidates } from "@/types/ui"

/**
 * Tipo que representa la fila de `candidates` tal como la devuelve Supabase
 * al hacer el join con `areas`, `experience`, `availability` y `candidate_tags`.
 * Los campos relacionales son objetos anidados (o null si no hay relación).
 */
type CandidateRow = CandidateDB & {
    experience: { description: string } | null
    availability: { nombre: string } | null
    candidate_tags: { tag: { nombre: string } | null }[] | null
}

export async function getCandidates(): Promise<Candidates[]> {
    // Creamos la conexión a Supabase
    const supabase = await createClientServer()

    // Petición con joins a las tablas relacionadas
    const { data, error } = await supabase
        .from("candidates")
        .select(`
            *,
            experience:experience(description),
            availability:availability(nombre),
            candidate_tags(tag:tags(nombre))
        `)

    // Si hay error o no hay data, retornamos un array vacío
    if (error || !data) {
        console.error(error)
        return []
    }

    // Mapeamos CandidateRow → Candidates (solo los campos que usa la tabla)
    return (data as CandidateRow[]).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        apellido: c.apellido,
        email: c.email,
        area: c.area ?? "Sin definir",
        experiencia: c.experience?.description ?? "Sin experiencia",
        disponibilidad: c.availability?.nombre ?? "Inmediata",
        localidad: c.localidad ?? "",
        provincia: c.provincia ?? "",
        cv_url: c.cv_url ?? undefined,       // campo correcto para la columna CV
        fechaPostulacion: c.created_at?.split("T")[0] ?? "",
        puesto: "Sin asignar",
        tags: (c.candidate_tags ?? [])
            .map((ct) => ct.tag?.nombre)
            .filter((n): n is string => Boolean(n)),
    }))
}

