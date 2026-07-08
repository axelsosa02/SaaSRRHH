import { createAdminClient } from "../supabase/admin";

export async function getTagsByOrg(orgId?: string) {
    const supabase = createAdminClient();

    let query = supabase
        .from("tags")
        .select("*");

    if (orgId) {
        query = query
            .eq("org_id", orgId);
    }

    const { data, error } = await query
        .order("nombre", { ascending: true });

    if (error) {
        console.error("Error al obtener las tags:", error);
        return [];
    }

    return data;
}
