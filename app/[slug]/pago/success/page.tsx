import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { verifyPayment } from '@/lib/payments/verify'
import { approvePaymentToken } from '@/lib/payments/tokens'
import { notFound, redirect } from 'next/navigation'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PagoSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ payment_id?: string; token?: string; job?: string }>
}) {
    const { slug } = await params
    const { payment_id, token, job } = await searchParams

    const org = await getOrganizationBySlug(slug)
    if (!org) return notFound()

    // Si no tenemos payment_id o token, algo salió mal
    if (!payment_id || !token) {
        return <ErrorView slug={slug} message="Información de pago incompleta." />
    }

    let paymentApproved = false

    try {
        // Verificamos el pago contra la API de Mercado Pago
        const payment = await verifyPayment(payment_id)

        if (payment.isApproved && payment.transactionAmount === 7000) {
            // Aprobamos el token en nuestra DB
            await approvePaymentToken({ token, mpPaymentId: payment_id })
            paymentApproved = true
        }
    } catch (error) {
        console.error('[pago/success] Error verificando pago:', error)
    }

    if (!paymentApproved) {
        return <ErrorView slug={slug} message="No pudimos verificar tu pago. Si ya fue debitado, esperá unos minutos e intentá de nuevo." />
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
