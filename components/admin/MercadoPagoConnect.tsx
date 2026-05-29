'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Link2, Link2Off, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

interface MercadoPagoConnectProps {
    mpConnected: boolean
    mpUserId: string | null
}

/**
 * Widget de configuración de Mercado Pago en el panel admin.
 * Permite conectar/desconectar la cuenta de MP de la organización.
 * El dinero de los candidatos irá directo a la cuenta conectada.
 */
export function MercadoPagoConnect({ mpConnected: initialConnected, mpUserId }: MercadoPagoConnectProps) {
    const [connected, setConnected] = useState(initialConnected)
    const [disconnecting, setDisconnecting] = useState(false)
    const searchParams = useSearchParams()

    // Leemos el resultado del OAuth desde la URL (?mp=connected|error|cancelled)
    useEffect(() => {
        const mpStatus = searchParams.get('mp')
        if (mpStatus === 'connected') {
            setConnected(true)
            toast.success('¡Mercado Pago conectado correctamente!')
            // Limpiamos el param de la URL sin recargar
            window.history.replaceState({}, '', window.location.pathname)
        } else if (mpStatus === 'error') {
            toast.error('Error al conectar Mercado Pago. Intentá de nuevo.')
            window.history.replaceState({}, '', window.location.pathname)
        } else if (mpStatus === 'cancelled') {
            toast('Conexión cancelada.')
            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [searchParams])

    const handleConnect = () => {
        // Redirigimos a la route que inicia el OAuth
        window.location.href = '/api/mercadopago/oauth/authorize'
    }

    const handleDisconnect = async () => {
        if (!confirm('¿Desconectar Mercado Pago? Los candidatos no podrán pagar hasta que vuelvas a conectar.')) return

        setDisconnecting(true)
        try {
            const res = await fetch('/api/mercadopago/oauth/disconnect', { method: 'POST' })
            if (!res.ok) throw new Error()
            setConnected(false)
            toast.success('Mercado Pago desconectado.')
        } catch {
            toast.error('Error al desconectar. Intentá de nuevo.')
        } finally {
            setDisconnecting(false)
        }
    }

    return (
        <div className="border rounded-xl p-5 bg-card space-y-4">
            <div>
                <h2 className="text-sm font-medium">Cuenta de Mercado Pago</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Conectá tu cuenta de MP para recibir los pagos de los candidatos directamente.
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                {/* Estado de conexión */}
                <div className="flex items-center gap-3">
                    {connected ? (
                        <>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-700">Conectado</p>
                                {mpUserId && (
                                    <p className="text-xs text-muted-foreground">ID de usuario MP: {mpUserId}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-700">No conectado</p>
                                <p className="text-xs text-muted-foreground">
                                    Los candidatos no pueden pagar hasta que conectes tu cuenta.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Acciones */}
                {connected ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        className="shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                        {disconnecting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Link2Off className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1.5">Desconectar</span>
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={handleConnect}
                        className="shrink-0"
                    >
                        <Link2 className="h-3.5 w-3.5" />
                        <span className="ml-1.5">Conectar MP</span>
                    </Button>
                )}
            </div>

            {!connected && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                    Al conectar, serás redirigido a Mercado Pago para autorizar el acceso. 
                    El dinero de cada pago irá directo a tu cuenta sin pasar por intermediarios.
                </p>
            )}
        </div>
    )
}
