import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/payments/verify'

/**
 * POST /api/webhooks/mercadopago
 *
 * Mercado Pago llama a este endpoint cuando hay una notificación de pago.
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // MP envía el tipo de notificación y el id del recurso
        const { type, data } = body as {
            type: string
            data: { id: string }
        }

        // Solo nos interesan las notificaciones de tipo "payment"
        if (type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = data?.id
        if (!paymentId) {
            return NextResponse.json({ error: 'payment id faltante' }, { status: 400 })
        }

        // Verificamos el pago contra la API de MP
        const payment = await verifyPayment(paymentId)

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
