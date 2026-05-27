import { createClientServer } from '@/lib/supabase/server'

export interface DashboardMetrics {
    totalCandidatos: number
    candidatosEstaSemana: number
    puestosActivos: number
    entrevistados: number
    contratados: number
    candidatosPorArea: { area: string; total: number }[]
    candidatosPorEstado: { estado: string; total: number }[]
    ultimosPostulantes: {
        id: string
        nombre: string
        apellido: string
        area_id: string | null
        localidad: string | null
        created_at: string
    }[]
    actividadReciente: {
        id: string
        tipo: 'postulacion' | 'contratado' | 'email' | 'puesto'
        descripcion: string
        fecha: string
    }[]
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const supabase = await createClientServer()

    // Calcular fecha de inicio de la semana actual
    const hoy = new Date()
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - 7)
    const inicioSemanaISO = inicioSemana.toISOString()

    // Ejecutar todas las queries en paralelo para máxima velocidad
    const [
        { count: totalCandidatos },
        { count: candidatosEstaSemana },
        { count: puestosActivos },
        { count: entrevistados },
        { data: candidatosPorAreaRaw },
        { data: estadosRaw },
        { data: ultimosPostulantes },
        { data: contratadosRaw },
        { data: emailsRecientes },
    ] = await Promise.all([
        // Total de candidatos
        supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true }),

        // Candidatos de esta semana
        supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', inicioSemanaISO),

        // Puestos activos
        supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true),

        // Entrevistados
        supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('entrevistado', true),

        // Candidatos por área
        supabase
            .from('candidates')
            .select('area_id')
            .not('area_id', 'is', null),

        // Estados del kanban (job_candidates)
        supabase
            .from('job_candidates')
            .select('estado'),

        // Últimos 4 postulantes
        supabase
            .from('candidates')
            .select('id, nombre, apellido, area_id, localidad, created_at')
            .order('created_at', { ascending: false })
            .limit(4),

        // Contratados este mes
        supabase
            .from('job_candidates')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'contratado'),

        // Emails recientes
        supabase
            .from('emails')
            .select('id, candidate_id, asunto, created_at, candidates(nombre, apellido)')
            .order('created_at', { ascending: false })
            .limit(3),
    ])

    // Agrupar candidatos por área
    const areaMap = new Map<string, number>()
    for (const c of candidatosPorAreaRaw || []) {
        const area = c.area_id || 'Sin definir'
        areaMap.set(area, (areaMap.get(area) || 0) + 1)
    }
    const candidatosPorArea = Array.from(areaMap.entries())
        .map(([area, total]) => ({ area, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)

    // Agrupar por estado del kanban
    const estadoMap = new Map<string, number>()
    const estadosOrden = ['candidato', 'entrevistando', 'evaluacion', 'descalificado', 'contratado']
    for (const e of estadosRaw || []) {
        estadoMap.set(e.estado, (estadoMap.get(e.estado) || 0) + 1)
    }
    const candidatosPorEstado = estadosOrden.map(estado => ({
        estado,
        total: estadoMap.get(estado) || 0,
    }))

    // Actividad reciente — mezclamos postulaciones y emails
    const actividad: DashboardMetrics['actividadReciente'] = []

    for (const c of (ultimosPostulantes || []).slice(0, 2)) {
        actividad.push({
            id: c.id,
            tipo: 'postulacion',
            descripcion: `${c.nombre} ${c.apellido} se postuló`,
            fecha: c.created_at,
        })
    }

    for (const e of emailsRecientes || []) {
        const cand = e.candidates as any
        actividad.push({
            id: e.id,
            tipo: 'email',
            descripcion: `Correo enviado a ${cand?.nombre || ''} ${cand?.apellido || ''}`,
            fecha: e.created_at,
        })
    }

    // Ordenar actividad por fecha
    actividad.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    return {
        totalCandidatos: totalCandidatos || 0,
        candidatosEstaSemana: candidatosEstaSemana || 0,
        puestosActivos: puestosActivos || 0,
        entrevistados: entrevistados || 0,
        contratados: contratadosRaw?.length || 0,
        candidatosPorArea,
        candidatosPorEstado,
        ultimosPostulantes: ultimosPostulantes || [],
        actividadReciente: actividad.slice(0, 4),
    }
}
