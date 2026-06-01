import { ComoPostularseContent } from '@/types/landingSections'

interface ComoPostularseSectionProps {
    content: ComoPostularseContent
    colorBrand: string
}

export function ComoPostularseSection({ content, colorBrand }: ComoPostularseSectionProps) {
    return (
        <section id="como-postularse" className="py-24  w-full border-y border-[#c1a280]/15">
            <div className="container max-w-7xl mx-auto px-6 flex flex-col gap-12 lg:gap-16 justify-center items-center lg:items-start w-full">

                <div className="w-full flex flex-col gap-4 text-center lg:text-left">
                    <span className="text-xs uppercase tracking-widest text-[#c1a280] font-bold block">Paso a paso</span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#472825]">
                        {content.title}
                    </h2>
                </div>

                <div className="flex flex-col gap-8 md:gap-10 lg:gap-12 w-full">
                    {content.steps.sort((a, b) => a.numero - b.numero).map((step) => {
                        const formattedNum = String(step.numero).padStart(2, '0');
                        return (
                            <div key={step.numero} className="flex justify-between w-full gap-6 lg:gap-12 group">
                                <div className="select-none">
                                    <h2 className="text-5xl md:text-7xl lg:text-8xl lg:px-8 font-extrabold text-[#c1a280]">
                                        {formattedNum}
                                    </h2>
                                </div>
                                <div className="border-b border-[#c1a280]/20 flex flex-col gap-4 lg:gap-6 w-full pb-6 lg:pb-10">
                                    <h3 className="text-2xl md:text-3xl lg:text-4xl text-[#472825] font-extrabold ">
                                        {step.titulo}
                                    </h3>
                                    <p className="max-w-[800px] text-base md:text-lg lg:text-xl text-[#96786f] leading-relaxed font-medium">
                                        {step.descripcion}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
