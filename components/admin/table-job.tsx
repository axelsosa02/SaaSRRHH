'use client'

import { Eye, EyeOff, Loader2, Kanban } from "lucide-react"
import { toggleJobVisibility } from "@/lib/services/puestos/jobs"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import type { Job } from "@/types/database"
import { Button } from "@base-ui/react"

interface JobProps {
    data: Job[]
    onEdit: (job: Job) => void
    onRefresh: () => void
}

export function JobsTable({ data, onEdit, onRefresh }: JobProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()

    const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
        setLoadingId(id)
        try {
            //lo que hacemos es pasarle el id y la visibilidad contraria
            await toggleJobVisibility(id, !currentVisibility)
            //en caso de que todo vaya bien, actualizamos la tabla y mostramos un mensaje de exito
            toast.success("Visibilidad actualizada")
            onRefresh()
        } catch (error) {
            console.error(error)
            //en caso de que algo falle, mostramos un mensaje de error
            toast.error("Error al actualizar visibilidad")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="w-full overflow-x-auto border rounded-xl bg-card shadow-sm">
            <table className="w-full min-w-[1200px] text-base">
                <thead className="bg-muted/50 border-b">
                    <tr>
                        <th className="p-4 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Título</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Área</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Modalidad</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Localidad</th>
                        <th className="p-4 text-center font-semibold text-muted-foreground uppercase text-xs tracking-wider">Visible</th>
                        <th className="p-4 text-right font-semibold text-muted-foreground uppercase text-xs tracking-wider">Acciones</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-border">
                    {data.length > 0 ? (
                        data.map((job) => (
                            <tr key={job.id} className="transition-colors hover:bg-muted/30">
                                <td className="p-4 font-medium">{job.titulo}</td>
                                <td className="p-4 text-muted-foreground">{job.area_id}</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[13px] font-medium text-primary">
                                        {job.modalidad_id}
                                    </span>
                                </td>
                                <td className="p-4 text-muted-foreground">{job.localidad}</td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <label className="relative inline-flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={job.visibility}  // Estado actual en la UI
                                                onChange={() => handleToggleVisibility(job.id, job.visibility)} //lo que hace es pasarle el id y la visibilidad contraria
                                                disabled={loadingId === job.id} //aqui ponemos el loading para que no se pueda editar mientras se esta editando
                                            />
                                            <div className={`
                                                flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
                                                ${job.visibility
                                                    ? 'bg-green-500/10 text-green-600 border-green-200'
                                                    : 'bg-muted text-muted-foreground border-border'}
                                                border hover:scale-105 active:scale-95
                                                ${loadingId === job.id ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}>
                                                {loadingId === job.id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    job.visibility ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            className={'border-2 p-2 cursor-pointer bg-muted hover:bg-muted/70'}
                                            onClick={() => router.push(`/admin/puestos/${job.id}`)}
                                        >
                                            <Kanban className="h-4 w-4 mr-1 inline" />
                                            Proceso
                                        </Button>
                                        <Button className={'border-2 p-2 cursor-pointer bg-blue-400 hover:bg-blue-500'} onClick={() => onEdit(job)}>
                                            Editar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No hay puestos registrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
