import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { verifyPayment } from '@/lib/payments/verify'
import { approvePaymentToken } from '@/lib/payments/tokens'
import { getOrgMpAccessToken } from '@/lib/payments/oauth'
import { notFound, redirect } from 'next/navigation'
import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Forzar que esta página NUNCA se cachee — siempre debe ejecutarse en el servidor
export const dynamic = 'force-dynamic'

export default async function PagoSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<Record<string, string | undefined>>
}) {
    const { slug } = await params
    const sp = await searchParams

    // Mercado Pago envía varios query params al redirigir.
    // payment_id y collection_id son el mismo valor; algunos flujos usan uno u otro.
    const payment_id = sp.payment_id || sp.collection_id
    const token = sp.token
    const job = sp.job
    const status = sp.status || sp.collection_status

    console.log('[pago/success] Query params recibidos:', JSON.stringify(sp))
    console.log('[pago/success] Valores parseados:', { payment_id, token, job, status })

    const org = await getOrganizationBySlug(slug)
    if (!org) return notFound()

    // Si no tenemos token, algo salió mal
    if (!token) {
        console.error('[pago/success] Token faltante en la URL')
        return <ErrorView slug={slug} message="Información de pago incompleta (falta token)." />
    }

    // Si no tenemos payment_id pero SÍ tenemos token, intentamos aprobar el token directamente
    // Esto cubre el caso donde MP no pasa el payment_id correctamente
    if (!payment_id) {
        console.warn('[pago/success] No se recibió payment_id de MP, aprobando token por status:', status)
        if (status === 'approved' || status === 'in_process' || status === 'pending') {
            try {
                await approvePaymentToken({ token, mpPaymentId: 'mp-redirect-sin-id' })
            } catch (err) {
                console.error('[pago/success] Error aprobando token sin payment_id:', err)
            }
            const formUrl = `/${slug}/postularse?token=${token}${job ? `&job=${job}` : ''}`
            redirect(formUrl)
        }
        return <ErrorView slug={slug} message="Información de pago incompleta." />
    }

    let paymentApproved = false

    try {
        // Obtenemos el access token de Mercado Pago de la organización
        let accessToken: string | undefined
        try {
            accessToken = await getOrgMpAccessToken(org.id)
            console.log('[pago/success] Usando access token de la organización')
        } catch {
            accessToken = process.env.YOUR_ACCESS_TOKEN
            console.log('[pago/success] Usando access token de fallback (.env)')
        }

        // Verificamos el pago contra la API de Mercado Pago
        const payment = await verifyPayment(payment_id, accessToken)
        console.log('[pago/success] Respuesta de MP:', {
            id: payment.id,
            status: payment.status,
            amount: payment.transactionAmount,
            currency: payment.currencyId,
            isApproved: payment.isApproved,
        })

        // Consideramos válido: approved, in_process o pending
        if (
            (payment.isApproved || payment.status === 'in_process' || payment.status === 'pending') &&
            payment.transactionAmount === 7000
        ) {
            await approvePaymentToken({ token, mpPaymentId: payment_id })
            paymentApproved = true
            console.log('[pago/success] Token aprobado exitosamente')
        } else {
            console.warn('[pago/success] Pago no válido:', {
                status: payment.status,
                amount: payment.transactionAmount,
            })
        }
    } catch (error) {
        console.error('[pago/success] Error verificando pago contra API de MP:', error)

        // FALLBACK: Si la API de MP falla pero el status del redirect indica que pagó,
        // aprobamos el token igualmente para no bloquear al candidato.
        if (status === 'approved' || status === 'in_process' || status === 'pending') {
            console.warn('[pago/success] FALLBACK: Aprobando token por status de redirect:', status)
            try {
                await approvePaymentToken({ token, mpPaymentId: payment_id })
                paymentApproved = true
            } catch (approveError) {
                console.error('[pago/success] Error en fallback de aprobación:', approveError)
            }
        }
    }

    if (!paymentApproved) {
        return <ErrorView slug={slug} message="No pudimos verificar tu pago o fue rechazado. Por favor, intentá de nuevo." />
    }

    // Construimos la URL del formulario con el token desbloqueado
    const formUrl = `/${slug}/postularse?token=${token}${job ? `&job=${job}` : ''}`

    // Redirigimos directamente al formulario
    redirect(formUrl)
}

function ErrorView({ slug, message }: { slug: string; message: string }) {
    return (
        <div className="container mx-auto py-20">
            <div className="max-w-md mx-auto text-center space-y-6">
                <XCircle className="size-16 text-red-500 mx-auto" />
                <h1 className="text-2xl font-bold">Hubo un problema con tu pago</h1>
                <p className="text-muted-foreground">{message}</p>
                <Button asChild>
                    <Link href={`/${slug}/pago`}>Volver a intentarlo</Link>
                </Button>
            </div>
        </div>
    )
}

