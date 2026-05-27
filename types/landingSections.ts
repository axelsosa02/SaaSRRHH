// ─── AGREGAR A types/index.ts ─────────────────────────────────────────────────

export type SectionType =
    | 'hero'
    | 'quienes_somos'
    | 'como_postularse'
    | 'contacto'
    | 'footer'

// Contenido tipado por sección
export interface HeroContent {
    title: string
    subtitle?: string
    cta_text: string
    cta_secondary_text?: string
    cta_tertiary_text?: string
    background_image?: string
}

export interface QuienesSomosCard {
    title: string
    description: string
}

export interface QuienesSomosContent {
    title: string
    description: string
    description_two?: string
    image?: string
    cards: QuienesSomosCard[]
}


export interface ComoPostularseContent {
    title: string
    steps: {
        numero: number
        titulo: string
        descripcion: string
    }[]
}

export interface ContactoContent {
    email: string
    telefono?: string
    direccion?: string
    horario?: string
}

export interface FooterContent {
    texto: string
}

// Unión de todos los content posibles
export type SectionContent =
    | HeroContent
    | QuienesSomosContent
    | ComoPostularseContent
    | ContactoContent
    | FooterContent

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