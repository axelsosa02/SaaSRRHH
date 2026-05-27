import { NextRequest, NextResponse } from 'next/server'
import { createPaymentPreference } from '@/lib/payments/preferences'

/**
 * POST /api/mercadopago/create-preference
 *
 * Body: { orgSlug: string, token: string, jobId?: string }
 * Response: { preferenceId, initPoint, sandboxInitPoint }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orgSlug, token, jobId } = body as {
            orgSlug: string
            token: string
            jobId?: string
        }

        if (!orgSlug || typeof orgSlug !== 'string') {
            return NextResponse.json({ error: 'orgSlug es requerido' }, { status: 400 })
        }

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'token es requerido' }, { status: 400 })
        }

        const result = await createPaymentPreference({ orgSlug, token, jobId })

        return NextResponse.json(result)
    } catch (error) {
        console.error('[create-preference] Error:', error)
        return NextResponse.json(
            { error: 'No se pudo crear la preferencia de pago' },
            { status: 500 }
        )
    }
}
