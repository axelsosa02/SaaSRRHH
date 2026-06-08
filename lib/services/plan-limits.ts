import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { Plan } from '@/types/plan'

export type LimitCheck = {
    allowed: boolean
    current: number
    limit: number | null    // null = ilimitado
    planName: string
}

/**
 * Obtiene el plan activo de la organización del usuario actual.
 */
export async function getOrgPlan(): Promise<Plan> {
    const supabase = createBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

    if (!profile?.org_id) throw new Error('Sin organización')

    const { data: org } = await supabase
        .from('organizations')
        .select('plan_id, plans(*)')
        .eq('id', profile.org_id)
        .single()

    if (!org?.plans) throw new Error('Plan no encontrado')

    return org.plans as unknown as Plan
}

/**
 * Verifica si la org puede agregar más candidatos.
 */
export async function checkCandidateLimit(orgId: string): Promise<LimitCheck> {
    const supabase = createBrowserClient()

    const { data: org } = await supabase
        .from('organizations')
        .select('plan_id, plans(max_candidates, display_name)')
        .eq('id', orgId)
        .single()

    const plan = org?.plans as unknown as { max_candidates: number | null; display_name: string } | null

    if (!plan) throw new Error('Plan no encontrado')

    // Si es ilimitado, siempre permitir
    if (plan.max_candidates === null) {
        return { allowed: true, current: 0, limit: null, planName: plan.display_name }
    }

    const { count } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)

    const current = count ?? 0

    return {
        allowed: current < plan.max_candidates,
        current,
        limit: plan.max_candidates,
        planName: plan.display_name,
    }
}

/**
 * Verifica si la org puede crear más puestos/vacantes.
 */
export async function checkJobLimit(orgId: string): Promise<LimitCheck> {
    const supabase = createBrowserClient()

    const { data: org } = await supabase
        .from('organizations')
        .select('plan_id, plans(max_jobs, display_name)')
        .eq('id', orgId)
        .single()

    const plan = org?.plans as unknown as { max_jobs: number | null; display_name: string } | null

    if (!plan) throw new Error('Plan no encontrado')

    if (plan.max_jobs === null) {
        return { allowed: true, current: 0, limit: null, planName: plan.display_name }
    }

    const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)

    const current = count ?? 0

    return {
        allowed: current < plan.max_jobs,
        current,
        limit: plan.max_jobs,
        planName: plan.display_name,
    }
}

/**
 * Verifica si la org puede agregar más usuarios al equipo.
 */
export async function checkUserLimit(orgId: string): Promise<LimitCheck> {
    const supabase = createBrowserClient()

    const { data: org } = await supabase
        .from('organizations')
        .select('plan_id, plans(max_users, display_name)')
        .eq('id', orgId)
        .single()

    const plan = org?.plans as unknown as { max_users: number | null; display_name: string } | null

    if (!plan) throw new Error('Plan no encontrado')

    if (plan.max_users === null) {
        return { allowed: true, current: 0, limit: null, planName: plan.display_name }
    }

    const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)

    const current = count ?? 0

    return {
        allowed: current < plan.max_users,
        current,
        limit: plan.max_users,
        planName: plan.display_name,
    }
}

/**
 * Verifica si la org tiene acceso a una feature específica del plan.
 */
export async function checkFeatureAccess(
    orgId: string,
    feature: 'has_custom_landing' | 'has_mass_email'
): Promise<boolean> {
    const supabase = createBrowserClient()

    const { data: org } = await supabase
        .from('organizations')
        .select(`plan_id, plans(${feature})`)
        .eq('id', orgId)
        .single()

    const plan = org?.plans as unknown as Record<string, boolean> | null

    return plan?.[feature] ?? false
}
