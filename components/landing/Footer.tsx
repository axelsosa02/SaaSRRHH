import { FooterContent } from '@/types/landingSections'

interface FooterProps {
    content: FooterContent
    nombre: string
}

export function Footer({ content, nombre }: FooterProps) {
    return (
        <footer className="border-t border-[#c1a280]/20 bg-[#fdfbf7] w-full">
            <div className="container max-w-7xl mx-auto px-6 py-8 md:py-12">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-[#96786f] font-semibold">
                        © {new Date().getFullYear()} {nombre}. {content.texto}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#96786f] font-bold">
                        <p>Desarrollado por <span className="text-[#472825]">Talento RH</span></p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
