'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2, Loader2, Pencil } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
    getWorkHistory, addWorkHistory, deleteWorkHistory,
    getEducation, addEducation,
    getEvaluation, upsertEvaluation,
} from '@/lib/services/kanban/candidateProfile'
import type { WorkHistory, Education, Evaluation } from '@/types/database'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const workSchema = z.object({
    empresa: z.string().min(1, 'Requerido'),
    cargo: z.string().min(1, 'Requerido'),
    localidad: z.string().optional(),
    fecha_inicio: z.string().min(1, 'Requerido'),
    fecha_fin: z.string().optional(),
    actual: z.boolean(),
    descripcion: z.string().optional(),
})

const educationSchema = z.object({
    institucion: z.string().min(1, 'Requerido'),
    titulo: z.string().min(1, 'Requerido'),
    fecha_inicio: z.string().min(1, 'Requerido'),
    fecha_fin: z.string().optional(),
})

type WorkValues = z.infer<typeof workSchema>
type EducationValues = z.infer<typeof educationSchema>

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
    candidateId: string
    jobId: string
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ExperienciaTab({ candidateId, jobId }: Props) {
    const [workHistory, setWorkHistory] = useState<WorkHistory[]>([])
    const [education, setEducation] = useState<Education[]>([])
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
    const [evalNotas, setEvalNotas] = useState('')
    const [savingEval, setSavingEval] = useState(false)
    const [showWorkModal, setShowWorkModal] = useState(false)
    const [showEduModal, setShowEduModal] = useState(false)
    const [loadingWork, setLoadingWork] = useState(false)
    const [loadingEdu, setLoadingEdu] = useState(false)

    const fetchAll = async () => {
        const [wh, edu, ev] = await Promise.all([
            getWorkHistory(candidateId),
            getEducation(candidateId),
            getEvaluation(candidateId, jobId),
        ])
        setWorkHistory(wh)
        setEducation(edu)
        setEvaluation(ev)
        setEvalNotas(ev?.notas || '')
    }

    useEffect(() => { fetchAll() }, [candidateId])

    // ── Formulario trabajo ────────────────────────────────────────────────────

    const workForm = useForm<WorkValues>({
        resolver: zodResolver(workSchema),
        defaultValues: { empresa: '', cargo: '', localidad: '', fecha_inicio: '', fecha_fin: '', actual: false, descripcion: '' },
    })

    const onSubmitWork = async (data: WorkValues) => {
        setLoadingWork(true)
        try {
            await addWorkHistory(candidateId, data)
            toast.success('Experiencia agregada')
            workForm.reset()
            setShowWorkModal(false)
            fetchAll()
        } catch { toast.error('Error al guardar') }
        finally { setLoadingWork(false) }
    }

    const handleDeleteWork = async (id: string) => {
        try {
            await deleteWorkHistory(id)
            toast.success('Eliminado')
            fetchAll()
        } catch { toast.error('Error al eliminar') }
    }

    // ── Formulario educación ──────────────────────────────────────────────────

    const eduForm = useForm<EducationValues>({
        resolver: zodResolver(educationSchema),
        defaultValues: { institucion: '', titulo: '', fecha_inicio: '', fecha_fin: '' },
    })

    const onSubmitEdu = async (data: EducationValues) => {
        setLoadingEdu(true)
        try {
            await addEducation(candidateId, data)
            toast.success('Educación agregada')
            eduForm.reset()
            setShowEduModal(false)
            fetchAll()
        } catch { toast.error('Error al guardar') }
        finally { setLoadingEdu(false) }
    }

    // ── Evaluación ────────────────────────────────────────────────────────────

    const handleSaveEval = async () => {
        setSavingEval(true)
        try {
            await upsertEvaluation(candidateId, evalNotas, jobId)
            toast.success('Evaluación guardada')
        } catch { toast.error('Error al guardar evaluación') }
        finally { setSavingEval(false) }
    }

    return (
        <div className="space-y-8">

            {/* ── Resumen / Evaluación ─────────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">Ficha de evaluación</h2>
                </div>
                <Textarea
                    value={evalNotas}
                    onChange={e => setEvalNotas(e.target.value)}
                    placeholder="Notas sobre la entrevista, impresiones, observaciones..."
                    rows={4}
                    className="resize-none"
                />
                <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={handleSaveEval} disabled={savingEval}>
                        {savingEval && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                        Guardar evaluación
                    </Button>
                </div>
            </section>

            {/* ── Historial de trabajo ─────────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">Historial de trabajo</h2>
                    <Button size="sm" variant="outline" onClick={() => setShowWorkModal(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Agregar
                    </Button>
                </div>

                {workHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin historial registrado.</p>
                ) : (
                    <div className="space-y-3">
                        {workHistory.map(item => (
                            <div key={item.id} className="border rounded-lg p-4 flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{item.cargo}</p>
                                    <p className="text-sm text-muted-foreground">{item.empresa}{item.localidad ? ` · ${item.localidad}` : ''}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {item.fecha_inicio} — {item.actual ? 'Actualidad' : item.fecha_fin || ''}
                                    </p>
                                    {item.descripcion && (
                                        <p className="text-xs text-muted-foreground mt-1">{item.descripcion}</p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteWork(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Educación ────────────────────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">Educación</h2>
                    <Button size="sm" variant="outline" onClick={() => setShowEduModal(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Agregar
                    </Button>
                </div>

                {education.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin educación registrada.</p>
                ) : (
                    <div className="space-y-3">
                        {education.map(item => (
                            <div key={item.id} className="border rounded-lg p-4 flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.titulo}</p>
                                    <p className="text-sm text-muted-foreground">{item.institucion}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {item.fecha_inicio}{item.fecha_fin ? ` — ${item.fecha_fin}` : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Modal trabajo ────────────────────────────────────────────── */}
            <Dialog open={showWorkModal} onOpenChange={setShowWorkModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Agregar experiencia laboral</DialogTitle>
                    </DialogHeader>
                    <Form {...workForm}>
                        <form onSubmit={workForm.handleSubmit(onSubmitWork)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={workForm.control} name="empresa" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa</FormLabel>
                                        <FormControl><Input {...field} disabled={loadingWork} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={workForm.control} name="cargo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo</FormLabel>
                                        <FormControl><Input {...field} disabled={loadingWork} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={workForm.control} name="localidad" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Localidad <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                    <FormControl><Input {...field} disabled={loadingWork} /></FormControl>
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={workForm.control} name="fecha_inicio" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha inicio</FormLabel>
                                        <FormControl><Input {...field} placeholder="Ej: Mar 2021" disabled={loadingWork} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={workForm.control} name="fecha_fin" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha fin <span className="text-muted-foreground">(o vacío si actual)</span></FormLabel>
                                        <FormControl><Input {...field} placeholder="Ej: Dic 2023" disabled={loadingWork} /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={workForm.control} name="descripcion" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                    <FormControl><Textarea {...field} rows={2} disabled={loadingWork} /></FormControl>
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowWorkModal(false)} disabled={loadingWork}>Cancelar</Button>
                                <Button type="submit" disabled={loadingWork}>
                                    {loadingWork && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ── Modal educación ──────────────────────────────────────────── */}
            <Dialog open={showEduModal} onOpenChange={setShowEduModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Agregar educación</DialogTitle>
                    </DialogHeader>
                    <Form {...eduForm}>
                        <form onSubmit={eduForm.handleSubmit(onSubmitEdu)} className="space-y-4">
                            <FormField control={eduForm.control} name="institucion" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institución</FormLabel>
                                    <FormControl><Input {...field} placeholder="Ej: UNR" disabled={loadingEdu} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={eduForm.control} name="titulo" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl><Input {...field} placeholder="Ej: Lic. en Sistemas" disabled={loadingEdu} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={eduForm.control} name="fecha_inicio" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año inicio</FormLabel>
                                        <FormControl><Input {...field} placeholder="2018" disabled={loadingEdu} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={eduForm.control} name="fecha_fin" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año fin <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                        <FormControl><Input {...field} placeholder="2023" disabled={loadingEdu} /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowEduModal(false)} disabled={loadingEdu}>Cancelar</Button>
                                <Button type="submit" disabled={loadingEdu}>
                                    {loadingEdu && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}