import { createClientServer } from "@/lib/supabase/server"
import type { Tag } from "@/types/database"

/**
 * Obtiene todas las etiquetas de la organización del usuario actual.
 * Usa el cliente server-side de Supabase (apto para Server Components).
 */
export async function getTags(): Promise<Tag[]> {
    const supabase = await createClientServer()

    const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("nombre", { ascending: true })

    if (error) {
        console.error("Error al obtener las etiquetas:", error)
        return []
    }

    return data as Tag[]
}
