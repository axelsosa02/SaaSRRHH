'use client'

import { Eye } from 'lucide-react'
import { HeroSection } from '@/components/landing/HeroSection'
import { QuienesSomosSection } from '@/components/landing/QuienesSomosSection'
import { ComoPostularseSection } from '@/components/landing/ComoPostularseSection'
import { ContactoSection } from '@/components/landing/ContactoSection'
import ServicioSection from '@/components/landing/Servicios'
import type {
    HeroContent,
    QuienesSomosContent,
    ComoPostularseContent,
    ContactoContent,
    ServiciosContent,
} from '@/types/landingSections'

type PreviewTab = 'hero' | 'quienes_somos' | 'como_postularse' | 'servicios' | 'contacto'

interface SectionPreviewProps {
    activeTab: PreviewTab
    heroData?: HeroContent
    quienesSomosData?: QuienesSomosContent
    comoPostularseData?: ComoPostularseContent
    serviciosData?: ServiciosContent
    contactoData?: ContactoContent
    slug?: string
    colorBrand?: string
}

const TAB_LABELS: Record<PreviewTab, string> = {
    hero: 'Hero',
    quienes_somos: 'Quiénes somos',
    como_postularse: 'Cómo postularse',
    servicios: 'Servicios',
    contacto: 'Contacto',
}

export function SectionPreview({
    activeTab,
    heroData,
    quienesSomosData,
    comoPostularseData,
    serviciosData,
    contactoData,
    slug = 'preview',
    colorBrand = '#472825',
}: SectionPreviewProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50 rounded-t-2xl">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Eye className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                    Vista previa — {TAB_LABELS[activeTab]}
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-[10px] text-muted-foreground">En vivo</span>
                </div>
            </div>

            {/* Preview viewport */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white rounded-b-2xl">
                <div
                    className="origin-top-left"
                    style={{
                        width: '200%',
                        transform: 'scale(0.5)',
                        transformOrigin: 'top left',
                    }}
                >
                    {activeTab === 'hero' && heroData && (
                        <HeroSection
                            content={heroData}
                            slug={slug}
                            colorBrand={colorBrand}
                        />
                    )}

                    {activeTab === 'quienes_somos' && quienesSomosData && (
                        <QuienesSomosSection content={quienesSomosData} />
                    )}

                    {activeTab === 'como_postularse' && comoPostularseData && (
                        <ComoPostularseSection
                            content={comoPostularseData}
                            colorBrand={colorBrand}
                        />
                    )}

                    {activeTab === 'servicios' && serviciosData && (
                        <ServicioSection
                            content={serviciosData}
                            colorBrand={colorBrand}
                        />
                    )}

                    {activeTab === 'contacto' && contactoData && (
                        <ContactoSection
                            content={contactoData}
                            colorBrand={colorBrand}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
