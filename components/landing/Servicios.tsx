'use client'

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { ServiciosContent } from "@/types/landingSections"

interface ServiciosProps {
    content: ServiciosContent
    colorBrand: string
}

export default function ServicioSection({ content, colorBrand }: ServiciosProps) {
    // Índice de la card expandida en mobile (-1 = ninguna)
    const [expandedIndex, setExpandedIndex] = useState<number>(-1)

    const toggleCard = (index: number) => {
        setExpandedIndex(prev => (prev === index ? -1 : index))
    }

    return (
        <section
            id="servicios"
            className="py-16 px-4 md:px-8"
            style={{
                backgroundColor: content.bg_color || '#fdfbf7',
                color: content.text_color || '#472825',
            }}
        >
            <div className="max-w-md mx-auto sm:max-w-3xl lg:max-w-6xl">

                {/* Encabezado */}
                <div className="mb-12 max-w-3xl mx-auto text-center md:mb-16">
                    <h2 className="text-[#472825] text-3xl font-bold mb-6 md:text-4xl">
                        {content.title}
                    </h2>
                    {content.subtitle && (
                        <p className="text-base text-slate-600 leading-relaxed">
                            {content.subtitle}
                        </p>
                    )}
                </div>

                {/* Grid de cards */}
                <div className="grid grid-cols-1 gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {content.items.map((item, index) => {
                        const isExpanded = expandedIndex === index

                        return (
                            <div
                                key={index}
                                className="block rounded-2xl overflow-hidden relative group before:absolute before:inset-0 before:z-10 before:bg-black/10"
                            >
                                {/* Imagen de fondo */}
                                <div className="w-full aspect-[119/128]">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#c1a280]/30 to-[#472825]/20 flex items-center justify-center">
                                            <span className="text-5xl text-[#c1a280]/40 font-bold select-none">
                                                {index + 1}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Panel de texto superpuesto */}
                                <div className="px-5 py-4 absolute bottom-0 left-0 right-0 bg-white/85 backdrop-blur-sm z-10">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            {item.cta_text && (
                                                <span
                                                    className="text-xs font-semibold uppercase tracking-wider mb-1 block"
                                                    style={{ color: colorBrand }}
                                                >
                                                    {item.cta_text}
                                                </span>
                                            )}
                                            <h3 className="text-base font-semibold text-[#472825] line-clamp-1">
                                                {item.title}
                                            </h3>
                                        </div>

                                        {/* Botón toggle — solo visible en mobile (sm:hidden) */}
                                        <button
                                            type="button"
                                            aria-label={isExpanded ? 'Ocultar descripción' : 'Ver descripción'}
                                            onClick={() => toggleCard(index)}
                                            className="sm:hidden flex-shrink-0 w-7 h-7 rounded-full bg-white/70 border border-slate-200 flex items-center justify-center transition-transform duration-300 mt-0.5"
                                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        >
                                            <ChevronDown className="size-4 text-[#472825]" />
                                        </button>
                                    </div>

                                    {/* Descripción:
                                        - Mobile: controlada por estado (expandedIndex)
                                        - Desktop: controlada por hover con CSS puro
                                    */}
                                    <div
                                        className={[
                                            'overflow-hidden transition-all duration-300',
                                            // Mobile: expand/collapse por tap
                                            isExpanded ? 'h-[75px] mt-3' : 'h-0',
                                            // Desktop: override con hover CSS (group-hover)
                                            'sm:h-0 sm:mt-0 group-hover:sm:h-[75px] group-hover:sm:mt-3',
                                        ].join(' ')}
                                    >
                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Hint visual solo en mobile cuando está colapsado */}
                                    {!isExpanded && (
                                        <p className="text-[10px] text-slate-400 mt-1 sm:hidden">
                                            Tocá para ver más ↓
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        </section>
    )
}