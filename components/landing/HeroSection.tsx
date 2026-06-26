import { HeroContent } from '@/types/landingSections'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface HeroSectionProps {
    content: HeroContent
    slug: string
    colorBrand: string
}

export function HeroSection({ content, slug, colorBrand }: HeroSectionProps) {
    return (
        <section
            className="relative h-full w-full py-24 lg:py-36 overflow-hidden"
            style={{
                backgroundColor: content.bg_color || '#ffffff',
                color: content.text_color || '#472825',
            }}
        >
            <div className="container max-w-7xl mx-auto px-6 flex flex-col w-full items-center justify-center relative z-10">
                <div className="max-w-5xl space-y-8 text-center">
                    <h2 className="text-center text- uppercase tracking-wider text-[#c1a280] font-bold border border-[#c1a280]/30 bg-[#c1a280]/5 py-2 px-6 rounded-full inline-block">
                        {content.cta_tertiary_text}
                    </h2>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#472825] leading-[1.1]">
                        {content.title}
                    </h1>
                    {content.subtitle && (
                        <p className="text-lg md:text-xl text-[#96786f] leading-relaxed mx-auto max-w-3xl font-medium">
                            {content.subtitle}
                        </p>
                    )}
                    <div className="pt-6 flex flex-wrap items-center justify-center gap-6">
                        <Button
                            asChild
                            size="lg"
                            className="px-10 h-14 text-lg font-bold bg-[#472825] text-white hover:bg-[#c1a280] transition-all shadow-xl shadow-[#472825]/15 rounded-xl border border-transparent cursor-pointer"
                        >
                            <Link href={`/${slug}/postularse`}>
                                {content.cta_text}
                            </Link>
                        </Button>

                        {content.cta_secondary_text && (
                            <Button
                                asChild
                                size="lg"
                                className="px-10 h-14 text-lg font-bold bg-transparent text-[#472825] border border-[#472825] hover:bg-[#c1a280]/5 hover:text-[#c1a280] transition-all rounded-xl cursor-pointer"
                            >
                                <Link href="#" >
                                    {content.cta_secondary_text}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {content.background_image && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                        src={content.background_image}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Decoración abstracta premium
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d3ab80] rounded-full blur-[120px] opacity-20 pointer-events-none" /> */}
        </section>
    )
}
