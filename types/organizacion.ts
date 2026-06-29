import type { Plan } from './plan'

export interface OrgConfig {
    id: string
    slug: string
    nombre: string
    logo_url: string | null
    color_primario: string
    color_secundario: string
    email_contacto: string | null
    whatsapp: string | null
    mail_bienvenida_asunto: string | null
    mail_bienvenida: string | null
    mail_rechazo_asunto: string | null
    mail_rechazo: string | null
    cobro_postulacion: boolean
    monto_postulacion: number
    // Mercado Pago OAuth (NUNCA exponer mp_access_token al frontend)
    mp_connected: boolean
    mp_user_id: string | null
    nav_items?: string[] | null
    // Plan
    plan_id: string
    plan_expires_at: string | null
    plan?: Plan  // disponible cuando se hace join con plans
}

