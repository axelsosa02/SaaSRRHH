'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Settings, Loader2, ImageIcon, CreditCard } from 'lucide-react'
import { MercadoPagoConnect } from '@/components/admin/MercadoPagoConnect'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { upsertSection } from '@/lib/services/configuracion landing/landingSections'
import { updateOrgGeneral, updateOrgLogo, updateOrgEmails, updateOrgPago, uploadSectionImage, updateOrgNavItems, type OrgConfig } from '@/lib/services/configuracion landing/organizacion'
import { ALL_NAV_ITEMS } from '@/components/landing/Navbar'
// En tus imports
import type {
    SectionMap,
    HeroContent,
    QuienesSomosContent,
    ComoPostularseContent,
    ContactoContent,
    FooterContent,
    ServiciosContent
} from '@/types/landingSections'


/**
 * Tipos de pestañas disponibles en el panel de configuración
 */
type Tab = 'general' | 'hero' | 'quienes_somos' | 'como_postularse' | 'servicios' | 'contacto' | 'emails'

/**
 * Definición de las pestañas para la navegación del panel
 */
const TABS: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'hero', label: 'Hero' },
    { id: 'quienes_somos', label: 'Quiénes somos' },
    { id: 'como_postularse', label: 'Cómo postularse' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'contacto', label: 'Contacto y footer' },
    { id: 'emails', label: 'Correos automáticos' },
]

// ─── ESQUEMAS DE VALIDACIÓN (Zod) ──────────────────────────────────────────────
// Se definen por separado para mantener la claridad y facilitar la inferencia de tipos.

const FormLabelWithCounter = ({ label, current = 0, max, optional }: { label: React.ReactNode, current?: number, max: number, optional?: boolean }) => (
    <div className="flex items-center justify-between pb-1">
        <FormLabel className="pb-0!">{label} {optional && <span className="text-muted-foreground font-normal">(opcional)</span>}</FormLabel>
        <span className="text-xs text-muted-foreground font-medium">{current}/{max}</span>
    </div>
)

/** Esquema para datos básicos y colores de marca de la organización */
const generalSchema = z.object({
    nombre: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
    email_contacto: z.string().email('Email inválido'),
    whatsapp: z.string().max(20, 'Máximo 20 caracteres').optional(),
    color_primario: z.string().min(1, 'Requerido'),
    color_secundario: z.string().min(1, 'Requerido'),
})

const heroSchema = z.object({
    title: z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
    subtitle: z.string().max(120, 'Máximo 120 caracteres').optional(),
    cta_text: z.string().min(1, 'Requerido').max(20, 'Máximo 20 caracteres'),
    cta_url: z.string().optional(),
    cta_secondary_text: z.string().max(20, 'Máximo 20 caracteres').optional(),
    cta_secondary_url: z.string().optional(),
    cta_tertiary_text: z.string().max(60, 'Máximo 60 caracteres').optional(),
    background_image: z.string().optional(),
    bg_color: z.string().optional(),
    text_color: z.string().optional(),
})

const quienesSomosCardSchema = z.object({
    title: z.string().min(1, 'Requerido').max(40, 'Máximo 40 caracteres'),
    description: z.string().min(1, 'Requerido').max(150, 'Máximo 150 caracteres'),
})

const quienesSomosSchema = z.object({
    title: z.string().min(1, 'Requerido').max(60, 'Máximo 60 caracteres'),
    description: z.string().min(1, 'Requerido').max(600, 'Máximo 600 caracteres'),
    description_two: z.string().max(600, 'Máximo 600 caracteres').optional(),
    image: z.string().optional(),
    cards: z.array(quienesSomosCardSchema),
    bg_color: z.string().optional(),
    text_color: z.string().optional(),
})

const comoPostularseSchema = z.object({
    title: z.string().min(1, 'Requerido').max(60, 'Máximo 60 caracteres'),
    step1_titulo: z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
    step1_descripcion: z.string().min(1, 'Requerido').max(200, 'Máximo 200 caracteres'),
    step2_titulo: z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
    step2_descripcion: z.string().min(1, 'Requerido').max(200, 'Máximo 200 caracteres'),
    step3_titulo: z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
    step3_descripcion: z.string().min(1, 'Requerido').max(200, 'Máximo 200 caracteres'),
    step4_titulo: z.string().max(50, 'Máximo 50 caracteres').optional(),
    step4_descripcion: z.string().max(200, 'Máximo 200 caracteres').optional(),
    bg_color: z.string().optional(),
    text_color: z.string().optional(),
})

const contactoSchema = z.object({
    email: z.string().email('Email inválido'),
    telefono: z.string().max(30, 'Máximo 30 caracteres').optional(),
    direccion: z.string().max(100, 'Máximo 100 caracteres').optional(),
    horario: z.string().max(100, 'Máximo 100 caracteres').optional(),
    footer_texto: z.string().max(300, 'Máximo 300 caracteres').optional(),
    bg_color: z.string().optional(),
    text_color: z.string().optional(),
})

const serviciosItemSchema = z.object({
    title: z.string().min(1, 'Requerido').max(60, 'Máximo 60 caracteres'),
    description: z.string().min(1, 'Requerido').max(300, 'Máximo 300 caracteres'),
    image: z.string().optional(),
    cta_text: z.string().max(30, 'Máximo 30 caracteres').optional(),
    cta_url: z.string().optional(),
})

const serviciosSchema = z.object({
    title: z.string().min(1, 'Requerido').max(60, 'Máximo 60 caracteres'),
    subtitle: z.string().max(200, 'Máximo 200 caracteres').optional(),
    items: z.array(serviciosItemSchema).min(1, 'Agregá al menos un servicio'),
    bg_color: z.string().optional(),
    text_color: z.string().optional(),
})

const emailsSchema = z.object({
    mail_bienvenida_asunto: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
    mail_bienvenida: z.string().min(1, 'Requerido').max(2000, 'Máximo 2000 caracteres'),
    mail_rechazo_asunto: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
    mail_rechazo: z.string().min(1, 'Requerido').max(2000, 'Máximo 2000 caracteres'),
})

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

type GeneralValues = z.infer<typeof generalSchema>
type HeroValues = z.infer<typeof heroSchema>
type QuienesSomosValues = z.infer<typeof quienesSomosSchema>
type ComoPostularseValues = z.infer<typeof comoPostularseSchema>
type ServiciosValues = z.infer<typeof serviciosSchema>
type ContactoValues = z.infer<typeof contactoSchema>
type EmailsValues = z.infer<typeof emailsSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    org: OrgConfig
    sections: SectionMap
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStr(obj: any, key: string): string {
    return obj?.[key] ?? ''
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Componente Principal: ConfiguracionClient
 * Maneja la edición de toda la configuración de la organización y su landing page.
 * Utiliza react-hook-form con validación zod para cada sección.
 */
export function ConfiguracionClient({ org, sections }: Props) {
    // Estado para la navegación interna del panel
    const [activeTab, setActiveTab] = useState<Tab>('general')

    // Estado para el logo (permite actualización inmediata sin recargar)
    const [logoUrl, setLogoUrl] = useState<string | null>(org.logo_url)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    // Estado para cobro por postulación
    const [cobroPostulacion, setCobroPostulacion] = useState<boolean>(org.cobro_postulacion ?? true)
    const [montoPostulacion, setMontoPostulacion] = useState<number>(org.monto_postulacion ?? 7000)
    const [savingCobro, setSavingCobro] = useState(false)

    // Estado para los ítems del navbar
    const [navItemsSelected, setNavItemsSelected] = useState<string[]>(
        org.nav_items && org.nav_items.length > 0
            ? org.nav_items
            : ALL_NAV_ITEMS.map(i => i.id)
    )
    const [savingNav, setSavingNav] = useState(false)

    // Estado para los links de cortesía generados
    const [generatedLink, setGeneratedLink] = useState<string>('')
    const [generatingLink, setGeneratingLink] = useState(false)

    // Estado MP (leído del server, actualizado por el widget)
    const mpConnected = org.mp_connected ?? false
    const mpUserId = org.mp_user_id ?? null

    // Desestructuración de las secciones de la landing para facilitar el acceso
    const hero = sections.hero as HeroContent | undefined
    const quienes = sections.quienes_somos as QuienesSomosContent | undefined
    const como = sections.como_postularse as ComoPostularseContent | undefined
    const servicios = sections.servicios as ServiciosContent | undefined
    const contacto = sections.contacto as ContactoContent | undefined
    const footer = sections.footer as FooterContent | undefined

    // ── CONFIGURACIÓN DE FORMULARIOS ──────────────────────────────────────────
    // Cada formulario se inicializa con los valores actuales de la base de datos (org o sections).

    /** Formulario General (Nombre, Email, Colores) */
    const generalForm = useForm<GeneralValues>({
        resolver: zodResolver(generalSchema),
        defaultValues: {
            nombre: org.nombre || '',
            email_contacto: org.email_contacto || '',
            whatsapp: org.whatsapp || '',
            color_primario: org.color_primario || '#1E3A5F',
            color_secundario: org.color_secundario || '#378ADD',
        },
    })

    /** Formulario Hero (Sección principal de la landing) */
    const heroForm = useForm<HeroValues>({
        resolver: zodResolver(heroSchema),
        defaultValues: {
            title: getStr(hero, 'title'),
            subtitle: getStr(hero, 'subtitle'),
            cta_text: getStr(hero, 'cta_text') || 'Quiero postularme',
            cta_url: getStr(hero, 'cta_url'),
            cta_secondary_text: getStr(hero, 'cta_secondary_text'),
            cta_secondary_url: getStr(hero, 'cta_secondary_url'),
            cta_tertiary_text: getStr(hero, 'cta_tertiary_text'),
            background_image: getStr(hero, 'background_image'),
            bg_color: getStr(hero, 'bg_color') || '#ffffff',
            text_color: getStr(hero, 'text_color') || '#472825',
        },
    })

    /** Formulario Quiénes Somos */
    const quienesSomosForm = useForm<QuienesSomosValues>({
        resolver: zodResolver(quienesSomosSchema),
        defaultValues: {
            title: getStr(quienes, 'title'),
            description: getStr(quienes, 'description'),
            description_two: getStr(quienes, 'description_two'),
            image: getStr(quienes, 'image'),
            cards: quienes?.cards || [
                {
                    title: '',
                    description: '',
                },
            ],
            bg_color: getStr(quienes, 'bg_color') || '#ffffff',
            text_color: getStr(quienes, 'text_color') || '#472825',
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: quienesSomosForm.control,
        name: "cards"
    })


    /** Formulario Pasos de Postulación (Estructura dinámica de steps) */
    const comoPostularseForm = useForm<ComoPostularseValues>({
        resolver: zodResolver(comoPostularseSchema),
        defaultValues: {
            title: getStr(como, 'title') || 'Cómo postularte',
            step1_titulo: como?.steps?.[0]?.titulo || 'Revisá las vacantes',
            step1_descripcion: como?.steps?.[0]?.descripcion || '',
            step2_titulo: como?.steps?.[1]?.titulo || 'Abonás el arancel',
            step2_descripcion: como?.steps?.[1]?.descripcion || '',
            step3_titulo: como?.steps?.[2]?.titulo || 'Completás el formulario',
            step3_descripcion: como?.steps?.[2]?.descripcion || '',
            step4_titulo: como?.steps?.[3]?.titulo || '',
            step4_descripcion: como?.steps?.[3]?.descripcion || '',
            bg_color: getStr(como, 'bg_color') || '',
            text_color: getStr(como, 'text_color') || '',
        },
    })

    /** Formulario Servicios */
    const serviciosForm = useForm<ServiciosValues>({
        resolver: zodResolver(serviciosSchema),
        defaultValues: {
            title: getStr(servicios, 'title') || 'Nuestros Servicios',
            subtitle: getStr(servicios, 'subtitle'),
            items: servicios?.items && servicios.items.length > 0
                ? servicios.items
                : [
                    { title: '', description: '', image: '', cta_text: 'Ver más', cta_url: '#' },
                    { title: '', description: '', image: '', cta_text: 'Ver más', cta_url: '#' },
                ],
            bg_color: getStr(servicios, 'bg_color') || '#fdfbf7',
            text_color: getStr(servicios, 'text_color') || '#472825',
        },
    })

    const { fields: serviciosFields, append: appendServicio, remove: removeServicio } = useFieldArray({
        control: serviciosForm.control,
        name: 'items',
    })

    /** Formulario Contacto y Footer */
    const contactoForm = useForm<ContactoValues>({
        resolver: zodResolver(contactoSchema),
        defaultValues: {
            email: getStr(contacto, 'email') || org.email_contacto || '',
            telefono: getStr(contacto, 'telefono'),
            direccion: getStr(contacto, 'direccion'),
            horario: getStr(contacto, 'horario'),
            footer_texto: getStr(footer, 'texto'),
            bg_color: getStr(contacto, 'bg_color') || '#fdfbf7',
            text_color: getStr(contacto, 'text_color') || '#472825',
        },
    })

    /** Formulario Correos Automáticos (Mensajes de bienvenida y rechazo) */
    const emailsForm = useForm<EmailsValues>({
        resolver: zodResolver(emailsSchema),
        defaultValues: {
            mail_bienvenida_asunto: org.mail_bienvenida_asunto || 'Recibimos tu postulación',
            mail_bienvenida: org.mail_bienvenida || `Hola [nombre],\n\nRecibimos tu postulación con éxito.\n\nSaludos,\n${org.nombre}`,
            mail_rechazo_asunto: org.mail_rechazo_asunto || 'Actualización sobre tu postulación',
            mail_rechazo: org.mail_rechazo || `Hola [nombre],\n\nLamentablemente no continuamos con tu candidatura.\n\nSaludos,\n${org.nombre}`,
        },
    })

    // ── MANEJADORES DE GUARDADO (Handlers) ────────────────────────────────────
    // Se dividen por sección para permitir guardados parciales.

    /** Guarda información general en la tabla 'organizations' */
    const onSaveGeneral = async (data: GeneralValues) => {
        try {
            await updateOrgGeneral(data)
            toast.success('Información guardada')
        } catch { toast.error('Error al guardar') }
    }

    /** Guarda los ítems del navbar */
    const onSaveNavItems = async () => {
        setSavingNav(true)
        try {
            await updateOrgNavItems(navItemsSelected)
            toast.success('Navegación guardada')
        } catch { toast.error('Error al guardar la navegación') }
        finally { setSavingNav(false) }
    }

    /** Guarda/Actualiza la sección Hero en 'landing_sections' */
    const onSaveHero = async (data: HeroValues) => {
        try {
            await upsertSection('hero', data, 1)
            toast.success('Hero guardado')
        } catch { toast.error('Error al guardar') }
    }

    /** Guarda/Actualiza la sección Quiénes Somos en 'landing_sections' */
    const onSaveQuienesSomos = async (data: QuienesSomosValues) => {
        try {
            await upsertSection('quienes_somos', data, 2)
            toast.success('Quiénes somos guardado')
        } catch { toast.error('Error al guardar') }
    }

    /** Procesa y guarda los pasos de postulación (convirtiendo campos planos en array) */
    const onSaveComoPostularse = async (data: ComoPostularseValues) => {
        try {
            const steps = [
                { numero: 1, titulo: data.step1_titulo, descripcion: data.step1_descripcion },
                { numero: 2, titulo: data.step2_titulo, descripcion: data.step2_descripcion },
                { numero: 3, titulo: data.step3_titulo, descripcion: data.step3_descripcion },
                ...(data.step4_titulo ? [{ numero: 4, titulo: data.step4_titulo, descripcion: data.step4_descripcion || '' }] : []),
            ]
            await upsertSection('como_postularse', { title: data.title, steps, bg_color: data.bg_color, text_color: data.text_color }, 3)
            toast.success('Pasos guardados')
        } catch { toast.error('Error al guardar') }
    }

    /** Guarda/Actualiza la sección Servicios en 'landing_sections' */
    const onSaveServicios = async (data: ServiciosValues) => {
        try {
            await upsertSection('servicios', data, 3)
            toast.success('Servicios guardados')
        } catch { toast.error('Error al guardar') }
    }

    /** Guarda Contacto y Footer como dos secciones independientes en 'landing_sections' */
    const onSaveContacto = async (data: ContactoValues) => {
        try {
            await Promise.all([
                upsertSection('contacto', {
                    email: data.email,
                    telefono: data.telefono,
                    direccion: data.direccion,
                    horario: data.horario,
                    bg_color: data.bg_color,
                    text_color: data.text_color,
                }, 4),
                upsertSection('footer', { texto: data.footer_texto || '' }, 5),
            ])
            toast.success('Contacto y footer guardados')
        } catch { toast.error('Error al guardar') }
    }

    /** Guarda la configuración de correos en la tabla 'organizations' */
    const onSaveEmails = async (data: EmailsValues) => {
        try {
            await updateOrgEmails(data)
            toast.success('Correos automáticos guardados')
        } catch { toast.error('Error al guardar') }
    }

    /** Gestiona la subida del logo a Supabase Storage y actualiza la URL en la DB */
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validaciones básicas de tipo y tamaño
        const allowed = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']
        if (!allowed.includes(file.type)) { toast.error('Solo PNG, SVG, JPG o WEBP'); return }
        if (file.size > 2 * 1024 * 1024) { toast.error('Máx. 2 MB'); return }

        setUploadingLogo(true)
        try {
            const url = await updateOrgLogo(file)
            setLogoUrl(url)
            toast.success('Logo actualizado')
        } catch { toast.error('Error al subir el logo') }
        finally { setUploadingLogo(false); e.target.value = '' }
    }

    // ── COMPONENTES DE INTERFAZ (Helpers) ─────────────────────────────────────

    /** Contenedor estilizado para cada grupo de campos */
    const SectionCard = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
        <div className="border rounded-xl p-5 bg-card space-y-4">
            <div>
                <h2 className="text-sm font-medium">{title}</h2>
                {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
            </div>
            {children}
        </div>
    )

    /** Botonera estándar de guardado/cancelado para los formularios */
    const FormActions = ({ form, onReset }: { form: any; onReset: () => void }) => (
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onReset}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar cambios
            </Button>
        </div>
    )

    /**
     * Campo de imagen con subida desde el dispositivo.
     * Al seleccionar un archivo lo sube a Storage y actualiza el campo del form con la URL pública.
     * También acepta pegar una URL manualmente como fallback.
     */
    const SectionImageUpload = ({
        value,
        onChange,
        slot,
        label = 'Imagen',
    }: {
        value: string
        onChange: (url: string) => void
        slot: string
        label?: string
    }) => {
        const [uploading, setUploading] = useState(false)

        const handleFile = async (file: File) => {
            const allowed = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']
            if (!allowed.includes(file.type)) { toast.error('Solo PNG, SVG, JPG o WEBP'); return }
            if (file.size > 5 * 1024 * 1024) { toast.error('Máx. 5 MB'); return }
            setUploading(true)
            try {
                const url = await uploadSectionImage(file, slot)
                onChange(url)
                toast.success('Imagen subida')
            } catch {
                toast.error('Error al subir la imagen')
            } finally {
                setUploading(false)
            }
        }

        return (
            <div className="space-y-2">
                <p className="text-sm font-medium">{label} <span className="text-muted-foreground">(opcional)</span></p>

                {/* Preview o zona de subida */}
                <label className="cursor-pointer block">
                    <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2 py-2">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Subiendo imagen...</p>
                            </div>
                        ) : value ? (
                            <div className="flex flex-col items-center gap-2">
                                <img src={value} alt="Preview" className="h-28 w-full object-cover rounded-lg" />
                                <p className="text-xs text-primary">Click para reemplazar</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-xs font-medium">Subir imagen</p>
                                <p className="text-xs text-muted-foreground">PNG · JPG · WEBP · máx. 5 MB</p>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.webp,.svg"
                        disabled={uploading}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
                    />
                </label>

                {/* URL manual como fallback */}
                <Input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="O pegá una URL externa: https://..."
                    className="text-xs"
                />

                {/* Botón limpiar */}
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                        × Quitar imagen
                    </button>
                )}
            </div>
        )
    }

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-6 p-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Settings className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Configuración</h1>
                    <p className="text-sm text-muted-foreground">Personalizá tu organización y la landing page pública</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-muted border rounded-lg p-1 w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'px-4 py-1.5 text-sm rounded-md transition-colors',
                            activeTab === tab.id
                                ? 'bg-background text-foreground font-medium shadow-sm border'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB GENERAL ──────────────────────────────────────────────── */}
            {activeTab === 'general' && (
                <>
                    <Form {...generalForm}>
                        <form onSubmit={generalForm.handleSubmit(onSaveGeneral)} className="flex flex-col gap-4">
                            <SectionCard title="Datos de la organización" desc="Información general usada en toda la plataforma.">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={generalForm.control} name="nombre" render={({ field }) => (
                                        <FormItem><FormLabelWithCounter label="Nombre" current={field.value?.length} max={100} /><FormControl><Input {...field} maxLength={100} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={generalForm.control} name="email_contacto" render={({ field }) => (
                                        <FormItem><FormLabel>Email de contacto</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={generalForm.control} name="whatsapp" render={({ field }) => (
                                    <FormItem><FormLabelWithCounter label="WhatsApp" current={field.value?.length} max={20} optional /><FormControl><Input {...field} maxLength={20} placeholder="+54 341 555 1234" /></FormControl></FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={generalForm.control} name="color_primario" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color primario</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={field.value} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                    <Input {...field} placeholder="#1E3A5F" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={generalForm.control} name="color_secundario" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color secundario</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={field.value} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                    <Input {...field} placeholder="#378ADD" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Logo" desc="PNG, SVG, JPG o WEBP · máx. 2 MB">
                                <label className="cursor-pointer block">
                                    <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
                                        {uploadingLogo ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Subiendo logo...</p>
                                            </div>
                                        ) : logoUrl ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
                                                <p className="text-xs text-primary">Click para reemplazar</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-primary" />
                                                </div>
                                                <p className="text-sm font-medium">Subir logo</p>
                                                <p className="text-xs text-muted-foreground">PNG · SVG · JPG · máx. 2 MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept=".png,.svg,.jpg,.jpeg,.webp" onChange={handleLogoUpload} disabled={uploadingLogo} />
                                </label>
                            </SectionCard>

                            <FormActions form={generalForm} onReset={() => generalForm.reset()} />
                        </form>
                    </Form>

                    {/* ── Card de navegación ── */}
                    <SectionCard title="Menú de navegación" desc="Elegí qué ítems se muestran en la barra de navegación de tu landing.">
                        <div className="flex flex-col gap-3">
                            {ALL_NAV_ITEMS.map(item => (
                                <label key={item.id} className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={navItemsSelected.includes(item.id)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setNavItemsSelected(prev => [...prev, item.id])
                                            } else {
                                                setNavItemsSelected(prev => prev.filter(id => id !== item.id))
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary"
                                    />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={onSaveNavItems} disabled={savingNav}>
                                {savingNav && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Guardar navegación
                            </Button>
                        </div>
                    </SectionCard>

                    {/* ── Card de cobro (fuera del form para guardado independiente) ── */}
                    <SectionCard
                        title="Cobro por postulación"
                        desc="Activá esta opción si querés cobrar un arancel a los candidatos antes de acceder al formulario de postulación (via Mercado Pago)."
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cobroPostulacion ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {cobroPostulacion ? 'Pago requerido' : 'Acceso gratuito'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {cobroPostulacion
                                            ? `Los candidatos deben abonar $${montoPostulacion.toLocaleString('es-AR')} ARS para postularse.`
                                            : 'Los candidatos acceden al formulario directamente sin pagar.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={savingCobro}
                                onClick={async () => {
                                    const nuevoValor = !cobroPostulacion
                                    setSavingCobro(true)
                                    try {
                                        await updateOrgPago(nuevoValor, montoPostulacion)
                                        setCobroPostulacion(nuevoValor)
                                        toast.success(nuevoValor ? 'Pago habilitado' : 'Acceso gratuito habilitado')
                                    } catch {
                                        toast.error('Error al guardar')
                                    } finally {
                                        setSavingCobro(false)
                                    }
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 ${cobroPostulacion ? 'bg-primary' : 'bg-muted-foreground/30'
                                    }`}
                                role="switch"
                                aria-checked={cobroPostulacion}
                            >
                                {savingCobro ? (
                                    <Loader2 className="absolute left-1/2 -translate-x-1/2 h-3 w-3 animate-spin text-white" />
                                ) : (
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${cobroPostulacion ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                )}
                            </button>
                        </div>

                        {cobroPostulacion && (
                            <div className="mt-4 pt-4 border-t border-border space-y-3">
                                <div>
                                    <label htmlFor="monto-postulacion" className="text-sm font-medium">
                                        Monto a cobrar (ARS)
                                    </label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Ingresá el monto que los candidatos deberán pagar para acceder al formulario de postulación.
                                    </p>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                            <Input
                                                id="monto-postulacion"
                                                type="number"
                                                min={100}
                                                step={100}
                                                value={montoPostulacion}
                                                onChange={(e) => setMontoPostulacion(Number(e.target.value))}
                                                className="pl-7"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={savingCobro}
                                            onClick={async () => {
                                                if (montoPostulacion < 100) {
                                                    toast.error('El monto mínimo es $100 ARS')
                                                    return
                                                }
                                                setSavingCobro(true)
                                                try {
                                                    await updateOrgPago(cobroPostulacion, montoPostulacion)
                                                    toast.success(`Monto actualizado a $${montoPostulacion.toLocaleString('es-AR')} ARS`)
                                                } catch {
                                                    toast.error('Error al guardar el monto')
                                                } finally {
                                                    setSavingCobro(false)
                                                }
                                            }}
                                        >
                                            {savingCobro ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar monto'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* ── Widget de Mercado Pago ── */}
                    {cobroPostulacion && (
                        <MercadoPagoConnect
                            mpConnected={mpConnected}
                            mpUserId={mpUserId}
                        />
                    )}

                    {/* ── Links de cortesía (Bypass de pago) ── */}
                    {cobroPostulacion && (
                        <SectionCard
                            title="Links de postulación de cortesía (Bypass de pago)"
                            desc="Si un candidato ya pagó pero tuvo un problema técnico (como cerrar la ventana o perder la sesión), podés generarle un link único para que se postule de forma gratuita. Este link es de un solo uso y expira en 24 horas."
                        >
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={async () => {
                                            setGeneratingLink(true)
                                            try {
                                                const res = await fetch('/api/admin/payments/free-token', { method: 'POST' })
                                                const data = await res.json()
                                                if (data.success) {
                                                    const url = `${window.location.origin}/${data.slug}/postularse?token=${data.token}`
                                                    setGeneratedLink(url)
                                                    toast.success('Link generado exitosamente')
                                                } else {
                                                    toast.error(data.error || 'Error al generar link')
                                                }
                                            } catch {
                                                toast.error('Error de red al generar link')
                                            } finally {
                                                setGeneratingLink(false)
                                            }
                                        }}
                                        disabled={generatingLink}
                                        className="w-fit"
                                    >
                                        {generatingLink && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Generar link de cortesía
                                    </Button>
                                    {generatedLink && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setGeneratedLink('')
                                            }}
                                        >
                                            Limpiar
                                        </Button>
                                    )}
                                </div>

                                {generatedLink && (
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-xl border">
                                        <input
                                            type="text"
                                            readOnly
                                            value={generatedLink}
                                            className="flex-1 bg-transparent text-xs outline-none select-all font-mono"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(generatedLink)
                                                toast.success('Copiado al portapapeles')
                                            }}
                                        >
                                            Copiar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}
                </>
            )}

            {/* ── TAB HERO ─────────────────────────────────────────────────── */}
            {activeTab === 'hero' && (
                <Form {...heroForm}>
                    <form onSubmit={heroForm.handleSubmit(onSaveHero)} className="flex flex-col gap-4">
                        <SectionCard title="Sección Hero" desc="Primera sección visible de la landing. Lo primero que ve el candidato.">
                            <FormField control={heroForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Título principal" current={field.value?.length} max={50} /><FormControl><Input {...field} maxLength={50} placeholder="Conectamos el talento con las mejores oportunidades" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={heroForm.control} name="subtitle" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Subtítulo" current={field.value?.length} max={120} /><FormControl><Textarea {...field} maxLength={120} placeholder="Somos especialistas en reclutamiento..." /></FormControl></FormItem>
                            )} />
                            <FormField control={heroForm.control} name="cta_tertiary_text" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Subtítulo 2" current={field.value?.length} max={60} /><FormControl><Textarea {...field} maxLength={60} placeholder="Consultora de Recursos Humanos" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={heroForm.control} name="cta_text" render={({ field }) => (
                                    <FormItem><FormLabelWithCounter label="Texto botón principal" current={field.value?.length} max={30} /><FormControl><Input {...field} maxLength={30} placeholder="Quiero postularme" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={heroForm.control} name="cta_url" render={({ field }) => (
                                    <FormItem><FormLabel>URL botón principal</FormLabel><FormControl><Input {...field} placeholder="https://... o #seccion" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={heroForm.control} name="cta_secondary_text" render={({ field }) => (
                                    <FormItem><FormLabelWithCounter label="Texto botón secundario" current={field.value?.length} max={30} optional /><FormControl><Input {...field} maxLength={30} placeholder="Quiénes somos" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={heroForm.control} name="cta_secondary_url" render={({ field }) => (
                                    <FormItem><FormLabel>URL botón secundario <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="https://... o #seccion (por defecto #vacantes)" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={heroForm.control} name="background_image" render={({ field }) => (
                                <FormItem><FormLabel>URL de imagen de fondo <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl></FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={heroForm.control} name="bg_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de fondo</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#ffffff'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#ffffff" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={heroForm.control} name="text_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de texto</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#472825'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#472825" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </SectionCard>
                        <FormActions form={heroForm} onReset={() => heroForm.reset()} />
                    </form>
                </Form>
            )}

            {/* ── TAB QUIÉNES SOMOS ────────────────────────────────────────── */}
            {activeTab === 'quienes_somos' && (
                <Form {...quienesSomosForm}>
                    <form onSubmit={quienesSomosForm.handleSubmit(onSaveQuienesSomos)} className="flex flex-col gap-4">
                        <SectionCard title="Quiénes somos" desc="Sección informativa sobre la consultora.">
                            <FormField control={quienesSomosForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Título" current={field.value?.length} max={60} /><FormControl><Input {...field} maxLength={60} placeholder="Más de 10 años conectando talento" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={quienesSomosForm.control} name="description" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Subtitulo" current={field.value?.length} max={600} /><FormControl><Textarea {...field} maxLength={600} rows={4} placeholder="Somos una consultora especializada en..." /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={quienesSomosForm.control} name="description_two" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Descripción" current={field.value?.length} max={600} /><FormControl><Textarea {...field} maxLength={600} rows={4} placeholder="Somos una consultora especializada en..." /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={quienesSomosForm.control} name="image" render={({ field }) => (
                                <FormItem><FormLabel>URL de imagen <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl></FormItem>
                            )} />
                        </SectionCard>
                        <SectionCard title="Cards" desc="Sección informativa sobre la consultora.">
                            {fields.map((card, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={quienesSomosForm.control}
                                        name={`cards.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem><FormLabelWithCounter label="Título" current={field.value?.length} max={40} /><FormControl><Input {...field} maxLength={40} placeholder="Título de la card" /></FormControl><FormMessage /></FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={quienesSomosForm.control}
                                        name={`cards.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem><FormLabelWithCounter label="Descripción" current={field.value?.length} max={150} /><FormControl><Input {...field} maxLength={150} placeholder="Descripción de la card" /></FormControl><FormMessage /></FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => remove(index)}
                                        className="mt-6"
                                    >
                                        Eliminar Card
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({ title: '', description: '' })}
                                className="mt-6"
                            >
                                Agregar Card
                            </Button>
                        </SectionCard>
                        <SectionCard title="Colores de sección">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={quienesSomosForm.control} name="bg_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de fondo</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#ffffff'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#ffffff" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={quienesSomosForm.control} name="text_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de texto</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#472825'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#472825" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </SectionCard>
                        <FormActions form={quienesSomosForm} onReset={() => quienesSomosForm.reset()} />
                    </form>
                </Form>
            )}

            {/* ── TAB CÓMO POSTULARSE ──────────────────────────────────────── */}
            {activeTab === 'como_postularse' && (
                <Form {...comoPostularseForm}>
                    <form onSubmit={comoPostularseForm.handleSubmit(onSaveComoPostularse)} className="flex flex-col gap-4">
                        <SectionCard title="Cómo postularse" desc="Los pasos que ve el candidato antes de postularse.">
                            <FormField control={comoPostularseForm.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabelWithCounter label="Título de la sección" current={field.value?.length} max={60} />
                                    <FormControl>
                                        <Input {...field} maxLength={60} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </SectionCard>

                        {[1, 2, 3, 4].map(n => (
                            <SectionCard key={n} title={`Paso ${n}${n === 4 ? ' (opcional)' : ''}`}>
                                <FormField control={comoPostularseForm.control} name={`step${n}_titulo` as any} render={({ field }) => (
                                    <FormItem>
                                        <FormLabelWithCounter label="Título" current={field.value?.length} max={50} />
                                        <FormControl>
                                            <Input {...field} maxLength={50} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={comoPostularseForm.control} name={`step${n}_descripcion` as any} render={({ field }) => (
                                    <FormItem>
                                        <FormLabelWithCounter label="Descripción" current={field.value?.length} max={200} />
                                        <FormControl>
                                            <Textarea {...field} maxLength={200} rows={2} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </SectionCard>
                        ))}
                        <SectionCard title="Colores de sección">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={comoPostularseForm.control} name="bg_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de fondo</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#ffffff'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#ffffff" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={comoPostularseForm.control} name="text_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de texto</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#472825'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#472825" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </SectionCard>

                        <FormActions form={comoPostularseForm} onReset={() => comoPostularseForm.reset()} />
                    </form>
                </Form>
            )}

            {/* ── TAB SERVICIOS ────────────────────────────────────────────── */}
            {activeTab === 'servicios' && (
                <Form {...serviciosForm}>
                    <form onSubmit={serviciosForm.handleSubmit(onSaveServicios)} className="flex flex-col gap-4">
                        <SectionCard
                            title="Sección Servicios"
                            desc="Presentá los servicios o propuestas de valor con imagen, título, descripción y botón de acción."
                        >
                            <FormField control={serviciosForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Título de la sección" current={field.value?.length} max={60} /><FormControl><Input {...field} maxLength={60} placeholder="Nuestros Servicios" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={serviciosForm.control} name="subtitle" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Subtítulo" optional current={field.value?.length} max={200} /><FormControl><Textarea {...field} maxLength={200} rows={2} placeholder="Descripción general de los servicios..." /></FormControl></FormItem>
                            )} />
                        </SectionCard>

                        {serviciosFields.map((item, index) => (
                            <SectionCard
                                key={item.id}
                                title={`Servicio ${index + 1}`}
                                desc={index % 2 === 0 ? 'Imagen a la izquierda, texto a la derecha.' : 'Texto a la izquierda, imagen a la derecha.'}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={serviciosForm.control} name={`items.${index}.title`} render={({ field }) => (
                                        <FormItem><FormLabelWithCounter label="Título" current={field.value?.length} max={60} /><FormControl><Input {...field} maxLength={60} placeholder="Nombre del servicio" /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField
                                        control={serviciosForm.control}
                                        name={`items.${index}.image`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <SectionImageUpload
                                                        value={field.value ?? ''}
                                                        onChange={field.onChange}
                                                        slot={`servicios_${index}`}
                                                        label="Imagen"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField control={serviciosForm.control} name={`items.${index}.description`} render={({ field }) => (
                                    <FormItem><FormLabelWithCounter label="Descripción" current={field.value?.length} max={300} /><FormControl><Textarea {...field} maxLength={300} rows={3} placeholder="Descripción del servicio..." /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={serviciosForm.control} name={`items.${index}.cta_text`} render={({ field }) => (
                                        <FormItem><FormLabelWithCounter label="Texto del botón" optional current={field.value?.length} max={30} /><FormControl><Input {...field} maxLength={30} placeholder="Ver más" /></FormControl></FormItem>
                                    )} />
                                    <FormField control={serviciosForm.control} name={`items.${index}.cta_url`} render={({ field }) => (
                                        <FormItem><FormLabel>URL del botón <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="https://... o #seccion" /></FormControl></FormItem>
                                    )} />
                                </div>
                                {serviciosFields.length > 1 && (
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeServicio(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            Eliminar servicio
                                        </Button>
                                    </div>
                                )}
                            </SectionCard>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendServicio({ title: '', description: '', image: '', cta_text: 'Ver más', cta_url: '#' })}
                        >
                            + Agregar servicio
                        </Button>

                        <SectionCard title="Colores de sección">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={serviciosForm.control} name="bg_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de fondo</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#fdfbf7'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#fdfbf7" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={serviciosForm.control} name="text_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de texto</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#472825'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#472825" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </SectionCard>
                        <FormActions form={serviciosForm} onReset={() => serviciosForm.reset()} />
                    </form>
                </Form>
            )}

            {/* ── TAB CONTACTO ─────────────────────────────────────────────── */}
            {activeTab === 'contacto' && (
                <Form {...contactoForm}>
                    <form onSubmit={contactoForm.handleSubmit(onSaveContacto)} className="flex flex-col gap-4">
                        <SectionCard title="Contacto" desc="Datos que aparecen en la sección de contacto.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={contactoForm.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={contactoForm.control} name="telefono" render={({ field }) => (
                                    <FormItem><FormLabelWithCounter label="Teléfono" optional current={field.value?.length} max={30} /><FormControl><Input {...field} maxLength={30} /></FormControl></FormItem>
                                )} />
                                <FormField control={contactoForm.control} name="direccion" render={({ field }) => (
                                    <FormItem><FormLabelWithCounter label="Dirección" optional current={field.value?.length} max={100} /><FormControl><Input {...field} maxLength={100} /></FormControl></FormItem>
                                )} />
                                <FormField control={contactoForm.control} name="horario" render={({ field }) => (
                                    <FormItem><FormLabelWithCounter label="Horario" optional current={field.value?.length} max={100} /><FormControl><Input {...field} maxLength={100} placeholder="Lun–Vie 9:00 a 18:00" /></FormControl></FormItem>
                                )} />
                            </div>
                        </SectionCard>

                        <SectionCard title="Footer" desc="Texto que aparece al pie de la landing.">
                            <FormField control={contactoForm.control} name="footer_texto" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Texto del footer" current={field.value?.length} max={300} /><FormControl><Input {...field} maxLength={300} placeholder={`© ${new Date().getFullYear()} ${org.nombre}`} /></FormControl></FormItem>
                            )} />
                        </SectionCard>

                        <SectionCard title="Colores de sección">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={contactoForm.control} name="bg_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de fondo</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#fdfbf7'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#fdfbf7" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={contactoForm.control} name="text_color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de texto</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={field.value || '#472825'} onChange={e => field.onChange(e.target.value)} className="w-9 h-9 rounded-md border cursor-pointer" />
                                                <Input {...field} placeholder="#472825" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </SectionCard>

                        <FormActions form={contactoForm} onReset={() => contactoForm.reset()} />
                    </form>
                </Form>
            )}

            {/* ── TAB EMAILS ───────────────────────────────────────────────── */}
            {activeTab === 'emails' && (
                <Form {...emailsForm}>
                    <form onSubmit={emailsForm.handleSubmit(onSaveEmails)} className="flex flex-col gap-4">
                        <SectionCard
                            title="Correo de bienvenida"
                            desc="Se envía automáticamente al registrarse un candidato."
                        >
                            <p className="text-xs text-muted-foreground -mt-2">
                                Usá <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">[nombre]</code> para personalizar el mensaje.
                            </p>
                            <FormField control={emailsForm.control} name="mail_bienvenida_asunto" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Asunto" current={field.value?.length} max={100} /><FormControl><Input {...field} maxLength={100} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={emailsForm.control} name="mail_bienvenida" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Cuerpo del mensaje" current={field.value?.length} max={2000} /><FormControl><Textarea {...field} maxLength={2000} rows={6} className="resize-none font-mono text-xs" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </SectionCard>

                        <SectionCard
                            title="Correo de rechazo"
                            desc="Se envía cuando marcás un candidato como descalificado."
                        >
                            <p className="text-xs text-muted-foreground -mt-2">
                                Usá <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">[nombre]</code> para personalizar el mensaje.
                            </p>
                            <FormField control={emailsForm.control} name="mail_rechazo_asunto" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Asunto" current={field.value?.length} max={100} /><FormControl><Input {...field} maxLength={100} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={emailsForm.control} name="mail_rechazo" render={({ field }) => (
                                <FormItem><FormLabelWithCounter label="Cuerpo del mensaje" current={field.value?.length} max={2000} /><FormControl><Textarea {...field} maxLength={2000} rows={6} className="resize-none font-mono text-xs" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </SectionCard>

                        <FormActions form={emailsForm} onReset={() => emailsForm.reset()} />
                    </form>
                </Form>
            )}
        </div>
    )
}