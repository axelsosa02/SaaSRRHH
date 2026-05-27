import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { getJobById } from '@/lib/queries/jobs'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MapPin, Clock, Briefcase, ChevronLeft, Send } from 'lucide-react'

export default async function JobDetailPage({
    params,
}: {
    params: Promise<{ slug: string; id: string }>
}) {
    const { slug, id } = await params

    const org = await getOrganizationBySlug(slug)
    const job = await getJobById(id)

    if (!org || !job) return notFound()

    const colorBrand = org.color_primario || '#472825'

    return (
        <div className="max-w-7xl mx-auto py-12 lg:py-20">
            <Link 
                href={`/${slug}`} 
                className="inline-flex items-center gap-2 text-sm text-[#96786f] hover:text-[#472825] transition-colors mb-8"
            >
                <ChevronLeft className="size-4" />
                Volver a la landing
            </Link>

            <div className="grid gap-12 lg:grid-cols-2">
                {/* ── Contenido Principal ── */}
                <div className=" space-y-10"> 
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-[#fde4bc] border border-[#d3ab80]/20">
                                <Briefcase className="size-8 text-[#472825]" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-[#472825]">
                                {job.titulo}
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-6 text-[#96786f]">
                            <div className="flex items-center gap-2">
                                <MapPin className="size-5" />
                                {job.localidad}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="size-5" />
                                {job.modalidad_id}
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none prose-headings:text-[#472825] prose-p:text-[#96786f] prose-strong:text-[#472825]">
                        <h3 className="text-2xl font-bold mb-4">Descripción del puesto</h3>
                        <div className="whitespace-pre-line leading-relaxed text-lg">
                            {job.descripcion}
                        </div>
                    </div>
                </div>

                {/* ── Sidebar de Acción ── */}
                <div className="lg:col-span-1 max-w-2xl">
                    <div className="sticky top-24 p-8 bg-white border border-[#472825]/10 rounded-[2rem] shadow-xl shadow-[#472825]/5 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-[#472825]">¿Te interesa este puesto?</h3>
                            <p className="text-sm text-[#96786f]">
                                Postulate hoy mismo y nuestro equipo revisará tu perfil para esta vacante.
                            </p>
                        </div>

                        <Button 
                            asChild
                            className="w-full h-14 text-lg font-bold shadow-lg shadow-[#472825]/10 rounded-xl"
                            style={{ backgroundColor: colorBrand }}
                        >
                            <Link href={`/${slug}/postularse?job=${job.id}`}>
                                <Send className="size-5 mr-2 text-white" />
                                <span className='text-white'>Postularse ahora</span>
                            </Link>
                        </Button>

                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-center text-[#96786f]">
                                Al postularte, tus datos serán compartidos con el equipo de selección de {org.nombre}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
