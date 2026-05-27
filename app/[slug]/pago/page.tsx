import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { notFound } from 'next/navigation'
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react'
import { PayButton } from '@/components/landing/PayButton'

export default async function PagoPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const org = await getOrganizationBySlug(slug)

    if (!org) return notFound()

    const colorBrand = org.color_primario || '#472825'

    return (
        <div className="container mx-auto py-12 lg:py-20">
            <div className="max-w-md mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <Lock className="size-16 text-[#472825] mx-auto" />
                    <h1 className="text-3xl font-bold tracking-tight">Finalizá tu postulación</h1>
                    <p className="text-muted-foreground">
                        Para completar tu aplicación a <strong>{org.nombre}</strong>, es necesario
                        abonar el token de servicio de $7.000 ARS.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-200">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-600">Servicio de gestión de CV</span>
                            <span className="text-2xl font-bold">$7.000</span>
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
