import { createAdminClient } from "../../supabase/admin";

export async function getExperience(orgId?: string) {
    const supabase = createAdminClient();

    let query = supabase.from("experience").select("*");

    if (orgId) {
        query = query.eq("org_id", orgId);
    }

    const { data, error } = await query.order("description", { ascending: true });

    if (error) {
        console.error("Error al obtener las experiencias:", error);
        return [];
    }

    return data;
}