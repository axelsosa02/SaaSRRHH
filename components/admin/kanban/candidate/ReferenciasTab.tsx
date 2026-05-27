'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2, Loader2, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getReferences, addReference, deleteReference } from '@/lib/services/kanban/candidateProfile'
import type { Reference } from '@/types/database'

const refSchema = z.object({
    nombre: z.string().min(1, 'Requerido'),
    empresa: z.string().optional(),
    cargo: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    relacion: z.string().optional(),
})

type RefValues = z.infer<typeof refSchema>

interface Props {
    candidateId: string
}

export function ReferenciasTab({ candidateId }: Props) {
    const [references, setReferences] = useState<Reference[]>([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchRefs = async () => {
        const data = await getReferences(candidateId)
        setReferences(data)
    }

    useEffect(() => { fetchRefs() }, [candidateId])

    const form = useForm<RefValues>({
        resolver: zodResolver(refSchema),
        defaultValues: { nombre: '', empresa: '', cargo: '', telefono: '', email: '', relacion: '' },
    })

    const onSubmit = async (data: RefValues) => {
        setLoading(true)
        try {
            await addReference(candidateId, data)
            toast.success('Referencia agregada')
            form.reset()
            setShowModal(false)
            fetchRefs()
        } catch {
            toast.error('Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteReference(id)
            toast.success('Referencia eliminada')
            fetchRefs()
        } catch {
            toast.error('Error al eliminar')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Referencias</h2>
                <Button size="sm" variant="outline" onClick={() => setShowModal(true)}>
                    <Plus className="h-3 w-3 mr-1" /> Agregar
                </Button>
            </div>

            {references.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin referencias registradas.</p>
            ) : (
                <div className="space-y-3">
                    {references.map(ref => (
                        <div key={ref.id} className="border rounded-lg p-4 flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{ref.nombre}</p>
                                {(ref.cargo || ref.empresa) && (
                                    <p className="text-xs text-muted-foreground">
                                        {ref.cargo}{ref.cargo && ref.empresa ? ' — ' : ''}{ref.empresa}
                                    </p>
                                )}
                                {ref.relacion && (
                                    <p className="text-xs text-muted-foreground">Relación: {ref.relacion}</p>
                                )}
                                <div className="flex gap-3 mt-1 flex-wrap">
                                    {ref.telefono && (
                                        <a href={`tel:${ref.telefono}`} className="text-xs text-primary hover:underline">
                                            {ref.telefono}
                                        </a>
                                    )}
                                    {ref.email && (
                                        <a href={`mailto:${ref.email}`} className="text-xs text-primary hover:underline">
                                            {ref.email}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(ref.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Agregar referencia</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="nombre" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre completo</FormLabel>
                                    <FormControl><Input {...field} placeholder="Ej: Juan Pérez" disabled={loading} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="empresa" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                        <FormControl><Input {...field} disabled={loading} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="cargo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                        <FormControl><Input {...field} disabled={loading} /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="telefono" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                        <FormControl><Input {...field} disabled={loading} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                        <FormControl><Input {...field} type="email" disabled={loading} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="relacion" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Relación <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej: Jefe directo, colega, cliente..." disabled={loading} />
                                    </FormControl>
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={loading}>Cancelar</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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