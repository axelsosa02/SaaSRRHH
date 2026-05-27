'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { JobCandidate } from '@/types/ui'

interface KanbanCardProps {
    jobCandidate: JobCandidate
    jobId: string
    isDragging?: boolean
}

function getInitials(nombre: string, apellido: string) {
    return `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase()
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'hoy'
    if (days === 1) return 'hace 1d'
    if (days < 7) return `hace ${days}d`
    if (days < 30) return `hace ${Math.floor(days / 7)}sem`
    return `hace ${Math.floor(days / 30)}mes`
}

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-amber-100 text-amber-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
]

function getAvatarColor(id: string) {
    const index = id.charCodeAt(0) % AVATAR_COLORS.length
    return AVATAR_COLORS[index]
}

export function KanbanCard({ jobCandidate, jobId, isDragging }: KanbanCardProps) {
    const router = useRouter()
    const { candidate } = jobCandidate

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: jobCandidate.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleClick = () => {
        router.push(`/admin/puestos/${jobId}/candidatos/${candidate.id}`)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={cn(
                'bg-background border rounded-lg p-3 cursor-pointer select-none',
                'hover:border-primary/40 hover:shadow-sm transition-all',
                (isSortableDragging || isDragging) && 'opacity-50 shadow-lg ring-2 ring-primary/30'
            )}
        >
            {/* Avatar + nombre */}
            <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                    getAvatarColor(candidate.id)
                )}>
                    {getInitials(candidate.nombre, candidate.apellido)}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                        {candidate.nombre} {candidate.apellido}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {candidate.localidad || candidate.area_id || candidate.email}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                {candidate.area_id && (
                    <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full truncate max-w-[120px]">
                        {candidate.area_id}
                    </span>
                )}
                <span className="text-[11px] text-muted-foreground ml-auto">
                    {timeAgo(jobCandidate.created_at)}
                </span>
            </div>
        </div>
    )
}