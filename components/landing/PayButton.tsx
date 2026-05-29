'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PayButtonProps {
    orgId: string
    orgSlug: string
    colorBrand?: string
}

export function PayButton({ orgId, orgSlug, colorBrand = '#472825' }: PayButtonProps) {
    const [loading, setLoading] = useState(false)

    async function handlePay() {
        setLoading(true)
        try {
            // 1. Creamos un registro de pago pendiente en nuestra DB
            const tokenRes = await fetch('/api/mercadopago/create-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orgId }),
            })

            if (!tokenRes.ok) throw new Error('No se pudo iniciar el pago')
            const { token } = await tokenRes.json() as { token: string }

            // 2. Creamos la preference de MP pasando el token como external_reference
            const prefRes = await fetch('/api/mercadopago/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orgId, orgSlug, token }),
            })

            if (!prefRes.ok) throw new Error('No se pudo crear la preferencia de pago')
            const { initPoint, sandboxInitPoint } = await prefRes.json() as {
                initPoint: string
                sandboxInitPoint: string
            }

            // En desarrollo usamos sandbox, en producción init_point
            const url = process.env.NODE_ENV === 'production' ? initPoint : sandboxInitPoint

            // 3. Redirigimos a Mercado Pago
            window.location.href = url
        } catch (error) {
            console.error(error)
            toast.error('Ocurrió un error al iniciar el pago. Intentá de nuevo.')
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handlePay}
            disabled={loading}
            className="w-full h-12 text-lg font-bold flex gap-2 items-center text-white cursor-pointer"
            style={{ backgroundColor: colorBrand }}
        >
            {loading ? (
                <>
                    <Loader2 className="size-5 animate-spin" />
                    Iniciando pago...
                </>
            ) : (
                <>
                    <CreditCard className="size-5 text-white" />
                    Pagar con Mercado Pago
                </>
            )}
        </Button>
    )
}
