'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExperienciaTab } from '@/components/admin/kanban/candidate/ExperienciaTab'
import { CurriculumTab } from '@/components/admin/kanban/candidate/CurriculumTab'
import { DocumentosTab } from '@/components/admin/kanban/candidate/DocumentosTab'
import { EmailTab } from '@/components/admin/kanban/candidate/EmailTab'
import { ReferenciasTab } from '@/components/admin/kanban/candidate/ReferenciasTab'
import { EtiquetasTab } from '@/components/admin/kanban/candidate/EtiquetasTab'
import { createClient } from '@/lib/supabase/client'
import { moveCandidate } from '@/lib/services/kanban/kanban'
import type { CandidateDB } from '@/types/database'
import type { JobCandidate } from '@/types/ui'
import type { KanbanEstado } from '@/types/enums'
import { cn } from '@/lib/utils'

type Tab = 'experiencia' | 'curriculum' | 'documentos' | 'email' | 'referencias' | 'etiquetas'

const TABS: { id: Tab; label: string }[] = [
    { id: 'experiencia', label: 'Experiencia' },
    { id: 'curriculum', label: 'Currículum' },
    { id: 'documentos', label: 'Documentos' },
    { id: 'email', label: 'Correo electrónico' },
    { id: 'referencias', label: 'Referencias' },
    { id: 'etiquetas', label: 'Etiquetas' },
]

const ESTADOS: { value: KanbanEstado; label: string }[] = [
    { value: 'candidato', label: 'Candidato' },
    { value: 'entrevistando', label: 'Entrevistando' },
    { value: 'evaluacion', label: 'Evaluación' },
    { value: 'descalificado', label: 'Descalificado' },
    { value: 'contratado', label: 'Contratado' },
]

export default function CandidateProfilePage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params.id as string
    const candidateId = params.candidateId as string

    const [candidate, setCandidate] = useState<CandidateDB | null>(null)
    const [jobCandidate, setJobCandidate] = useState<JobCandidate | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>('experiencia')
    const [loading, setLoading] = useState(true)

    const fetchCandidate = useCallback(async () => {
        const supabase = createClient()
        try {
            const [{ data: candidateData }, { data: jcData }] = await Promise.all([
                supabase.from('candidates').select('*').eq('id', candidateId).single(),
                supabase.from('job_candidates').select('*').eq('candidate_id', candidateId).eq('job_id', jobId).single(),
            ])
            setCandidate(candidateData as CandidateDB)
            setJobCandidate(jcData as JobCandidate)
        } catch (error) {
            console.error(error)
            toast.error('Error al cargar el candidato')
        } finally {
            setLoading(false)
        }
    }, [candidateId, jobId])

    useEffect(() => {
        fetchCandidate()
    }, [fetchCandidate])

    const handleEstadoChange = async (nuevoEstado: KanbanEstado) => {
        if (!jobCandidate) return
        try {
            await moveCandidate(jobCandidate.id, nuevoEstado, jobCandidate.orden)
            setJobCandidate(prev => prev ? { ...prev, estado: nuevoEstado } : prev)
            toast.success('Etapa actualizada')
        } catch {
            toast.error('Error al actualizar la etapa')
        }
    }

    const handleWhatsApp = () => {
        if (!candidate?.telefono) return toast.error('El candidato no tiene teléfono registrado')
        const numero = candidate.telefono.replace(/\D/g, '')
        window.open(`https://wa.me/${numero}`, '_blank')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-12">
                <p className="text-muted-foreground text-sm">Cargando perfil...</p>
            </div>
        )
    }

    if (!candidate) {
        return (
            <div className="flex items-center justify-center h-full p-12">
                <p className="text-muted-foreground text-sm">Candidato no encontrado.</p>
            </div>
        )
    }

    const initials = `${candidate.nombre[0] || ''}${candidate.apellido[0] || ''}`.toUpperCase()

    return (
        <div className="flex flex-col h-full">
            {/* Topbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-background shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/puestos/${jobId}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Puestos → Kanban
                        </p>
                        <h1 className="text-base font-semibold">
                            {candidate.nombre} {candidate.apellido}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                        <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                        WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('email')}>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar correo
                    </Button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex flex-1 min-h-0">
                {/* Sidebar izquierdo */}
                <div className="w-56 shrink-0 border-r bg-background flex flex-col">
                    {/* Info del candidato */}
                    <div className="p-4 border-b text-center">
                        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold mx-auto mb-3">
                            {initials}
                        </div>
                        <p className="text-sm font-medium">{candidate.nombre} {candidate.apellido}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{candidate.email}</p>
                        {candidate.telefono && (
                            <p className="text-xs text-muted-foreground">{candidate.telefono}</p>
                        )}
                        {candidate.area_id && (
                            <span className="inline-block mt-2 text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {candidate.area_id}
                            </span>
                        )}
                    </div>

                    {/* Navegación de tabs */}
                    <nav className="p-2 space-y-0.5">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                            Perfil
                        </p>
                        {TABS.slice(0, 3).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
                                    activeTab === tab.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5 pt-3">
                            Comunicación
                        </p>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={cn(
                                'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
                                activeTab === 'email'
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            Correo electrónico
                        </button>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5 pt-3">
                            Otros
                        </p>
                        <button
                            onClick={() => setActiveTab('referencias')}
                            className={cn(
                                'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
                                activeTab === 'referencias'
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            Referencias
                        </button>
                        <button
                            onClick={() => setActiveTab('etiquetas')}
                            className={cn(
                                'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
                                activeTab === 'etiquetas'
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            Etiquetas
                        </button>
                    </nav>

                    {/* Selector de etapa */}
                    <div className="p-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1.5">Etapa actual</p>
                        <Select
                            value={jobCandidate?.estado || 'candidato'}
                            onValueChange={(v) => handleEstadoChange(v as KanbanEstado)}
                        >
                            <SelectTrigger className="w-full text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ESTADOS.map(e => (
                                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Área de contenido */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'experiencia' && (
                        <ExperienciaTab candidateId={candidateId} jobId={jobId} />
                    )}
                    {activeTab === 'curriculum' && (
                        <CurriculumTab candidate={candidate} onRefresh={fetchCandidate} />
                    )}
                    {activeTab === 'documentos' && (
                        <DocumentosTab candidateId={candidateId} />
                    )}
                    {activeTab === 'email' && (
                        <EmailTab candidateId={candidateId} candidateEmail={candidate.email} />
                    )}
                    {activeTab === 'referencias' && (
                        <ReferenciasTab candidateId={candidateId} />
                    )}
                    {activeTab === 'etiquetas' && (
                        <EtiquetasTab candidateId={candidateId} />
                    )}
                </div>
            </div>
        </div>
    )
}