import { NextRequest, NextResponse } from 'next/server'
import { markTokenAsUsed } from '@/lib/payments/tokens'

/**
 * POST /api/mercadopago/use-token
 *
 * Marca el token de pago como usado después de que el candidato
 * envió su postulación. Evita que el mismo pago sirva dos veces.
 *
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = body as { token: string }

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'token es requerido' }, { status: 400 })
        }

        await markTokenAsUsed(token)

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[use-token] Error:', error)
        // No bloqueamos al candidato si esto falla — el form ya se envió
        return NextResponse.json({ ok: false })
    }
}
