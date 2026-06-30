import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClientServer } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { candidateId, to, asunto, cuerpo, tipo = 'individual' } = body

        if (!to || !asunto || !cuerpo) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos: to, asunto, cuerpo' },
                { status: 400 }
            )
        }

        // Usar el server client para que RLS tenga la sesión del usuario autenticado
        const supabase = await createClientServer()
        const { data: { user } } = await supabase.auth.getUser()

        let orgId = null
        let orgName = 'FlowATS'
        let replyTo = undefined

        if (user) {
            const { data: profile } = await supabase
                .from('users')
                .select('org_id')
                .eq('id', user.id)
                .single()

            if (profile?.org_id) {
                orgId = profile.org_id
                const { data: org } = await supabase
                    .from('organizations')
                    .select('nombre, email_contacto')
                    .eq('id', orgId)
                    .single()

                if (org) {
                    if (org.nombre) orgName = org.nombre
                    if (org.email_contacto) replyTo = org.email_contacto
                }
            }
        }

        // En desarrollo sin dominio verificado, Resend solo permite enviar al propio email.
        // DEV_EMAIL_OVERRIDE redirige todos los envíos a ese address.
        const isDev = process.env.NODE_ENV === 'development'
        const devOverride = process.env.DEV_EMAIL_OVERRIDE
        const actualTo = isDev && devOverride ? devOverride : to
        const subjectPrefix = isDev && devOverride ? `[TEST → ${to}] ` : ''

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@flowats.com.ar'
        const fromLabel = `${orgName} <${fromEmail}>`

        // Enviar el email con Resend
        const { error: resendError } = await resend.emails.send({
            from: fromLabel,
            to: actualTo,
            replyTo: replyTo,
            subject: `${subjectPrefix}${asunto}`,
            text: cuerpo,
        })

        if (resendError) {
            console.error('Resend error:', resendError)
            return NextResponse.json({ error: resendError.message }, { status: 500 })
        }

        const { error: dbError } = await supabase.from('emails').insert({
            candidate_id: candidateId || null,
            org_id: orgId,
            user_id: user?.id || null,
            asunto,
            cuerpo,
            tipo,
            enviado: true,
            enviado_en: new Date().toISOString(),
        })

        if (dbError) {
            // El email ya se envió — solo logueamos el error de DB sin fallar
            console.error('Error guardando email en DB:', dbError)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error en /api/emails:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
