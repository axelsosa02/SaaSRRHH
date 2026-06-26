import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/payments/verify'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/webhooks/mercadopago
 *
 * Mercado Pago llama a este endpoint cuando hay una notificación de pago.
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // MP envía el tipo de notificación, el id del recurso y el user_id de la cuenta de MP destino
        const { type, data, user_id } = body as {
            type: string
            data: { id: string }
            user_id?: string | number
        }

        // Solo nos interesan las notificaciones de tipo "payment"
        if (type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = data?.id
        if (!paymentId) {
            return NextResponse.json({ error: 'payment id faltante' }, { status: 400 })
        }

        // Buscamos el token de la organización basándonos en el user_id de Mercado Pago
        let accessToken: string | undefined
        if (user_id) {
            try {
                const supabase = createAdminClient()
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('mp_access_token')
                    .eq('mp_user_id', String(user_id))
                    .maybeSingle()
                
                if (orgData?.mp_access_token) {
                    accessToken = orgData.mp_access_token
                }
            } catch (err) {
                console.error('[webhook/mp] Error buscando access token de la org:', err)
            }
        }

        // Fallback al token del .env si no se encontró
        if (!accessToken) {
            accessToken = process.env.YOUR_ACCESS_TOKEN
        }

        // Verificamos el pago contra la API de MP usando el token correspondiente
        const payment = await verifyPayment(paymentId, accessToken)

        console.log('[webhook/mp] Pago recibido:', {
            id: payment.id,
            status: payment.status,
            amount: payment.transactionAmount,
            externalRef: payment.externalReference,
        })

        // Si el pago fue aprobado podés disparar lógica adicional acá:
        // - guardar en DB, enviar email de confirmación, etc.
        if (payment.isApproved) {
            // TODO: lógica adicional post-pago (ej: registrar en tabla payment_tokens)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('[webhook/mp] Error procesando notificación:', error)
        // Devolvemos 200 igual para que MP no reintente indefinidamente
        return NextResponse.json({ received: true })
    }
}

/**
 * MP también puede hacer GET al webhook para validar la URL.
 */
export async function GET() {
    return NextResponse.json({ ok: true })
}
