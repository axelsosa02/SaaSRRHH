'use client'

import { useEffect, useState } from 'react'
import { Upload, FileText, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getDocuments, uploadDocument, deleteDocument } from '@/lib/services/kanban/candidateProfile'
import type { Document } from '@/types/database'

interface Props {
    candidateId: string
}

const TIPO_LABELS: Record<Document['tipo'], string> = {
    cv: 'CV',
    certificado: 'Certificado',
    referencia: 'Referencia',
    otro: 'Otro',
}

export function DocumentosTab({ candidateId }: Props) {
    const [documents, setDocuments] = useState<Document[]>([])
    const [uploading, setUploading] = useState(false)
    const [tipoSeleccionado, setTipoSeleccionado] = useState<Document['tipo']>('otro')

    const fetchDocs = async () => {
        const data = await getDocuments(candidateId)
        setDocuments(data)
    }

    useEffect(() => { fetchDocs() }, [candidateId])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo no puede superar los 10 MB')
            return
        }

        setUploading(true)
        try {
            await uploadDocument(candidateId, file, tipoSeleccionado)
            toast.success('Documento subido')
            fetchDocs()
        } catch (error) {
            console.error(error)
            toast.error('Error al subir el documento')
        } finally {
            setUploading(false)
            // Resetear el input
            e.target.value = ''
        }
    }

    const handleDelete = async (id: string, url: string) => {
        try {
            await deleteDocument(id, url)
            toast.success('Documento eliminado')
            fetchDocs()
        } catch {
            toast.error('Error al eliminar el documento')
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Documentos</h2>
            </div>

            {/* Zona de carga */}
            <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
                <p className="text-xs text-muted-foreground font-medium">Subir nuevo documento</p>
                <div className="flex gap-3 items-center">
                    <Select
                        value={tipoSeleccionado}
                        onValueChange={(v) => setTipoSeleccionado(v as Document['tipo'])}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="certificado">Certificado</SelectItem>
                            <SelectItem value="referencia">Referencia</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>

                    <label className="flex-1 cursor-pointer">
                        <div className="border border-dashed rounded-lg px-4 py-2.5 flex items-center gap-2 hover:border-primary/50 transition-colors">
                            {uploading
                                ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                : <Upload className="h-4 w-4 text-muted-foreground" />
                            }
                            <span className="text-sm text-muted-foreground">
                                {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
                            </span>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Lista de documentos */}
            {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin documentos cargados.</p>
            ) : (
                <div className="space-y-2">
                    {documents.map(doc => (
                        <div key={doc.id} className="border rounded-lg p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.nombre}</p>
                                <p className="text-xs text-muted-foreground">
                                    {TIPO_LABELS[doc.tipo]} · {formatDate(doc.created_at)}
                                </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(doc.url, '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(doc.id, doc.url)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}