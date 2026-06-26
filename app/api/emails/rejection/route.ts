import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { candidateId, orgId } = body

        if (!candidateId || !orgId) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos: candidateId, orgId' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Obtener datos del candidato
        const { data: candidate, error: candidateError } = await supabase
            .from('candidates')
            .select('nombre, apellido, email')
            .eq('id', candidateId)
            .single()

        if (candidateError || !candidate) {
            return NextResponse.json({ error: 'Candidato no encontrado' }, { status: 404 })
        }

        // Obtener configuración de email de la organización
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('nombre, mail_rechazo_asunto, mail_rechazo, email_contacto')
            .eq('id', orgId)
            .single()

        if (orgError || !org) {
            return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 })
        }

        // Si no hay template de rechazo configurado, omitir silenciosamente
        if (!org.mail_rechazo_asunto || !org.mail_rechazo) {
            return NextResponse.json({ success: true, skipped: true, reason: 'Sin template de rechazo configurado' })
        }

        // Reemplazar placeholder [nombre]
        const nombreCompleto = `${candidate.nombre} ${candidate.apellido}`
        const asunto = org.mail_rechazo_asunto
        const cuerpo = org.mail_rechazo.replace(/\[nombre\]/g, candidate.nombre)

        // En desarrollo sin dominio verificado, Resend solo permite enviar al propio email.
        const isDev = process.env.NODE_ENV === 'development'
        const devOverride = process.env.DEV_EMAIL_OVERRIDE
        const actualTo = isDev && devOverride ? devOverride : candidate.email
        const subjectPrefix = isDev && devOverride ? `[TEST → ${candidate.email}] ` : ''

        const { error: resendError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: actualTo,
            subject: `${subjectPrefix}${asunto}`,
            text: cuerpo,
        })

        if (resendError) {
            console.error('Resend error (rejection):', resendError)
            return NextResponse.json({ error: resendError.message }, { status: 500 })
        }

        // Guardar registro en la tabla emails
        const { error: dbError } = await supabase.from('emails').insert({
            candidate_id: candidateId,
            org_id: orgId,
            asunto,
            cuerpo,
            tipo: 'rechazo',
            enviado: true,
            enviado_en: new Date().toISOString(),
        })

        if (dbError) {
            console.error('Error guardando email de rechazo en DB:', dbError)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error en /api/emails/rejection:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
