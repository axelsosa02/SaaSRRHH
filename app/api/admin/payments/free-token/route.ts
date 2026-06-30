import { NextRequest, NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase/server'
import { createFreeToken } from '@/lib/payments/tokens'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClientServer()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        // Obtener el perfil del usuario para saber su org_id
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('org_id')
            .eq('id', user.id)
            .single()

        if (profileError || !profile?.org_id) {
            return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 })
        }

        // Obtener el slug de la organización para armar el link completo
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('slug')
            .eq('id', profile.org_id)
            .single()

        if (orgError || !org?.slug) {
            return NextResponse.json({ error: 'Error al obtener datos de la organización' }, { status: 404 })
        }

        // Generar el token aprobado sin costo
        const token = await createFreeToken(profile.org_id)

        return NextResponse.json({
            success: true,
            token,
            slug: org.slug,
        })
    } catch (error: any) {
        console.error('Error al generar token gratuito:', error)
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
    }
}
