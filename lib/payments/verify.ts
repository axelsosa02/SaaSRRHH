import { Payment } from 'mercadopago'
import { mpClient, getMpClient } from './client'

export type PaymentStatus = 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded' | 'in_process' | 'in_mediation' | 'charged_back'

export interface VerifiedPayment {
    id: number
    status: PaymentStatus
    externalReference: string | null
    transactionAmount: number
    currencyId: string
    isApproved: boolean
}

/**
 * Verifica el estado de un pago consultando la API de Mercado Pago.
 * Lanza un error si el payment_id no existe o la llamada falla.
 */
export async function verifyPayment(paymentId: string | number, accessToken?: string): Promise<VerifiedPayment> {
    const client = accessToken ? getMpClient(accessToken) : mpClient
    const paymentClient = new Payment(client)

    const data = await paymentClient.get({ id: Number(paymentId) })

    return {
        id: data.id!,
        status: data.status as PaymentStatus,
        externalReference: data.external_reference ?? null,
        transactionAmount: data.transaction_amount ?? 0,
        currencyId: data.currency_id ?? 'ARS',
        isApproved: data.status === 'approved',
    }
}

/**
 * Valida que un pago sea válido para desbloquear el formulario:
 * - status === 'approved'
 * - transaction_amount === 7000
 * - currency_id === 'ARS'
 *
 * Retorna `true` si el pago es válido, `false` si no.
 */
export async function isPaymentValidForForm(paymentId: string | number): Promise<boolean> {
    try {
        const payment = await verifyPayment(paymentId)
        return (
            payment.isApproved &&
            payment.transactionAmount === 7000 &&
            payment.currencyId === 'ARS'
        )
    } catch {
        return false
    }
}
