"use server"

import { createClientServer } from "@/lib/supabase/server";
import type { User } from "@/types/database";

export const getUser = async (): Promise<User | null> => {

    try {
        const supabase = await createClientServer()

        const { data: { user: session } } = await supabase.auth.getUser()

        if (!session) {
            console.log('No se encontro el usuario')
            return null
        }

        const userId = session.id

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError) {
            console.error('Error al obtener el usuario:', userError)
            return null
        }

        return user

    } catch (error) {
        console.error('Error al obtener el usuario:', error)
        return null
    }


}