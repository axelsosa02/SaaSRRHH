import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { candidateId, user_id, orgId, nombre, email, orgNombre, jobTitulo } = body

    if (!email || !nombre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, nombre' },
        { status: 400 }
      )
    }

    const empresa = orgNombre || 'nuestro equipo'
    const puesto = jobTitulo ? `para el puesto de <strong>${jobTitulo}</strong>` : 'a nuestra base de talentos'

    const asunto = `¡Gracias por postularte, ${nombre}!`

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${asunto}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#472825 0%,#7c3d35 100%);padding:40px 40px 32px;text-align:center;">
              <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:32px;">🎉</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                ¡Postulación recibida!
              </h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">
                ${empresa}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#1a1a2e;font-size:17px;font-weight:600;margin:0 0 8px;">
                Hola, <span style="color:#472825;">${nombre}</span> 👋
              </p>
              <p style="color:#52525b;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Nos alegra mucho que te hayas sumado ${puesto}.
                Tu información ya está en nuestra base de talentos y nuestro equipo la revisará con atención.
              </p>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f7;border-left:4px solid #472825;border-radius:0 8px 8px 0;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#472825;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">¿Qué pasa ahora?</p>
                    <ul style="color:#52525b;font-size:14px;line-height:1.8;margin:0;padding-left:18px;">
                      <li>Revisamos tu perfil y CV con detenimiento.</li>
                      <li>Si tu perfil encaja con una búsqueda activa, te contactamos.</li>
                      <li>Mantemos tu información en nuestra base de talentos.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="color:#52525b;font-size:14px;line-height:1.7;margin:0 0 4px;">
                Gracias por confiar en nosotros. ¡Mucho éxito en tu búsqueda laboral! 🚀
              </p>
              <p style="color:#52525b;font-size:14px;margin:16px 0 0;">
                Con cariño,<br/>
                <strong style="color:#472825;">El equipo de ${empresa}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e4e4e7;padding:24px 40px;text-align:center;">
              <p style="color:#a1a1aa;font-size:12px;margin:0;line-height:1.6;">
                Recibiste este email porque te postulaste a través de nuestra plataforma.<br/>
                Si crees que es un error, podés ignorar este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim()

    const textBody = `¡Hola ${nombre}!\n\nGracias por postularte ${jobTitulo ? `para el puesto de ${jobTitulo}` : 'a nuestra base de talentos'}. Tu información ya está registrada y nuestro equipo la revisará con atención.\n\n¿Qué pasa ahora?\n- Revisamos tu perfil y CV.\n- Si tu perfil encaja con una búsqueda activa, te contactamos.\n- Mantenemos tu información en nuestra base de talentos.\n\n¡Mucho éxito!\nEl equipo de ${empresa}`

    // En desarrollo sin dominio verificado, Resend solo permite enviar al propio email.
    const isDev = process.env.NODE_ENV === 'development'
    const devOverride = process.env.DEV_EMAIL_OVERRIDE
    const actualTo = isDev && devOverride ? devOverride : email
    const subjectPrefix = isDev && devOverride ? `[TEST → ${email}] ` : ''

    const { error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: actualTo,
      subject: `${subjectPrefix}${asunto}`,
      html: htmlBody,
      text: textBody,
    })

    if (resendError) {
      console.error('Resend error (welcome):', resendError)
      return NextResponse.json({ error: resendError.message }, { status: 500 })
    }

    // Guardar registro en la tabla emails usando admin client (bypasea RLS,
    // ya que el postulante no tiene sesión autenticada)
    const supabase = createAdminClient()
    const { error: dbError } = await supabase.from('emails').insert({
      candidate_id: candidateId || null,
      org_id: orgId,
      user_id: user_id,
      asunto,
      cuerpo: textBody,
      tipo: 'bienvenida',
      enviado: true,
      enviado_en: new Date().toISOString(),
    })

    if (dbError) {
      // El email ya se envió — solo logueamos sin fallar
      console.error('Error guardando email de bienvenida en DB:', dbError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en /api/emails/welcome:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
