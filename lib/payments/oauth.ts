import { createAdminClient } from '@/lib/supabase/admin'

const MP_APP_ID = process.env.MP_APP_ID!
const MP_APP_SECRET = process.env.MP_APP_SECRET!
// Removemos la barra final para evitar URLs con doble barra (//)
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

const MP_OAUTH_BASE = 'https://auth.mercadopago.com/authorization'
const MP_TOKEN_URL = 'https://api.mercadopago.com/oauth/token'

/**
 * Genera la URL de autorización de Mercado Pago OAuth.
 * El `state` codifica el orgId para recuperarlo en el callback.
 * Se codifica en base64 para evitar caracteres especiales en la URL.
 */
export function getMpOAuthUrl(orgId: string): string {
    const state = Buffer.from(JSON.stringify({ orgId })).toString('base64url')

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: MP_APP_ID,
        redirect_uri: `${BASE_URL}/api/mercadopago/oauth/callback`,
        state,
    })

    return `${MP_OAUTH_BASE}?${params.toString()}`
}

interface MpTokenResponse {
    access_token: string
    refresh_token: string
    user_id: number
    token_type: string
    expires_in: number
    scope: string
}

/**
 * Intercambia el code de autorización por los tokens de MP.
 * Guarda el access_token, refresh_token y user_id en la tabla organizations.
 */
export async function exchangeMpCode(code: string, orgId: string): Promise<void> {
    // 1. Pedimos los tokens a MP
    const res = await fetch(MP_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: MP_APP_ID,
            client_secret: MP_APP_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${BASE_URL}/api/mercadopago/oauth/callback`,
        }),
    })

    if (!res.ok) {
        const error = await res.text()
        throw new Error(`MP OAuth error: ${error}`)
    }

    const data = (await res.json()) as MpTokenResponse

    // 2. Guardamos los tokens en la DB usando el admin client (bypasea RLS)
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('organizations')
        .update({
            mp_access_token: data.access_token,
            mp_refresh_token: data.refresh_token,
            mp_user_id: String(data.user_id),
            mp_connected: true,
        })
        .eq('id', orgId)

    if (error) throw error
}

/**
 * Obtiene el access_token de MP de una organización.
 * Usa el admin client para leer el campo protegido mp_access_token.
 * NUNCA exponer este valor al frontend.
 */
export async function getOrgMpAccessToken(orgId: string): Promise<string> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('organizations')
        .select('mp_access_token, mp_connected')
        .eq('id', orgId)
        .single()

    if (error || !data) throw new Error('Organización no encontrada')
    if (!data.mp_connected || !data.mp_access_token) {
        throw new Error('Esta organización no tiene Mercado Pago conectado')
    }

    return data.mp_access_token
}

/**
 * Desconecta la cuenta de MP de una organización.
 * Borra los tokens de la DB — el cliente tendrá que reconectarse.
 */
export async function disconnectMp(orgId: string): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('organizations')
        .update({
            mp_access_token: null,
            mp_refresh_token: null,
            mp_user_id: null,
            mp_connected: false,
        })
        .eq('id', orgId)

    if (error) throw error
}

/**
 * Decodifica el state del OAuth para recuperar el orgId.
 */
export function decodeOAuthState(state: string): { orgId: string } {
    try {
        return JSON.parse(Buffer.from(state, 'base64url').toString())
    } catch {
        throw new Error('State OAuth inválido')
    }
}
