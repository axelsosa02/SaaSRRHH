import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/payments/verify'
import { approvePaymentToken } from '@/lib/payments/tokens'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Verifica la firma HMAC-SHA256 enviada por MercadoPago en la cabecera x-signature.
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#bookmark_validaci%C3%B3n_de_la_firma
 *
 * Si MP_WEBHOOK_SECRET no está configurado en las variables de entorno,
 * se omite la verificación (útil en desarrollo).
 */
async function verifyMpSignature(request: NextRequest, rawBody: string): Promise<boolean> {
    const secret = process.env.MP_WEBHOOK_SECRET
    if (!secret) {
        console.warn('[webhook/mp] MP_WEBHOOK_SECRET no configurado — omitiendo verificación de firma')
        return true
    }

    const signatureHeader = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')

    if (!signatureHeader || !requestId) {
        console.error('[webhook/mp] Cabeceras x-signature o x-request-id faltantes')
        return false
    }

    // La cabecera tiene el formato: "ts=...,v1=..."
    const parts = Object.fromEntries(
        signatureHeader.split(',').map(part => {
            const [key, val] = part.split('=')
            return [key.trim(), val.trim()]
        })
    )
    const ts = parts['ts']
    const v1 = parts['v1']

    if (!ts || !v1) {
        console.error('[webhook/mp] Formato de x-signature inválido:', signatureHeader)
        return false
    }

    // El mensaje a firmar es: "id:{data.id};request-id:{x-request-id};ts:{ts};"
    // Extraemos el data.id desde el body para construirlo
    let dataId: string
    try {
        const body = JSON.parse(rawBody)
        dataId = body?.data?.id ?? ''
    } catch {
        return false
    }

    const message = `id:${dataId};request-id:${requestId};ts:${ts};`

    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const msgData = encoder.encode(message)

    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    if (expectedSignature !== v1) {
        console.error('[webhook/mp] Firma HMAC inválida — posible solicitud falsificada')
        return false
    }

    return true
}

/**
 * POST /api/webhooks/mercadopago
 *
 * Mercado Pago llama a este endpoint cuando hay una notificación de pago.
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
    // Leemos el body como texto para poder usarlo en la verificación de firma
    const rawBody = await request.text()

    // ── 1. Verificar firma HMAC ───────────────────────────────────────────────
    const signatureValid = await verifyMpSignature(request, rawBody)
    if (!signatureValid) {
        // Devolvemos 200 para que MP no reintente, pero no procesamos nada
        console.error('[webhook/mp] Solicitud rechazada: firma inválida')
        return NextResponse.json({ received: true })
    }

    try {
        const body = JSON.parse(rawBody)

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

        // ── 2. Obtener el access token de la organización ─────────────────────
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

        // ── 3. Verificar el pago contra la API de MP ──────────────────────────
        const payment = await verifyPayment(paymentId, accessToken)

        console.log('[webhook/mp] Pago recibido:', {
            id: payment.id,
            status: payment.status,
            amount: payment.transactionAmount,
            externalRef: payment.externalReference,
        })

        // ── 4. Si el pago fue aprobado, aprobar el token en la DB ─────────────
        if (payment.isApproved && payment.externalReference) {
            const token = payment.externalReference

            try {
                await approvePaymentToken({
                    token,
                    mpPaymentId: String(payment.id),
                })
                console.log('[webhook/mp] ✅ Token aprobado por webhook:', token)
            } catch (err) {
                // Si ya estaba aprobado (ej: la página de success lo aprobó primero), no es un error
                console.warn('[webhook/mp] No se pudo aprobar token (puede ya estar aprobado):', err)
            }
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
