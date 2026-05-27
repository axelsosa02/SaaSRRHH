import { QuienesSomosContent } from '@/types/landingSections'

interface QuienesSomosSectionProps {
    content: QuienesSomosContent
}

export function QuienesSomosSection({ content }: QuienesSomosSectionProps) {
    return (
        <section id="quienes-somos" className="py-24 w-full bg-white">
            <div className="container flex flex-col max-w-7xl w-full mx-auto gap-12 items-center px-6">
                <div className="flex flex-col gap-12 items-center w-full">
                    <div className="space-y-6 text-center max-w-4xl">
                        <h2 className="text-sm font-bold tracking-widest text-[#c1a280] uppercase">
                            {content.title}
                        </h2>
                        <p className="text-3xl font-extrabold sm:text-5xl text-[#472825] leading-tight whitespace-pre-line tracking-tight">
                            {content.description}
                        </p>
                        {content.description_two && (
                            <p className="text-lg md:text-xl max-w-3xl mx-auto text-[#96786f] leading-relaxed whitespace-pre-line font-medium">
                                {content.description_two}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mt-4">
                        {content.cards?.map((card) => (
                            <div
                                key={card.title}
                                className="flex flex-col gap-3 rounded-2xl border border-[#c1a280]/20 bg-[#fdfbf7] p-8 shadow-sm hover:shadow-lg hover:border-[#c1a280]/40 transition-all"
                            >
                                <h4 className="text-xl font-bold text-[#472825]">{card.title}</h4>
                                <p className="text-sm text-[#96786f] leading-relaxed whitespace-pre-line">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>
                    {content.image && (
                        <div className="relative aspect-video max-w-4xl w-full overflow-hidden rounded-3xl bg-slate-100 shadow-xl border border-[#c1a280]/10 mt-6">
                            <img
                                src={content.image}
                                alt={content.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
