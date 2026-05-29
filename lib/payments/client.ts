import { MercadoPagoConfig } from 'mercadopago'

/**
 * Crea un cliente de Mercado Pago con el access token de una organización específica.
 * Cada org tiene su propio token OAuth → los pagos van a su cuenta.
 *
 * @param accessToken - El mp_access_token guardado en la tabla organizations
 */
export function getMpClient(accessToken: string): MercadoPagoConfig {
    return new MercadoPagoConfig({
        accessToken,
        options: { timeout: 5000 },
    })
}

/**
 * Cliente de fallback usando el token del .env (solo para testing/desarrollo).
 * En producción, siempre usar getMpClient(org.mp_access_token).
 * @deprecated Usar getMpClient(org.mp_access_token) en su lugar
 */
export const mpClient = new MercadoPagoConfig({
    accessToken: process.env.YOUR_ACCESS_TOKEN!,
    options: { timeout: 5000 },
})
