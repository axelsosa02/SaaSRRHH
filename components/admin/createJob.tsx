'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobsFormProps } from '@/types/forms';
import { createJob, updateJob } from '@/lib/services/puestos/jobs';
import { getAreas } from '@/lib/services/areas/areas';
import { Area } from '@/types/database';


const jobSchema = z.object({
    titulo: z.string().min(1, "El título es requerido"),
    descripcion: z.string().optional(),
    area: z.string().min(1, "Seleccioná un área"),
    modalidad: z.string().min(1, "Seleccioná una modalidad"),
    localidad: z.string().min(1, "La localidad es requerida"),
})

type JobFormValues = z.infer<typeof jobSchema>;

export function JobForm({ isOpen, onClose, job, onSuccess }: JobsFormProps) {
    const [loading, setLoading] = useState(false);
    const [areas, setAreas] = useState<Area[]>([]);

    useEffect(() => {
        const fetchAreas = async () => {
            const data = await getAreas();
            setAreas(data);
        };
        if (isOpen) {
            fetchAreas();
        }
    }, [isOpen]);

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            titulo: '',
            descripcion: '',
            area: '',
            modalidad: '',
            localidad: '',
        },
    });

    useEffect(() => {
        if (job) {
            form.reset({
                titulo: job.titulo,
                descripcion: job.descripcion || '',
                area: job.area,
                modalidad: job.modalidad,
                localidad: job.localidad,
            });
        } else {
            form.reset({
                titulo: '',
                descripcion: '',
                area: '',
                modalidad: '',
                localidad: '',
            });
        }
    }, [job, form, isOpen]);

    const onSubmit = async (data: JobFormValues) => {
        setLoading(true)

        try {
            if (job?.id) {
                await updateJob(job.id, data)
                toast.success('Puesto actualizado correctamente')
            } else {
                await createJob(data)
                toast.success('Puesto creado correctamente')
            }

            onSuccess()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error('Error al guardar el puesto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-2xl sm:max-w-2xl overflow-x-hidden">
                <DialogHeader>
                    <DialogTitle>{job ? 'Editar Puesto' : 'Nuevo Puesto'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="titulo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Puesto</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej: Desarrollador Web" disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Describe lo que hay que hacer..." rows={3} disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Área de Trabajo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger disabled={loading} className="w-full">
                                                    <SelectValue placeholder="Seleccionar área" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {areas.map((a) => (
                                                    <SelectItem key={a.id} value={a.nombre}>
                                                        {a.nombre}
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
                                name="modalidad"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modalidad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger disabled={loading}>
                                                    <SelectValue placeholder="Seleccionar modalidad" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Presencial">Presencial</SelectItem>
                                                <SelectItem value="Remoto">Remoto</SelectItem>
                                                <SelectItem value="Híbrido">Híbrido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="localidad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Localidad</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej: Buenos Aires, Argentina" disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {job ? 'Actualizar' : 'Crear'}
                                    
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
