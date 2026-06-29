import { createAdminClient } from '@/lib/supabase/admin'

const TOKEN_EXPIRY_HOURS = 24

/**
 * Crea un registro de pago pendiente en la tabla `payments`.
 * Se llama ANTES de redirigir al usuario a Mercado Pago.
 * Retorna el token UUID que se usará como parámetro de retorno.
 *
 * Usa el admin client (service_role) porque el candidato NO está autenticado
 * y RLS bloquearía la operación silenciosamente.
 */
export async function createPendingPayment({
    orgId,
    candidateEmail,
    monto,
}: {
    orgId: string
    candidateEmail?: string
    monto: number
}): Promise<string> {
    const supabase = createAdminClient()

    const token = crypto.randomUUID()

    const { error } = await supabase.from('payments').insert({
        org_id: orgId,
        candidate_email: candidateEmail ?? '',
        monto,
        estado: 'pendiente',
        token,
        token_usado: false,
    })

    if (error) throw error

    return token
}

/**
 * Crea un token de acceso gratuito (ya aprobado) para organizaciones
 * que no requieren pago. Permite reutilizar isTokenValid() sin cambios.
 */
export async function createFreeToken(orgId: string): Promise<string> {
    const supabase = createAdminClient()

    const token = crypto.randomUUID()

    const { error } = await supabase.from('payments').insert({
        org_id: orgId,
        candidate_email: '',
        monto: 0,
        estado: 'aprobado',
        token,
        token_usado: false,
    })

    if (error) throw error

    return token
}

/**
 * Actualiza el registro de pago con el mp_payment_id y el estado aprobado.
 * Se llama desde la página de success o el webhook de MP.
 */
export async function approvePaymentToken({
    token,
    mpPaymentId,
}: {
    token: string
    mpPaymentId: string
}) {
    const supabase = createAdminClient()

    // Primero intentamos actualizar si está pendiente
    const { error, count } = await supabase
        .from('payments')
        .update({
            mp_payment_id: mpPaymentId,
            estado: 'aprobado',
        })
        .eq('token', token)
        .eq('estado', 'pendiente')

    if (error) throw error

    // Si no se actualizó ninguna fila, puede que ya esté aprobado (retry, webhook previo, etc.)
    if (count === 0) {
        const { data: existing } = await supabase
            .from('payments')
            .select('estado')
            .eq('token', token)
            .maybeSingle()

        if (existing?.estado === 'aprobado') {
            console.log('[approvePaymentToken] Token ya estaba aprobado:', token)
            return
        }

        // Si no está ni pendiente ni aprobado, forzamos la aprobación
        const { error: forceError } = await supabase
            .from('payments')
            .update({
                mp_payment_id: mpPaymentId,
                estado: 'aprobado',
            })
            .eq('token', token)

        if (forceError) throw forceError
    }
}

/**
 * Verifica si un token es válido para acceder al formulario:
 * - existe en la tabla
 * - está en estado 'aprobado'
 * - no fue usado
 * - no tiene más de TOKEN_EXPIRY_HOURS horas de antigüedad
 */
export async function isTokenValid(token: string): Promise<boolean> {
    if (!token) return false

    const supabase = createAdminClient()

    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() - TOKEN_EXPIRY_HOURS)

    const { data, error } = await supabase
        .from('payments')
        .select('id, estado, token_usado, created_at')
        .eq('token', token)
        .eq('estado', 'aprobado')
        .eq('token_usado', false)
        .gte('created_at', expiryDate.toISOString())
        .maybeSingle()

    if (error || !data) return false

    return true
}

/**
 * Marca un token como usado una vez que el candidato envió su postulación.
 * Evita que el mismo pago se use para postularse dos veces.
 */
export async function markTokenAsUsed(token: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('payments')
        .update({ token_usado: true })
        .eq('token', token)

    if (error) throw error
}

