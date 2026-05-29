import { NextRequest, NextResponse } from 'next/server'
import { disconnectMp } from '@/lib/payments/oauth'
import { createClientServer } from '@/lib/supabase/server'

/**
 * POST /api/mercadopago/oauth/disconnect
 *
 * Desconecta la cuenta de MP de la organización del usuario autenticado.
 */
export async function POST(_request: NextRequest) {
    try {
        const supabase = await createClientServer()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('users')
            .select('org_id')
            .eq('id', user.id)
            .single()

        if (!profile?.org_id) {
            return NextResponse.json({ error: 'Sin organización' }, { status: 403 })
        }

        await disconnectMp(profile.org_id)

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[mp/disconnect] Error:', error)
        return NextResponse.json({ error: 'Error al desconectar' }, { status: 500 })
    }
}
