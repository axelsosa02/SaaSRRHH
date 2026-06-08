import { createClientServer } from '@/lib/supabase/server'

export interface PlanUsage {
    planName: string
    planDisplayName: string
    price: number
    candidatos: { current: number; limit: number | null }
    puestos: { current: number; limit: number | null }
    usuarios: { current: number; limit: number | null }
    hasCustomLanding: boolean
    hasMassEmail: boolean
}

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
    planUsage: PlanUsage | null
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const supabase = await createClientServer()

    // Obtener org_id del usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No se encontró el usuario')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    const orgId = profile?.org_id
    if (!orgId) {
        // Organización sin datos — devolver métricas vacías
        return {
            totalCandidatos: 0,
            candidatosEstaSemana: 0,
            puestosActivos: 0,
            entrevistados: 0,
            contratados: 0,
            candidatosPorArea: [],
            candidatosPorEstado: [
                { estado: 'candidato', total: 0 },
                { estado: 'entrevistando', total: 0 },
                { estado: 'evaluacion', total: 0 },
                { estado: 'descalificado', total: 0 },
                { estado: 'contratado', total: 0 },
            ],
            ultimosPostulantes: [],
            actividadReciente: [],
            planUsage: null,
        }
    }

    // Calcular fecha de inicio de la semana actual
    const hoy = new Date()
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - 7)
    const inicioSemanaISO = inicioSemana.toISOString()

    // Ejecutar todas las queries en paralelo para máxima velocidad
    // TODAS filtradas por org_id para aislamiento de datos
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
        // Total de candidatos (de esta org)
        supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId),

        // Candidatos de esta semana (de esta org)
        supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .gte('created_at', inicioSemanaISO),

        // Puestos activos (de esta org)
        supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('activo', true),

        // Entrevistados (de esta org)
        supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('entrevistado', true),

        // Candidatos por área (de esta org)
        supabase
            .from('candidates')
            .select('area_id')
            .eq('org_id', orgId)
            .not('area_id', 'is', null),

        // Estados del kanban — filtrar por jobs de esta org
        supabase
            .from('job_candidates')
            .select('estado, jobs!inner(org_id)')
            .eq('jobs.org_id', orgId),

        // Últimos 4 postulantes (de esta org)
        supabase
            .from('candidates')
            .select('id, nombre, apellido, area_id, localidad, created_at')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(4),

        // Contratados (de esta org, via jobs)
        supabase
            .from('job_candidates')
            .select('*, jobs!inner(org_id)', { count: 'exact', head: true })
            .eq('jobs.org_id', orgId)
            .eq('estado', 'contratado'),

        // Emails recientes (de candidatos de esta org)
        supabase
            .from('emails')
            .select('id, candidate_id, asunto, created_at, candidates!inner(nombre, apellido, org_id)')
            .eq('candidates.org_id', orgId)
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

    // ── Plan usage ─────────────────────────────────────────────
    let planUsage: PlanUsage | null = null
    try {
        const { data: orgWithPlan } = await supabase
            .from('organizations')
            .select('plan_id, plans(name, display_name, price, max_candidates, max_jobs, max_users, has_custom_landing, has_mass_email)')
            .eq('id', orgId)
            .single()

        const plan = orgWithPlan?.plans as unknown as {
            name: string; display_name: string; price: number;
            max_candidates: number | null; max_jobs: number | null; max_users: number | null;
            has_custom_landing: boolean; has_mass_email: boolean;
        } | null

        if (plan) {
            const { count: userCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('org_id', orgId)

            planUsage = {
                planName: plan.name,
                planDisplayName: plan.display_name,
                price: plan.price,
                candidatos: { current: totalCandidatos || 0, limit: plan.max_candidates },
                puestos: { current: puestosActivos || 0, limit: plan.max_jobs },
                usuarios: { current: userCount || 0, limit: plan.max_users },
                hasCustomLanding: plan.has_custom_landing,
                hasMassEmail: plan.has_mass_email,
            }
        }
    } catch {
        // Plan table might not exist yet — graceful fallback
    }

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
        planUsage,
    }
}
