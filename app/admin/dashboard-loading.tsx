import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-7 w-24 rounded-md" />
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>

            {/* Contenido principal */}
            <div className="grid grid-cols-[1.4fr_1fr] gap-3">
                <div className="space-y-3">
                    <div className="border rounded-xl p-5 space-y-3">
                        <Skeleton className="h-4 w-40" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-2 flex-1 rounded-full" />
                                <Skeleton className="h-3 w-6" />
                            </div>
                        ))}
                    </div>
                    <div className="border rounded-xl p-5 space-y-3">
                        <Skeleton className="h-4 w-36" />
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-3.5 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-3 w-12" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="border rounded-xl p-5 space-y-3">
                        <Skeleton className="h-4 w-48" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 p-2">
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <Skeleton className="h-3.5 flex-1" />
                                <Skeleton className="h-3.5 w-6" />
                                <Skeleton className="h-3 w-8" />
                            </div>
                        ))}
                    </div>
                    <div className="border rounded-xl p-5 space-y-3">
                        <Skeleton className="h-4 w-32" />
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-7 w-7 rounded-md" />
                                <Skeleton className="h-8 flex-1" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
