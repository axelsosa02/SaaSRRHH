import { Preference } from 'mercadopago'
import { mpClient } from './client'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

interface CreatePreferenceOptions {
    /** Slug de la organización */
    orgSlug: string
    /** Token UUID generado en nuestra DB — se usa como external_reference para identificar el pago al volver */
    token: string
    /** ID del puesto al que se postula (opcional) */
    jobId?: string
}

/**
 * Crea una Preference de Mercado Pago para el pago de $7.000 ARS.
 * Retorna el `init_point` (URL a la que hay que redirigir al usuario)
 * y el `id` de la preference.
 */
export async function createPaymentPreference({ orgSlug, token, jobId }: CreatePreferenceOptions) {
    const preference = new Preference(mpClient)

    // URL de retorno: incluye el token para que podamos aprobarlo al volver
    const successUrl = new URL(`/${orgSlug}/pago/success`, BASE_URL)
    successUrl.searchParams.set('token', token)
    if (jobId) successUrl.searchParams.set('job', jobId)

    const failureUrl = new URL(`/${orgSlug}/pago`, BASE_URL)
    const pendingUrl = new URL(`/${orgSlug}/pago`, BASE_URL)

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
            ...(isPublicUrl && {
                auto_return: 'approved' as const,
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
