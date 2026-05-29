import { NextRequest, NextResponse } from 'next/server'
import { createPaymentPreference } from '@/lib/payments/preferences'
import { getOrgMpAccessToken } from '@/lib/payments/oauth'
import { createClientServer } from '@/lib/supabase/server'

/**
 * POST /api/mercadopago/create-preference
 *
 * Crea una preference de MP usando el access_token de la organización.
 * Body: { orgId: string, orgSlug: string, token: string, jobId?: string }
 * Response: { preferenceId, initPoint, sandboxInitPoint }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orgId, orgSlug, token, jobId } = body as {
            orgId: string
            orgSlug: string
            token: string
            jobId?: string
        }

        if (!orgId || !orgSlug || !token) {
            return NextResponse.json({ error: 'orgId, orgSlug y token son requeridos' }, { status: 400 })
        }

        // Verificamos que la org tenga MP conectado y obtenemos su access token
        // (usando admin client para leer el campo protegido)
        let accessToken: string
        try {
            accessToken = await getOrgMpAccessToken(orgId)
        } catch {
            // Fallback al token del .env para desarrollo/testing sin OAuth configurado
            if (process.env.YOUR_ACCESS_TOKEN) {
                accessToken = process.env.YOUR_ACCESS_TOKEN
            } else {
                return NextResponse.json(
                    { error: 'Esta organización no tiene Mercado Pago configurado' },
                    { status: 422 }
                )
            }
        }

        const result = await createPaymentPreference({ orgSlug, token, accessToken, jobId })

        return NextResponse.json(result)
    } catch (error) {
        console.error('[create-preference] Error:', error)
        return NextResponse.json(
            { error: 'No se pudo crear la preferencia de pago' },
            { status: 500 }
        )
    }
}
