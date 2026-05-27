import { MercadoPagoConfig } from 'mercadopago'

/**
 * Instancia singleton del cliente de Mercado Pago.
 * Usá este cliente en todos los módulos de pagos.
 */
export const mpClient = new MercadoPagoConfig({
    accessToken: process.env.YOUR_ACCESS_TOKEN!,
    options: {
        timeout: 5000,
    },
})
