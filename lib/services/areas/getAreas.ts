import { createAdminClient } from "../../supabase/admin";

export async function getAreas(orgId?: string) {
    const supabase = createAdminClient();

    let query = supabase.from("areas").select("*");

    if (orgId) {
        query = query.eq("org_id", orgId);
    }

    const { data, error } = await query.order("nombre", { ascending: true });

    if (error) {
        console.error("Error al obtener las áreas:", error);
        return [];
    }

    return data;
}
