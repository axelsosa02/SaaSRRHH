'use client'

import { useState } from 'react'
import { Upload, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { CandidateDB } from '@/types/database'

interface Props {
    candidate: CandidateDB
    onRefresh: () => void
}

export function CurriculumTab({ candidate, onRefresh }: Props) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Solo se permiten archivos PDF o Word')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('El archivo no puede superar los 5 MB')
            return
        }

        setUploading(true)
        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop()
            const path = `cv/${candidate.org_id}/${candidate.id}/cv_${Date.now()}.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(path, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)

            const { error: updateError } = await supabase
                .from('candidates')
                .update({ cv_url: urlData.publicUrl })
                .eq('id', candidate.id)

            if (updateError) throw updateError

            toast.success('CV actualizado correctamente')
            onRefresh()
        } catch (error) {
            console.error(error)
            toast.error('Error al subir el CV')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold">Currículum Vitae</h2>

            {/* CV actual */}
            {candidate.cv_url ? (
                <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">CV adjunto</p>
                            <p className="text-xs text-muted-foreground">Archivo cargado</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(candidate.cv_url!, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver CV
                        </Button>
                        <label className="cursor-pointer">
                            <Button variant="outline" size="sm" >
                                <span>
                                    {uploading
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <><Upload className="h-4 w-4 mr-2" />Reemplazar</>
                                    }
                                </span>
                            </Button>
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            ) : (
                // Sin CV — zona de carga
                <label className="cursor-pointer block">
                    <div className="border-2 border-dashed rounded-xl p-10 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Subiendo CV...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">Subir CV del candidato</p>
                                <p className="text-xs text-muted-foreground">PDF o Word · máx. 5 MB</p>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    )
}