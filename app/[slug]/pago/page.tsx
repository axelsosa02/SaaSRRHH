import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { notFound, redirect } from 'next/navigation'
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react'
import { PayButton } from '@/components/landing/PayButton'
import { approvePaymentToken } from '@/lib/payments/tokens'
import { verifyPayment } from '@/lib/payments/verify'
import { getOrgMpAccessToken } from '@/lib/payments/oauth'

// Forzar que esta página NUNCA se cachee
export const dynamic = 'force-dynamic'

export default async function PagoPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<Record<string, string | undefined>>
}) {
    const { slug } = await params
    const sp = await searchParams

    const org = await getOrganizationBySlug(slug)
    if (!org) return notFound()

    // ──────────────────────────────────────────────────────────
    // INTERCEPTOR: Mercado Pago a veces redirige a /pago en vez de /pago/success.
    // Si detectamos params de MP (payment_id, external_reference, status),
    // verificamos el pago y redirigimos al formulario.
    // ──────────────────────────────────────────────────────────
    const mpPaymentId = sp.payment_id || sp.collection_id
    const mpStatus = sp.status || sp.collection_status
    // external_reference es el token UUID que guardamos en nuestra DB
    const mpToken = sp.external_reference || sp.token

    console.log('[pago] Query params recibidos:', JSON.stringify(sp))

    if (mpPaymentId && mpToken) {
        console.log('[pago] Detectado redirect de MP con payment_id:', mpPaymentId, 'token:', mpToken, 'status:', mpStatus)

        // Si el status indica que pagó (o está en proceso), aprobamos y redirigimos
        if (mpStatus === 'approved' || mpStatus === 'in_process' || mpStatus === 'pending' || mpStatus === 'null') {
            try {
                // Intentamos verificar contra la API de MP
                let accessToken: string | undefined
                try {
                    accessToken = await getOrgMpAccessToken(org.id)
                } catch {
                    accessToken = process.env.YOUR_ACCESS_TOKEN
                }

                try {
                    const payment = await verifyPayment(mpPaymentId, accessToken)
                    console.log('[pago] Verificación de MP:', { status: payment.status, amount: payment.transactionAmount })
                } catch (verifyErr) {
                    console.warn('[pago] No se pudo verificar contra API de MP, continuando con fallback:', verifyErr)
                }

                // Aprobamos el token en nuestra DB
                await approvePaymentToken({ token: mpToken, mpPaymentId })
                console.log('[pago] Token aprobado, redirigiendo al formulario')

                // Redirigimos al formulario
                const formUrl = `/${slug}/postularse?token=${mpToken}`
                redirect(formUrl)
            } catch (error) {
                // Si el error es un NEXT_REDIRECT (de la función redirect), lo re-lanzamos
                if (error && typeof error === 'object' && 'digest' in error) {
                    throw error
                }
                console.error('[pago] Error procesando redirect de MP:', error)
            }
        }
    }

    // ──────────────────────────────────────────────────────────
    // Flujo normal: mostrar el botón de pago
    // ──────────────────────────────────────────────────────────
    const colorBrand = org.color_primario || '#472825'
    const monto = org.monto_postulacion || 7000
    const montoFormateado = monto.toLocaleString('es-AR')

    return (
        <div className="container mx-auto py-12 lg:py-20">
            <div className="max-w-sm sm:px-10 md:max-w-md lg:max-w-lg mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <Lock className="size-16 text-[#472825] mx-auto" />
                    <h1 className="text-3xl font-bold tracking-tight">Finalizá tu postulación</h1>
                    <p className="text-muted-foreground">
                        Para completar tu aplicación a <strong>{org.nombre}</strong>, es necesario
                        abonar el token de servicio de ${montoFormateado} ARS.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-200">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-600">Servicio de gestión de CV</span>
                            <span className="text-2xl font-bold">${montoFormateado}</span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="flex gap-3 items-start">
                                <ShieldCheck className="size-5 text-green-600 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600">
                                    Pago 100% seguro procesado por Mercado Pago.
                                </p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600">
                                    Acceso prioritario a entrevistas y feedback personalizado.
                                </p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600">
                                    Tu postulación queda activa por 24 horas desde el pago.
                                </p>
                            </div>
                        </div>

                        <PayButton
                            orgId={org.id}
                            orgSlug={slug}
                            monto={monto}
                            colorBrand={colorBrand}
                        />

                        <p className="text-center text-xs text-muted-foreground">
                            Al hacer clic serás redirigido a Mercado Pago para completar el pago de forma segura.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
