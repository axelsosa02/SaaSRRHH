import { createClientServer } from "../../supabase/server";

export async function getAvailability() {
    const supabase = await createClientServer();

    const { data, error } = await supabase
        .from("availability")
        .select("*")
        .order("nombre", { ascending: true });

    if (error) {
        console.error("Error al obtener las disponibilidades:", error);
        return [];
    }

    return data;
}

