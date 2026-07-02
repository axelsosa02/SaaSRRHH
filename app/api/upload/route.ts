import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const orgId = formData.get('orgId') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 })
        }
        if (!orgId) {
            return NextResponse.json({ error: 'Falta orgId' }, { status: 400 })
        }

        const supabase = createAdminClient()

        const ext = file.name.split('.').pop()
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
        const path = `${orgId}/${Date.now()}_${cleanName}.${ext}`

        // Convertir File a ArrayBuffer para subir a Supabase
        const buffer = await file.arrayBuffer()

        const { error } = await supabase.storage
            .from('documents')
            .upload(path, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (error) {
            console.error('Error al subir a storage:', error)
            return NextResponse.json({ error: 'Error al subir el archivo a storage' }, { status: 500 })
        }

        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)

        return NextResponse.json({ url: urlData.publicUrl })
    } catch (err: any) {
        console.error('Error en upload API:', err)
        return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
    }
}
