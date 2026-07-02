import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { getActiveJobsByOrg } from '@/lib/queries/jobs'
import { notFound, redirect } from 'next/navigation'

// Importación de componentes de la landing
import { HeroSection } from '@/components/landing/HeroSection'
import { QuienesSomosSection } from '@/components/landing/QuienesSomosSection'
import { ComoPostularseSection } from '@/components/landing/ComoPostularseSection'
import { VacantesSection } from '@/components/landing/VacantesSection'
import { ContactoSection } from '@/components/landing/ContactoSection'
import { Footer } from '@/components/landing/Footer'

// Importación de tipos
import {
    HeroContent,
    QuienesSomosContent,
    ComoPostularseContent,
    ContactoContent,
    FooterContent,
    LandingSection,
    ServiciosContent
} from '@/types/landingSections'
import ServicioSection from '@/components/landing/Servicios'

export default async function Page({ params, }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    // Obtenemos la organización con sus secciones
    const orgData = await getOrganizationBySlug(slug)
    if (!orgData) return notFound()

    const { landing_sections, ...org } = orgData
    const typedOrg = org

    // Redirección si el plan no tiene landing personalizada (Plan Starter)
    if (typedOrg.plan && typedOrg.plan.has_custom_landing === false) {
        redirect(`/${slug}/postularse`)
    }

    const sections = landing_sections as LandingSection[]

    // Obtenemos los puestos activos
    const jobs = await getActiveJobsByOrg(org.id)

    // Helper para obtener contenido por tipo
    const getSection = (type: string) => sections.find(s => s.type === type && s.is_active)

    const colorBrand = '#c1a280'

    // Orden visual deseado de las secciones (independiente del campo `order` en DB)
    const SECTION_ORDER: Record<string, number> = {
        hero: 1,
        quienes_somos: 2,
        servicios: 3,
        como_postularse: 4,
        contacto: 5,
        footer: 6,
    }

    return (
        <div className="flex flex-col w-full">
            {/* Renderizado dinámico de secciones */}
            {sections
                .filter(s => s.is_active)
                .sort((a, b) => (SECTION_ORDER[a.type] ?? 99) - (SECTION_ORDER[b.type] ?? 99))
                .map((section) => {
                    switch (section.type) {
                        case 'hero':
                            return (
                                <HeroSection
                                    key={section.id}
                                    content={section.content as HeroContent}
                                    slug={slug}
                                    colorBrand={colorBrand}
                                />
                            )
                        case 'quienes_somos':
                            return (
                                <QuienesSomosSection
                                    key={section.id}
                                    content={section.content as QuienesSomosContent}
                                />
                            )
                        case 'servicios':
                            return (
                                <ServicioSection
                                    key={section.id}
                                    content={section.content as ServiciosContent}
                                    colorBrand={colorBrand}
                                />
                            )
                        case 'como_postularse':
                            return (
                                <ComoPostularseSection
                                    key={section.id}
                                    content={section.content as ComoPostularseContent}
                                    colorBrand={colorBrand}
                                />
                            )
                        case 'contacto':
                            return (
                                <ContactoSection
                                    key={section.id}
                                    content={section.content as ContactoContent}
                                    colorBrand={colorBrand}
                                />
                            )
                        default:
                            return null
                    }
                })}

            {/* Sección de Vacantes (siempre visible si hay puestos) */}
            <VacantesSection
                jobs={jobs}
                slug={slug}
                colorBrand={colorBrand}
            />

            {/* Footer */}
            {getSection('footer') && (
                <Footer
                    content={getSection('footer')!.content as FooterContent}
                    nombre={org.nombre}
                />
            )}
        </div>
    )
}
