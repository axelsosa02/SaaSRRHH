import { NextRequest, NextResponse } from 'next/server'
import { getMpOAuthUrl } from '@/lib/payments/oauth'
import { createClientServer } from '@/lib/supabase/server'

/**
 * GET /api/mercadopago/oauth/authorize
 *
 * Redirige al admin al flujo de autorización de Mercado Pago.
 * Solo accesible por usuarios autenticados con un org_id.
 */
export async function GET(_request: NextRequest) {
    const supabase = await createClientServer()

    // Verificamos que el usuario esté autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL!))
    }

    // Obtenemos el org_id del usuario
    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!profile?.org_id) {
        return NextResponse.json({ error: 'Usuario sin organización' }, { status: 403 })
    }

    const oauthUrl = getMpOAuthUrl(profile.org_id)
    return NextResponse.redirect(oauthUrl)
}
