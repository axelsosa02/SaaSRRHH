/**
 * Barrel export del módulo de pagos.
 *
 * IMPORTANTE: Estos módulos solo deben importarse desde Server Components,
 * API Routes o Server Actions — nunca desde código cliente ('use client').
 */
export { mpClient } from './client'
export { createPaymentPreference } from './preferences'
export { verifyPayment, isPaymentValidForForm } from './verify'
export type { VerifiedPayment, PaymentStatus } from './verify'
