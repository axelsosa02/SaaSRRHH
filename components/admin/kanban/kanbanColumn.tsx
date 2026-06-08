'use client'

import { useDroppable } from '@dnd-kit/core'
import { KanbanCard } from './kanbanCard'
import type { JobCandidate } from '@/types/ui'
import type { KanbanEstado } from '@/types/enums'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
    id: KanbanEstado
    label: string
    colorClass: string
    candidates: JobCandidate[]
    jobId: string
    onRemoveCandidate: (jobCandidateId: string) => void
}

export function KanbanColumn({ id, label, colorClass, candidates, jobId, onRemoveCandidate }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
        <div
            className={cn(
                'flex flex-col w-[280px] shrink-0 rounded-xl border bg-card border-t-4 transition-colors',
                colorClass,
                isOver && 'ring-2 ring-primary/30'
            )}
        >
            {/* Header de la columna */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {candidates.length}
                </span>
            </div>

            {/* Cards */}
            <div
                ref={setNodeRef}
                className="flex flex-col gap-2 p-2 flex-1 min-h-[120px]"
            >
                {candidates.map(jc => (
                    <KanbanCard
                        key={jc.id}
                        jobCandidate={jc}
                        jobId={jobId}
                        onRemoveCandidate={onRemoveCandidate}
                    />
                ))}

                {candidates.length === 0 && (
                    <div className="flex items-center justify-center flex-1 text-xs text-muted-foreground py-6">
                        Sin candidatos
                    </div>
                )}
            </div>
        </div>
    )
}