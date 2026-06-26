import { Preference } from 'mercadopago'
import { getMpClient } from './client'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

interface CreatePreferenceOptions {
    /** Slug de la organización */
    orgSlug: string
    /** Token UUID generado en nuestra DB — se usa como external_reference para identificar el pago al volver */
    token: string
    /** Access token de MP de la organización (de la tabla organizations) */
    accessToken: string
    /** ID del puesto al que se postula (opcional) */
    jobId?: string
}

/**
 * Crea una Preference de Mercado Pago para el pago de $7.000 ARS.
 * Usa el access_token de la org → el dinero va a su cuenta de MP.
 */
export async function createPaymentPreference({ orgSlug, token, accessToken, jobId }: CreatePreferenceOptions) {
    // Creamos el cliente con el token de ESTA organización
    const client = getMpClient(accessToken)
    const preference = new Preference(client)

    // URL de retorno: incluye el token para que podamos aprobarlo al volver
    const successUrl = new URL(`/${orgSlug}/pago/success`, BASE_URL)
    successUrl.searchParams.set('token', token)
    if (jobId) successUrl.searchParams.set('job', jobId)

    const failureUrl = new URL(`/${orgSlug}/pago`, BASE_URL)

    // La URL de pending TAMBIÉN apunta a /pago/success con el token,
    // así nuestro código puede verificar el pago y dejar pasar al candidato
    // sin hacerlo esperar (los pagos con tarjeta suelen quedar en "in_process" unos segundos).
    const pendingUrl = new URL(`/${orgSlug}/pago/success`, BASE_URL)
    pendingUrl.searchParams.set('token', token)
    if (jobId) pendingUrl.searchParams.set('job', jobId)

    // auto_return y notification_url solo funcionan con URLs públicas HTTPS.
    // MP rechaza localhost con error 400 "auto_return invalid".
    const isPublicUrl = BASE_URL.startsWith('https://')

    const result = await preference.create({
        body: {
            items: [
                {
                    id: 'gestion-cv',
                    title: 'Servicio de gestión de CV',
                    description: 'Token de acceso al proceso de selección',
                    quantity: 1,
                    unit_price: 7000,
                    currency_id: 'ARS',
                },
            ],
            external_reference: token,
            back_urls: {
                success: successUrl.toString(),
                failure: failureUrl.toString(),
                pending: pendingUrl.toString(),
            },
            // Solo en producción (URL pública HTTPS)
            // Usamos 'all' para que MP auto-redirija en TODOS los estados (approved, pending, etc.)
            ...(isPublicUrl && {
                auto_return: 'all' as const,
                notification_url: `${BASE_URL}/api/webhooks/mercadopago`,
            }),
            statement_descriptor: 'TALENTO RH',
        },
    })

    return {
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point,
    }
}
