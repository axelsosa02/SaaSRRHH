import { ContactoContent } from '@/types/landingSections'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

interface ContactoSectionProps {
    content: ContactoContent
    colorBrand: string
}

export function ContactoSection({ content, colorBrand }: ContactoSectionProps) {
    return (
        <section
            id="contacto"
            className="py-24 w-full border-t border-[#c1a280]/15"
            style={{
                backgroundColor: content.bg_color || '#fdfbf7',
                color: content.text_color || '#472825',
            }}
        >
            <div className="container max-w-7xl px-6 mx-auto">
                <div className="grid gap-12 lg:grid-cols-2 w-full min-w-0">
                    <div className="space-y-10 min-w-0 overflow-hidden">
                        <span className="text-xs uppercase tracking-widest text-[#c1a280] font-bold block">Contacto</span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#472825] mt-2!">
                            Ponete en contacto
                        </h2>

                        <div className="grid gap-8">
                            <div className="flex gap-5">
                                <div className="shrink-0 p-4 rounded-2xl bg-white border border-[#c1a280]/20 shadow-sm h-fit">
                                    <Mail className="size-6 text-[#c1a280]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-[#472825]">Email</p>
                                    <p className="text-[#96786f] text-lg font-medium break-all">{content.email}</p>
                                </div>
                            </div>

                            {content.telefono && (
                                <div className="flex gap-5">
                                    <div className="shrink-0 p-4 rounded-2xl bg-white border border-[#c1a280]/20 shadow-sm h-fit">
                                        <Phone className="size-6 text-[#c1a280]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-[#472825]">Teléfono</p>
                                        <p className="text-[#96786f] text-lg font-medium break-all">{content.telefono}</p>
                                    </div>
                                </div>
                            )}

                            {content.direccion && (
                                <div className="flex gap-5">
                                    <div className="shrink-0 p-4 rounded-2xl bg-white border border-[#c1a280]/20 shadow-sm h-fit">
                                        <MapPin className="size-6 text-[#c1a280]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-[#472825]">Dirección</p>
                                        <p className="text-[#96786f] text-lg font-medium wrap-break-word">{content.direccion}</p>
                                    </div>
                                </div>
                            )}

                            {content.horario && (
                                <div className="flex gap-5">
                                    <div className="shrink-0 p-4 rounded-2xl bg-white border border-[#c1a280]/20 shadow-sm h-fit">
                                        <Clock className="size-6 text-[#c1a280]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-[#472825]">Horario de atención</p>
                                        <p className="text-[#96786f] text-lg font-medium wrap-break-word">{content.horario}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-[#472825] to-[#5d3b37] rounded-[2.5rem] p-10 lg:p-16 text-white flex flex-col justify-center items-center text-center gap-8 shadow-xl shadow-[#472825]/15 border border-[#c1a280]/15 relative overflow-hidden">
                        {/* Soft gold glow decoration */}
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#c1a280] rounded-full blur-[80px] opacity-10 pointer-events-none" />

                        <h3 className="text-3xl sm:text-4xl font-extrabold leading-tight">¿Listo para el próximo paso?</h3>
                        <p className="text-[#fff4e2]/95 text-lg max-w-sm font-medium">
                            Estamos buscando talentos como vos. No dudes en enviarnos tu perfil para futuras vacantes.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
