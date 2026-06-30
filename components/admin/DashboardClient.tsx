'use client'

import { Users, Briefcase, UserCheck, Trophy, ArrowUpRight, Mail, UserPlus, Zap } from 'lucide-react'
import Link from 'next/link'
import type { DashboardMetrics, PlanUsage } from '@/lib/services/dashboard'

interface Props {
    metrics: DashboardMetrics
}

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
    candidato: { label: 'Candidatos', color: '#888780' },
    entrevistando: { label: 'Entrevistando', color: '#EF9F27' },
    evaluacion: { label: 'Evaluación', color: '#378ADD' },
    descalificado: { label: 'Descalificado', color: '#E24B4A' },
    contratado: { label: 'Contratado', color: '#639922' },
}

const ACTIVITY_CONFIG = {
    postulacion: { bg: 'bg-green-50', icon: <UserPlus className="h-3.5 w-3.5 text-green-700" /> },
    contratado: { bg: 'bg-blue-50', icon: <Trophy className="h-3.5 w-3.5 text-blue-700" /> },
    email: { bg: 'bg-amber-50', icon: <Mail className="h-3.5 w-3.5 text-amber-700" /> },
    puesto: { bg: 'bg-purple-50', icon: <Briefcase className="h-3.5 w-3.5 text-purple-700" /> },
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `hace ${mins}m`
    if (hours < 24) return `hace ${hours}h`
    if (days === 1) return 'ayer'
    return `hace ${days}d`
}

function getInitials(nombre: string, apellido: string) {
    return `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase()
}

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-amber-100 text-amber-800',
    'bg-purple-100 text-purple-800',
]

/* ── Plan Usage Bar ────────────────────────────────────────────── */
function UsageBar({ label, current, limit }: { label: string; current: number; limit: number | null }) {
    const isUnlimited = limit === null
    const pct = isUnlimited ? 0 : Math.min(Math.round((current / limit) * 100), 100)
    const isNearLimit = !isUnlimited && pct >= 80
    const isAtLimit = !isUnlimited && pct >= 100

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : ''}`}>
                    {current}{isUnlimited ? '' : ` / ${limit}`}
                    {isUnlimited && <span className="text-muted-foreground ml-1">∞</span>}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${
                            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
        </div>
    )
}

/* ── Plan Usage Card ───────────────────────────────────────────── */
function PlanUsageCard({ plan }: { plan: PlanUsage }) {
    const PLAN_COLORS: Record<string, string> = {
        starter: 'bg-zinc-100 text-zinc-800',
        pro: 'bg-amber-100 text-amber-800',
        agency: 'bg-violet-100 text-violet-800',
    }

    return (
        <div className="border rounded-xl p-5 bg-card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium">Tu plan</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[plan.planName] || 'bg-muted'}`}>
                        {plan.planDisplayName}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground">
                    USD ${plan.price}/mes
                </span>
            </div>

            <div className="space-y-3">
                <UsageBar label="Candidatos" current={plan.candidatos.current} limit={plan.candidatos.limit} />
                <UsageBar label="Puestos activos" current={plan.puestos.current} limit={plan.puestos.limit} />
                <UsageBar label="Usuarios" current={plan.usuarios.current} limit={plan.usuarios.limit} />
            </div>

            {plan.planName !== 'agency' && (
                <button className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline">
                    <Zap className="h-3.5 w-3.5" />
                    Mejorar plan
                </button>
            )}
        </div>
    )
}

export function DashboardClient({ metrics }: Props) {
    const totalEstados = metrics.candidatosPorEstado.reduce((acc, e) => acc + e.total, 0)
    const maxArea = Math.max(...metrics.candidatosPorArea.map(a => a.total), 1)
    const porcentajeEntrevistados = metrics.totalCandidatos > 0
        ? Math.round((metrics.entrevistados / metrics.totalCandidatos) * 100)
        : 0

    return (
        <div className="flex flex-col gap-5 p-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Resumen general de tu organización
                    </p>
                </div>
                <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-md border">
                    {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* ── Métricas ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">Total candidatos</p>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-medium">{metrics.totalCandidatos}</p>
                    <p className="text-xs text-green-700 mt-1">
                        +{metrics.candidatosEstaSemana} esta semana
                    </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">Puestos activos</p>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-medium">{metrics.puestosActivos}</p>
                    <p className="text-xs text-muted-foreground mt-1">posiciones abiertas</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">Entrevistados</p>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-medium">{metrics.entrevistados}</p>
                    <p className="text-xs text-amber-700 mt-1">
                        {porcentajeEntrevistados}% del total
                    </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">Contratados</p>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-medium">{metrics.contratados}</p>
                    <p className="text-xs text-green-700 mt-1">en todos los puestos</p>
                </div>
            </div>

            {/* ── Contenido principal ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">

                {/* Columna izquierda */}
                <div className="flex flex-col gap-4">

                    {/* Candidatos por área */}
                    <div className="border rounded-xl p-5 bg-card">
                        <h2 className="text-sm font-medium mb-4">Candidatos por área</h2>
                        {metrics.candidatosPorArea.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin datos aún.</p>
                        ) : (
                            <div className="space-y-3">
                                {metrics.candidatosPorArea.map(({ area, total }) => (
                                    <div key={area} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-28 truncate shrink-0">
                                            {area}
                                        </span>
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${(total / maxArea) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                                            {total}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Últimos postulantes */}
                    <div className="border rounded-xl p-5 bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-medium">Últimos postulantes</h2>
                            <Link
                                href="/admin/postulantes"
                                className="text-xs text-primary flex items-center gap-1 hover:underline"
                            >
                                Ver todos <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                        {metrics.ultimosPostulantes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin postulantes aún.</p>
                        ) : (
                            <div className="space-y-1">
                                {metrics.ultimosPostulantes.map((c, i) => (
                                    <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                                            {getInitials(c.nombre, c.apellido)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {c.nombre} {c.apellido}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {c.area_id || 'Sin área'}{c.localidad ? ` · ${c.localidad}` : ''}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {timeAgo(c.created_at)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                     {/* Actividad reciente */}
                    <div className="border rounded-xl p-5 bg-card">
                        <h2 className="text-sm font-medium mb-4">Actividad reciente</h2>
                        {metrics.actividadReciente.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
                        ) : (
                            <div className="space-y-1">
                                {metrics.actividadReciente.map((item) => {
                                    const config = ACTIVITY_CONFIG[item.tipo]
                                    return (
                                        <div key={item.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                                            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${config.bg}`}>
                                                {config.icon}
                                            </div>
                                            <p className="text-xs text-muted-foreground flex-1 leading-relaxed pt-0.5">
                                                {item.descripcion}
                                            </p>
                                            <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
                                                {timeAgo(item.fecha)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="flex flex-col gap-4">

                    {/* Plan usage */}
                    {metrics.planUsage && (
                        <PlanUsageCard plan={metrics.planUsage} />
                    )}

                    {/* Estado del proceso */}
                    <div className="border rounded-xl p-5 bg-card">
                        <h2 className="text-sm font-medium mb-4">Estado del proceso</h2>
                        {totalEstados === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin candidatos en puestos aún.</p>
                        ) : (
                            <div className="space-y-1">
                                {metrics.candidatosPorEstado.map(({ estado, total }) => {
                                    const config = ESTADO_CONFIG[estado]
                                    const pct = totalEstados > 0 ? Math.round((total / totalEstados) * 100) : 0
                                    return (
                                        <div
                                            key={estado}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg odd:bg-muted/40"
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ background: config.color }}
                                            />
                                            <span className="text-sm flex-1">{config.label}</span>
                                            <span className="text-sm font-medium">{total}</span>
                                            <span className="text-xs text-muted-foreground w-8 text-right">
                                                {pct}%
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                   
                </div>
            </div>
        </div>
    )
}
