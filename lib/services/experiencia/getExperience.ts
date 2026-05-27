import { createClientServer } from "../../supabase/server";

export async function getExperience() {
    const supabase = await createClientServer();

    const { data, error } = await supabase
        .from("experience")
        .select("*")
        .order("description", { ascending: true });

    if (error) {
        console.error("Error al obtener las experiencias:", error);
        return [];
    }

    return data;
}