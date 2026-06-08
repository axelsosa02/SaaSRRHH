'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KanbanColumn } from '@/components/admin/kanban/kanbanColumn'
import { KanbanCard } from '@/components/admin/kanban/kanbanCard'
import { AddCandidateModal } from '@/components/admin/kanban/addCandidateModal'
import { getJobCandidates, moveCandidate, removeCandidateFromJob } from '@/lib/services/kanban/kanban'
import { getJobs } from '@/lib/services/puestos/getJobs'
import type { JobCandidate } from '@/types/ui'
import type { KanbanEstado } from '@/types/enums'
import type { Job } from '@/types/database'
import Swal from 'sweetalert2'

const COLUMNAS: { id: KanbanEstado; label: string; color: string }[] = [
    { id: 'candidato', label: 'Candidatos', color: 'border-t-gray-400' },
    { id: 'entrevistando', label: 'Entrevistando', color: 'border-t-amber-400' },
    { id: 'evaluacion', label: 'Evaluación', color: 'border-t-blue-400' },
    { id: 'descalificado', label: 'Descalificado', color: 'border-t-red-400' },
    { id: 'contratado', label: 'Contratado', color: 'border-t-green-500' },
]

export default function KanbanPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params.id as string

    const [job, setJob] = useState<Job | null>(null)
    const [candidates, setCandidates] = useState<JobCandidate[]>([])
    const [activeCard, setActiveCard] = useState<JobCandidate | null>(null)
    // Guarda el estado original del candidato antes de iniciar el drag
    const [originalEstado, setOriginalEstado] = useState<KanbanEstado | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 }
    }))

    const fetchData = useCallback(async () => {
        try {
            const [jobsData, candidatesData] = await Promise.all([
                getJobs(),
                getJobCandidates(jobId),
            ])
            const currentJob = jobsData.find(j => j.id === jobId) || null
            setJob(currentJob)
            setCandidates(candidatesData)
        } catch (error) {
            console.error(error)
            toast.error('Error al cargar el tablero')
        } finally {
            setLoading(false)
        }
    }, [jobId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Candidatos agrupados por columna
    const getCandidatesByEstado = (estado: KanbanEstado) =>
        candidates.filter(c => c.estado === estado)

    const handleDragStart = (event: DragStartEvent) => {
        const card = candidates.find(c => c.id === event.active.id)
        setActiveCard(card || null)
        // Guardamos el estado original para comparar en handleDragEnd
        if (card) setOriginalEstado(card.estado)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Detectar si se está sobre una columna
        const overEstado = COLUMNAS.find(col => col.id === overId)?.id

        if (overEstado) {
            setCandidates(prev =>
                prev.map(c =>
                    c.id === activeId ? { ...c, estado: overEstado } : c
                )
            )
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveCard(null)

        if (!over) {
            // Si se soltó fuera, revertir al estado original
            if (originalEstado) {
                setCandidates(prev =>
                    prev.map(c =>
                        c.id === (active.id as string) ? { ...c, estado: originalEstado } : c
                    )
                )
            }
            setOriginalEstado(null)
            return
        }

        const activeId = active.id as string
        const overId = over.id as string

        // Buscar en qué columna cayó
        const targetEstado = COLUMNAS.find(col => col.id === overId)?.id
            ?? candidates.find(c => c.id === overId)?.estado

        if (!targetEstado) {
            setOriginalEstado(null)
            return
        }

        // Comparar con el estado ORIGINAL (no el actual, que ya fue actualizado por handleDragOver)
        if (originalEstado === targetEstado) {
            setOriginalEstado(null)
            return
        }

        // Calcular nuevo orden
        const colCards = candidates.filter(c => c.estado === targetEstado && c.id !== activeId)
        const nuevoOrden = colCards.length

        try {
            await moveCandidate(activeId, targetEstado, nuevoOrden)
            toast.success('Candidato movido correctamente')
        } catch {
            toast.error('Error al mover el candidato')
            fetchData() // revert
        } finally {
            setOriginalEstado(null)
        }
    }

    // Al eliminar un candidato del puesto
    const handleRemoveCandidate = async (jobCandidateId: string) => {
        await Swal.fire({
            title: '¿Eliminar candidato?',
            text: 'Esta acción solo eliminará al candidato de este puesto, no del sistema.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await removeCandidateFromJob(jobCandidateId)
                    toast.success('Candidato eliminado correctamente')
                    fetchData()
                } catch (error) {
                    console.error(error)
                    toast.error('Error al eliminar el candidato')
                }
            }
        })
        
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-12">
                <p className="text-muted-foreground text-sm">Cargando tablero...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/admin/puestos')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <p className="text-xs text-muted-foreground">Puestos</p>
                        <h1 className="text-lg font-semibold">{job?.titulo || 'Cargando...'}</h1>
                        <p className="text-xs text-muted-foreground">
                            {job?.modalidad} · {job?.localidad} · {candidates.length} candidatos
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar candidato
                </Button>
            </div>

            {/* Kanban board */}
            <div className="flex-1 overflow-x-auto p-6">
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 h-full p-6 min-w-max">
                        {COLUMNAS.map(col => {
                            const colCandidates = getCandidatesByEstado(col.id)
                            return (
                                <SortableContext
                                    key={col.id}
                                    items={colCandidates.map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <KanbanColumn
                                        id={col.id}
                                        label={col.label}
                                        colorClass={col.color}
                                        candidates={colCandidates}
                                        jobId={jobId}
                                        onRemoveCandidate={handleRemoveCandidate}
                                    />
                                </SortableContext>
                            )
                        })}
                    </div>

                    <DragOverlay>
                        {activeCard && (
                            <KanbanCard
                                jobCandidate={activeCard}
                                jobId={jobId}
                                isDragging
                                onRemoveCandidate={handleRemoveCandidate}
                            />
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Modal agregar candidato */}
            <AddCandidateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                jobId={jobId}
                onSuccess={() => {
                    setIsModalOpen(false)
                    fetchData()
                }}
            />
        </div>
    )
}