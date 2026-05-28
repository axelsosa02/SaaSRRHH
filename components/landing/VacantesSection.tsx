import { Job } from '@/types/database'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, MapPin, Clock } from 'lucide-react'

interface VacantesSectionProps {
    jobs: Job[]
    slug: string
    colorBrand: string
}

export function VacantesSection({ jobs, slug, colorBrand }: VacantesSectionProps) {
    if (jobs.length === 0) return null

    return (
        <section id="vacantes" className="py-24 bg-white w-full">
            <div className="container max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs uppercase tracking-widest text-[#c1a280] font-bold block mb-3">Oportunidades</span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#472825] mb-4">
                        Vacantes Disponibles
                    </h2>
                    <p className="text-[#96786f] text-lg font-medium">
                        Explorá nuestras oportunidades actuales y encontrá tu próximo desafío profesional.
                    </p>
                </div>

                <div className="grid gap-6 max-w-4xl mx-auto w-full">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="group relative p-8 bg-[#fdfbf7] border border-[#c1a280]/20 rounded-3xl hover:border-[#c1a280] hover:shadow-xl hover:shadow-[#c1a280]/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-[#c1a280]/10 border border-[#c1a280]/20 group-hover:bg-[#c1a280]/20 transition-colors">
                                        <Briefcase className="size-6 text-[#472825]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#472825] group-hover:text-[#c1a280] transition-colors">
                                        {job.titulo}
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-6 text-sm text-[#96786f] font-semibold">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-4 text-[#c1a280]" />
                                        {job.localidad}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 text-[#c1a280]" />
                                        {job.modalidad}
                                    </div>
                                </div>
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                className="md:w-fit h-12 px-8 rounded-xl border-2 border-[#472825] text-[#472825] hover:bg-[#472825] hover:text-[#c1a280] transition-all font-extrabold cursor-pointer"
                            >
                                <Link href={`/${slug}/vacantes/${job.id}`}>
                                    Ver vacante
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
