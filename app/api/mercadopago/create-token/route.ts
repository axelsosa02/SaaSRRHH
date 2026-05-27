import { NextRequest, NextResponse } from 'next/server'
import { createPendingPayment } from '@/lib/payments/tokens'

/**
 * POST /api/mercadopago/create-token
 *
 * Crea un pago pendiente en la tabla `payments` y devuelve el token.
 * Body: { orgId: string }
 * Response: { token: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orgId } = body as { orgId: string }

        if (!orgId || typeof orgId !== 'string') {
            return NextResponse.json({ error: 'orgId es requerido' }, { status: 400 })
        }

        const token = await createPendingPayment({ orgId })

        return NextResponse.json({ token })
    } catch (error) {
        console.error('[create-token] Error:', error)
        return NextResponse.json(
            { error: 'No se pudo crear el token de pago' },
            { status: 500 }
        )
    }
}
