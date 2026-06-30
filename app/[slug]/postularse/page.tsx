import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { getActiveJobsByOrg } from '@/lib/queries/jobs'
import { notFound, redirect } from 'next/navigation'
import { ApplicationForm } from '@/components/landing/ApplicationForm'
import { getAreas } from '@/lib/services/areas/areas'
import { getExperience } from '@/lib/services/experiencia/getExperience'
import { getAvailability } from '@/lib/services/disponibilidad/getAvailability'
import { isTokenValid, createFreeToken } from '@/lib/payments/tokens'

export default async function PostularsePage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ job?: string; token?: string }>
}) {
    const { slug } = await params
    const { job: jobId, token } = await searchParams

    const org = await getOrganizationBySlug(slug)
    if (!org) return notFound()

    if (org.cobro_postulacion) {
        // La org REQUIERE pago — flujo original con MercadoPago
        const tokenValido = token ? await isTokenValid(token) : false
        if (!tokenValido) {
            redirect(`/${slug}/pago`)
        }
    } else {
        // La org NO requiere pago — generamos un token gratuito y redirigimos con él
        // (solo si aún no tenemos un token válido para no entrar en loop)
        const tokenValido = token ? await isTokenValid(token) : false
        if (!tokenValido) {
            const freeToken = await createFreeToken(org.id)
            const params = new URLSearchParams({ token: freeToken })
            if (jobId) params.set('job', jobId)
            redirect(`/${slug}/postularse?${params.toString()}`)
        }
    }

    const [jobs, areas, experience, availability] = await Promise.all([
        getActiveJobsByOrg(org.id),
        getAreas(org.id),
        getExperience(org.id),
        getAvailability(org.id)
    ])

    const colorBrand = org.color_primario || '#1e3a8a'

    return (
        <div className="container mx-auto py-12 lg:py-20">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Postulate ahora
                    </h1>
                    <p className="text-[#472825]">
                        Completá tus datos y adjuntá tu CV para participar de nuestras búsquedas.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <ApplicationForm
                        orgId={org.id}
                        orgNombre={org.nombre}
                        jobs={jobs}
                        selectedJobId={jobId}
                        colorBrand={colorBrand}
                        experience={experience}
                        availability={availability}
                        paymentToken={token!}
                    />
                </div>
            </div>
        </div>
    )
}