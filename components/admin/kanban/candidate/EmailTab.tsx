'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Send, Loader2, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createClient } from '@/lib/supabase/client'
import type { EmailRecord } from '@/types/database'

const emailSchema = z.object({
    asunto: z.string().min(1, 'El asunto es requerido'),
    cuerpo: z.string().min(1, 'El cuerpo es requerido'),
})

type EmailValues = z.infer<typeof emailSchema>

interface Props {
    candidateId: string
    candidateEmail: string
}

export function EmailTab({ candidateId, candidateEmail }: Props) {
    const [history, setHistory] = useState<EmailRecord[]>([])
    const [sending, setSending] = useState(false)

    const fetchHistory = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('emails')
            .select('*')
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false })
        setHistory((data || []) as EmailRecord[])
    }

    useEffect(() => { fetchHistory() }, [candidateId])

    const form = useForm<EmailValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { asunto: '', cuerpo: '' },
    })

    const onSubmit = async (data: EmailValues) => {
        setSending(true)
        try {
            const response = await fetch('/api/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId,
                    to: candidateEmail,
                    asunto: data.asunto,
                    cuerpo: data.cuerpo,
                    tipo: 'individual',
                }),
            })

            if (!response.ok) throw new Error('Error al enviar')

            toast.success(`Correo enviado a ${candidateEmail}`)
            form.reset()
            fetchHistory()
        } catch (error) {
            console.error(error)
            toast.error('Error al enviar el correo')
        } finally {
            setSending(false)
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="space-y-8">
            {/* Formulario */}
            <div>
                <h2 className="text-sm font-semibold mb-4">
                    Enviar correo a <span className="text-primary">{candidateEmail}</span>
                </h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="asunto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asunto</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej: Continuamos con tu proceso de selección" disabled={sending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cuerpo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensaje</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Escribí el mensaje para el candidato..."
                                            rows={6}
                                            disabled={sending}
                                            className="resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={sending}>
                                {sending
                                    ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    : <Send className="h-4 w-4 mr-2" />
                                }
                                Enviar correo
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            {/* Historial */}
            <div>
                <h2 className="text-sm font-semibold mb-3">Historial de correos</h2>
                {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin correos enviados.</p>
                ) : (
                    <div className="space-y-3">
                        {history.map(email => (
                            <div key={email.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <p className="text-sm font-medium">{email.asunto}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {formatDate(email.created_at)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3 pl-6">
                                    {email.cuerpo}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}