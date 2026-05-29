import { NextRequest, NextResponse } from 'next/server'
import { exchangeMpCode, decodeOAuthState } from '@/lib/payments/oauth'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

/**
 * GET /api/mercadopago/oauth/callback
 *
 * MP redirige acá después de que el admin autorizó la conexión.
 * Recibe ?code=xxx&state=yyy, intercambia el code por tokens y guarda en DB.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const redirectBase = `${BASE_URL}/admin/configuracion`

    // El usuario rechazó la autorización en MP
    if (error || !code || !state) {
        console.warn('[mp/callback] OAuth cancelado o error:', error)
        return NextResponse.redirect(`${redirectBase}?mp=cancelled`)
    }

    try {
        // Decodificamos el state para obtener el orgId
        const { orgId } = decodeOAuthState(state)

        // Intercambiamos el code por los tokens y guardamos en DB
        await exchangeMpCode(code, orgId)

        return NextResponse.redirect(`${redirectBase}?mp=connected`)
    } catch (err) {
        console.error('[mp/callback] Error en OAuth:', err)
        return NextResponse.redirect(`${redirectBase}?mp=error`)
    }
}
