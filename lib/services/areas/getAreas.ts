import { createClientServer } from "../../supabase/server";

export async function getAreas() {
    const supabase = await createClientServer();

    const { data, error } = await supabase
        .from("areas")
        .select("*")
        .order("nombre", { ascending: true });

    if (error) {
        console.error("Error al obtener las áreas:", error);
        return [];
    }

    return data;
}
