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
import { updateOrgGeneral, updateOrgLogo, updateOrgEmails, updateOrgPago, type OrgConfig } from '@/lib/services/configuracion landing/organizacion'
// En tus imports
import type {
    SectionMap,
    HeroContent,
    QuienesSomosContent,
    ComoPostularseContent,
    ContactoContent,
    FooterContent
} from '@/types/landingSections'


/**
 * Tipos de pestañas disponibles en el panel de configuración
 */
type Tab = 'general' | 'hero' | 'quienes_somos' | 'como_postularse' | 'contacto' | 'emails'

/**
 * Definición de las pestañas para la navegación del panel
 */
const TABS: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'hero', label: 'Hero' },
    { id: 'quienes_somos', label: 'Quiénes somos' },
    { id: 'como_postularse', label: 'Cómo postularse' },
    { id: 'contacto', label: 'Contacto y footer' },
    { id: 'emails', label: 'Correos automáticos' },
]

// ─── ESQUEMAS DE VALIDACIÓN (Zod) ──────────────────────────────────────────────
// Se definen por separado para mantener la claridad y facilitar la inferencia de tipos.

/** Esquema para datos básicos y colores de marca de la organización */
const generalSchema = z.object({
    nombre: z.string().min(1, 'Requerido'),
    email_contacto: z.string().email('Email inválido'),
    whatsapp: z.string().optional(),
    color_primario: z.string().min(1, 'Requerido'),
    color_secundario: z.string().min(1, 'Requerido'),
})

const heroSchema = z.object({
    title: z.string().min(1, 'Requerido'),
    subtitle: z.string().optional(),
    cta_text: z.string().min(1, 'Requerido'),
    cta_secondary_text: z.string().optional(),
    cta_secondary_url: z.string().optional(),
    cta_tertiary_text: z.string().optional(),
    background_image: z.string().optional(),
})

const quienesSomosCardSchema = z.object({
    title: z.string().min(1, 'Requerido'),
    description: z.string().min(1, 'Requerido'),
})

const quienesSomosSchema = z.object({
    title: z.string().min(1, 'Requerido'),
    description: z.string().min(1, 'Requerido'),
    description_two: z.string().optional(),
    image: z.string().optional(),
    cards: z.array(quienesSomosCardSchema),
})

const comoPostularseSchema = z.object({
    title: z.string().min(1, 'Requerido'),
    step1_titulo: z.string().min(1, 'Requerido'),
    step1_descripcion: z.string().min(1, 'Requerido'),
    step2_titulo: z.string().min(1, 'Requerido'),
    step2_descripcion: z.string().min(1, 'Requerido'),
    step3_titulo: z.string().min(1, 'Requerido'),
    step3_descripcion: z.string().min(1, 'Requerido'),
    step4_titulo: z.string().optional(),
    step4_descripcion: z.string().optional(),
})

const contactoSchema = z.object({
    email: z.string().email('Email inválido'),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    horario: z.string().optional(),
    footer_texto: z.string().optional(),
})

const emailsSchema = z.object({
    mail_bienvenida_asunto: z.string().min(1, 'Requerido'),
    mail_bienvenida: z.string().min(1, 'Requerido'),
    mail_rechazo_asunto: z.string().min(1, 'Requerido'),
    mail_rechazo: z.string().min(1, 'Requerido'),
})

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

type GeneralValues = z.infer<typeof generalSchema>
type HeroValues = z.infer<typeof heroSchema>
type QuienesSomosValues = z.infer<typeof quienesSomosSchema>
type ComoPostularseValues = z.infer<typeof comoPostularseSchema>
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
    const [savingCobro, setSavingCobro] = useState(false)

    // Estado MP (leído del server, actualizado por el widget)
    const mpConnected = org.mp_connected ?? false
    const mpUserId = org.mp_user_id ?? null

    // Desestructuración de las secciones de la landing para facilitar el acceso
    const hero = sections.hero as HeroContent | undefined
    const quienes = sections.quienes_somos as QuienesSomosContent | undefined
    const como = sections.como_postularse as ComoPostularseContent | undefined
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
            cta_secondary_text: getStr(hero, 'cta_secondary_text'),
            cta_secondary_url: getStr(hero, 'cta_secondary_url'),
            cta_tertiary_text: getStr(hero, 'cta_tertiary_text'),
            background_image: getStr(hero, 'background_image'),
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
        },
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
            await upsertSection('como_postularse', { title: data.title, steps }, 3)
            toast.success('Pasos guardados')
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
                                    <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={generalForm.control} name="email_contacto" render={({ field }) => (
                                    <FormItem><FormLabel>Email de contacto</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={generalForm.control} name="whatsapp" render={({ field }) => (
                                <FormItem><FormLabel>WhatsApp <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="+54 341 555 1234" /></FormControl></FormItem>
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

                {/* ── Card de cobro (fuera del form para guardado independiente) ── */}
                <SectionCard
                    title="Cobro por postulación"
                    desc="Activá esta opción si querés cobrar un arancel a los candidatos antes de acceder al formulario de postulación (via Mercado Pago)."
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                cobroPostulacion ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {cobroPostulacion ? 'Pago requerido' : 'Acceso gratuito'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {cobroPostulacion
                                        ? 'Los candidatos deben abonar $7.000 ARS para postularse.'
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
                                    await updateOrgPago(nuevoValor)
                                    setCobroPostulacion(nuevoValor)
                                    toast.success(nuevoValor ? 'Pago habilitado' : 'Acceso gratuito habilitado')
                                } catch {
                                    toast.error('Error al guardar')
                                } finally {
                                    setSavingCobro(false)
                                }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 ${
                                cobroPostulacion ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`}
                            role="switch"
                            aria-checked={cobroPostulacion}
                        >
                            {savingCobro ? (
                                <Loader2 className="absolute left-1/2 -translate-x-1/2 h-3 w-3 animate-spin text-white" />
                            ) : (
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                                        cobroPostulacion ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            )}
                        </button>
                    </div>
                </SectionCard>

                {/* ── Widget de Mercado Pago ── */}
                {cobroPostulacion && (
                    <MercadoPagoConnect
                        mpConnected={mpConnected}
                        mpUserId={mpUserId}
                    />
                )}
                </>
            )}

            {/* ── TAB HERO ─────────────────────────────────────────────────── */}
            {activeTab === 'hero' && (
                <Form {...heroForm}>
                    <form onSubmit={heroForm.handleSubmit(onSaveHero)} className="flex flex-col gap-4">
                        <SectionCard title="Sección Hero" desc="Primera sección visible de la landing. Lo primero que ve el candidato.">
                            <FormField control={heroForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Título principal</FormLabel><FormControl><Input {...field} placeholder="Conectamos el talento con las mejores oportunidades" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={heroForm.control} name="subtitle" render={({ field }) => (
                                <FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Textarea {...field} rows={2} placeholder="Somos especialistas en reclutamiento..." /></FormControl></FormItem>
                            )} />
                            <FormField control={heroForm.control} name="cta_tertiary_text" render={({ field }) => (
                                <FormItem><FormLabel>Subtítulo 2</FormLabel><FormControl><Textarea {...field} rows={2} placeholder="Consultora de Recursos Humanos" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={heroForm.control} name="cta_text" render={({ field }) => (
                                    <FormItem><FormLabel>Texto botón principal</FormLabel><FormControl><Input {...field} placeholder="Quiero postularme" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={heroForm.control} name="cta_secondary_text" render={({ field }) => (
                                    <FormItem><FormLabel>Texto botón secundario <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="Quiénes somos" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={heroForm.control} name="cta_secondary_url" render={({ field }) => (
                                <FormItem><FormLabel>URL botón secundario <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="https://... o #seccion" /></FormControl></FormItem>
                            )} />
                            <FormField control={heroForm.control} name="background_image" render={({ field }) => (
                                <FormItem><FormLabel>URL de imagen de fondo <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl></FormItem>
                            )} />
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
                                <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} placeholder="Más de 10 años conectando talento" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={quienesSomosForm.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Subtitulo</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Somos una consultora especializada en..." /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={quienesSomosForm.control} name="description_two" render={({ field }) => (
                                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Somos una consultora especializada en..." /></FormControl><FormMessage /></FormItem>
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
                                            <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} placeholder="Título de la card" /></FormControl><FormMessage /></FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={quienesSomosForm.control}
                                        name={`cards.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} placeholder="Descripción de la card" /></FormControl><FormMessage /></FormItem>
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
                                <FormItem><FormLabel>Título de la sección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </SectionCard>

                        {[1, 2, 3, 4].map(n => (
                            <SectionCard key={n} title={`Paso ${n}${n === 4 ? ' (opcional)' : ''}`}>
                                <FormField control={comoPostularseForm.control} name={`step${n}_titulo` as any} render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={comoPostularseForm.control} name={`step${n}_descripcion` as any} render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl></FormItem>
                                )} />
                            </SectionCard>
                        ))}

                        <FormActions form={comoPostularseForm} onReset={() => comoPostularseForm.reset()} />
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
                                    <FormItem><FormLabel>Teléfono <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={contactoForm.control} name="direccion" render={({ field }) => (
                                    <FormItem><FormLabel>Dirección <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={contactoForm.control} name="horario" render={({ field }) => (
                                    <FormItem><FormLabel>Horario <span className="text-muted-foreground">(opcional)</span></FormLabel><FormControl><Input {...field} placeholder="Lun–Vie 9:00 a 18:00" /></FormControl></FormItem>
                                )} />
                            </div>
                        </SectionCard>

                        <SectionCard title="Footer" desc="Texto que aparece al pie de la landing.">
                            <FormField control={contactoForm.control} name="footer_texto" render={({ field }) => (
                                <FormItem><FormLabel>Texto del footer</FormLabel><FormControl><Input {...field} placeholder={`© ${new Date().getFullYear()} ${org.nombre}`} /></FormControl></FormItem>
                            )} />
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
                                <FormItem><FormLabel>Asunto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={emailsForm.control} name="mail_bienvenida" render={({ field }) => (
                                <FormItem><FormLabel>Cuerpo del mensaje</FormLabel><FormControl><Textarea {...field} rows={6} className="resize-none font-mono text-xs" /></FormControl><FormMessage /></FormItem>
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
                                <FormItem><FormLabel>Asunto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={emailsForm.control} name="mail_rechazo" render={({ field }) => (
                                <FormItem><FormLabel>Cuerpo del mensaje</FormLabel><FormControl><Textarea {...field} rows={6} className="resize-none font-mono text-xs" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </SectionCard>

                        <FormActions form={emailsForm} onReset={() => emailsForm.reset()} />
                    </form>
                </Form>
            )}
        </div>
    )
}