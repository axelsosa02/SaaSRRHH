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
}
