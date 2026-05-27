'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Job, Area, Experience, Availability } from '@/types/database'
import { toast } from 'react-hot-toast'
import { createCandidate } from '@/lib/services/createCandidate'
import { Loader2, Upload, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const formSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    telefono: z.string().min(8, 'Teléfono inválido'),
    area: z.string().min(2, 'Área de interés inválida'),
    localidad: z.string().min(2, 'Localidad inválida'),
    provincia: z.string().min(2, 'Provincia inválida'),
    cv_url: z.string().optional(),
    jobId: z.string().optional(),
    resumen: z.string().optional(),
    disponibilidad: z.string().min(2, 'Disponibilidad inválida'),
    experiencia: z.string().min(2, 'Experiencia inválida'),
})

interface ApplicationFormProps {
    orgId: string
    jobs: Job[]
    selectedJobId?: string
    colorBrand: string
    experience: Experience[]
    availability: Availability[]
    paymentToken: string
}

export function ApplicationForm({
    orgId,
    jobs,
    selectedJobId,
    colorBrand,
    experience,
    availability,
    paymentToken,
}: ApplicationFormProps) {
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        const ext = file.name.split('.').pop()?.toLowerCase()
        const isAllowedExt = ext && ['pdf', 'doc', 'docx'].includes(ext)

        if (!allowedTypes.includes(file.type) && !isAllowedExt) {
            toast.error('Solo se permiten archivos PDF o Word')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('El archivo no puede superar los 5 MB')
            return
        }

        setSelectedFile(file)
    }

    // Buscamos el nombre del puesto para mostrarlo en el Select
    const selectedJobLabel = selectedJobId
        ? jobs.find(j => j.id === selectedJobId)?.titulo ?? selectedJobId
        : undefined

    //valores por default para el formulario
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            area: '',
            cv_url: '',
            jobId: selectedJobId || 'general',
            resumen: '',
            disponibilidad: '',
            experiencia: '',
            localidad: '',
            provincia: '',
        },
    })

    // Sincronizar el valor si cambia el prop (ej. navegación entre puestos)
    useEffect(() => {
        if (selectedJobId) {
            form.setValue('jobId', selectedJobId)
        }
    }, [selectedJobId, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            let cvUrl = values.cv_url

            if (selectedFile) {
                const supabase = createClient()
                const ext = selectedFile.name.split('.').pop()
                // Usamos un identificador único para el path de almacenamiento del CV
                const path = `cv/${orgId}/temp_${crypto.randomUUID()}.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(path, selectedFile, { upsert: true })

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
                cvUrl = urlData.publicUrl
            }

            const jobId = values.jobId === 'general' ? undefined : values.jobId;

            await createCandidate({
                org_id: orgId,
                nombre: values.nombre,
                apellido: values.apellido,
                email: values.email,
                telefono: values.telefono,
                cv_url: cvUrl || undefined,
                resumen: values.resumen,
                area: values.area,
                disponibilidad: values.disponibilidad,
                experiencia: values.experiencia,
                localidad: values.localidad,
                provincia: values.provincia,
            }, jobId)

            // Marcamos el token de pago como usado para evitar reuso
            await fetch('/api/mercadopago/use-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: paymentToken }),
            })

            toast.success('¡Postulación enviada con éxito!')
            form.reset()
            setSelectedFile(null)
        } catch (error) {
            console.error(error)
            toast.error('Ocurrió un error al enviar tu postulación.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="apellido"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu apellido" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="email@ejemplo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input placeholder="+54 9 11 ..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="localidad"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Localidad</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu localidad" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="provincia"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Provincia</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu provincia" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Área de interés</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Recursos Humanos, Programador, Marketing" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="experiencia"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Experiencia</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    items={experience.map((e) => ({ value: e.id, label: e.description }))}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Seleccioná" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {experience.map((e) => (
                                            <SelectItem key={e.id} value={e.id}>
                                                {e.description}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="disponibilidad"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Disponibilidad</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    items={availability.map((d) => ({ value: d.id, label: d.nombre }))}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Seleccioná" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availability.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="jobId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>¿A qué puesto te postulás?</FormLabel>
                            <Select
                                key={selectedJobId || 'none'}
                                onValueChange={field.onChange}
                                value={field.value}
                                items={[
                                    { value: 'general', label: 'Interés General (Caza talentos)' },
                                    ...jobs.map(job => ({ value: job.id, label: job.titulo }))
                                ]}
                            >
                                <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue placeholder="Seleccioná una opción" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="general">Interés General (Caza talentos)</SelectItem>
                                    {jobs.map(job => (
                                        <SelectItem key={job.id} value={job.id}>
                                            {job.titulo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <FormLabel>Currículum Vitae (CV)</FormLabel>
                    {selectedFile ? (
                        <div className="border rounded-xl p-4 flex items-center justify-between bg-slate-50 border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-[#845F4C] truncate max-w-[200px] sm:max-w-[350px]">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(null)}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            >
                                Quitar
                            </Button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group border-slate-200">
                            <input
                                type="file"
                                className="hidden"
                                id="cv-upload"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center gap-2 w-full h-full">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Upload className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <p className="text-sm font-medium">Hacé click para subir tu CV</p>
                                <p className="text-xs text-muted-foreground">PDF o Word (máx. 5 MB)</p>
                            </label>
                        </div>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="resumen"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Breve resumen profesional (opcional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Contanos un poco sobre vos..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full h-12 text-lg font-bold"
                    disabled={loading}
                    style={{ backgroundColor: "#472825" }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <span className="text-white font-medium cursor-pointer">
                            Enviar Postulación
                        </span>
                    )}
                </Button>
            </form>
        </Form>
    )
}
