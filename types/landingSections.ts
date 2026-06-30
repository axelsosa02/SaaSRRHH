// ─── AGREGAR A types/index.ts ─────────────────────────────────────────────────

export type SectionType =
    | 'hero'
    | 'quienes_somos'
    | 'como_postularse'
    | 'contacto'
    | 'footer'
    | 'servicios'

// Colores opcionales por sección
interface SectionColors {
    bg_color?: string   // e.g. "#ffffff"
    text_color?: string // e.g. "#1a1a1a"
}

// Contenido tipado por sección
export interface HeroContent extends SectionColors {
    title: string
    subtitle?: string
    cta_text: string
    cta_url?: string
    cta_secondary_text?: string
    cta_secondary_url?: string
    cta_tertiary_text?: string
    background_image?: string
}

export interface QuienesSomosCard {
    title: string
    description: string
}

export interface QuienesSomosContent extends SectionColors {
    title: string
    description: string
    description_two?: string
    image?: string
    cards: QuienesSomosCard[]
}


export interface ComoPostularseContent extends SectionColors {
    title: string
    steps: {
        numero: number
        titulo: string
        descripcion: string
    }[]
}

export interface ContactoContent extends SectionColors {
    email: string
    telefono?: string
    direccion?: string
    horario?: string
}

export interface FooterContent extends SectionColors {
    texto: string
}

export interface ServiciosItem {
    title: string
    description: string
    image?: string
    cta_text?: string
    cta_url?: string
}

export interface ServiciosContent extends SectionColors {
    title: string
    subtitle?: string
    items: ServiciosItem[]
}

// Unión de todos los content posibles
export type SectionContent =
    | HeroContent
    | QuienesSomosContent
    | ComoPostularseContent
    | ContactoContent
    | FooterContent
    | ServiciosContent

export interface LandingSection {
    id: string
    organization_id: string
    type: SectionType
    content: SectionContent
    order: number
    is_active: boolean
}

// Map de secciones — para acceder fácil por tipo
export type SectionMap = Partial<Record<SectionType, SectionContent>>