import { Experience } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { ExperienceInput } from "@/types/forms";

export async function getExperience(): Promise<Experience[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('description', { ascending: true })

    if (error) {
        console.error("Error al obtener las experiencias:", error);
        return []
    }
    return data || []
}

export async function createExperience(data: ExperienceInput) {

    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("No se encontro el usuario");

    const { data: profile } = await supabase
        .from("users")
        .select("org_id")
        .eq("id", userData.user.id)
        .single();

    const { error } = await supabase.from("experience").insert({
        org_id: profile?.org_id,
        description: data.description,
    });

    if (error) throw error;
}

export async function updateExperience(id: string, data: ExperienceInput) {

    const supabase = createClient();

    const { error } = await supabase.from("experience").update({
        description: data.description,
    }).eq("id", id);

    if (error) throw error;
}

export async function deleteExperience(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("experience").delete().eq("id", id);
    if (error) throw error;
}