'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Plus, Loader2, Tag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    getOrgTags,
    getCandidateTags,
    createTag,
    assignTagToCandidate,
    removeTagFromCandidate,
} from '@/lib/services/kanban/candidateProfile'
import { Tag as TagType, CandidateTag } from '@/types/database'

// Colores predefinidos para las etiquetas (se asignan según el hash del nombre)
const TAG_COLORS = [
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
]

function getTagColor(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

interface Props {
    candidateId: string
}

export function EtiquetasTab({ candidateId }: Props) {
    const [candidateTags, setCandidateTags] = useState<CandidateTag[]>([])
    const [orgTags, setOrgTags] = useState<TagType[]>([])
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [loading, setLoading] = useState(false)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    const fetchData = async () => {
        try {
            const [tags, orgTagsList] = await Promise.all([
                getCandidateTags(candidateId),
                getOrgTags(),
            ])
            setCandidateTags(tags)
            setOrgTags(orgTagsList)
        } catch (error) {
            console.error(error)
            toast.error('Error al cargar etiquetas')
        }
    }

    useEffect(() => {
        fetchData()
    }, [candidateId])

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // IDs de tags ya asignados al candidato
    const assignedTagIds = new Set(candidateTags.map(ct => ct.tag_id))

    // Etiquetas disponibles filtradas por input y no asignadas
    const filteredSuggestions = orgTags.filter(t =>
        !assignedTagIds.has(t.id) &&
        t.nombre.toLowerCase().includes(inputValue.toLowerCase())
    )

    // ¿El texto actual no coincide con ninguna etiqueta existente?
    const canCreateNew = inputValue.trim().length > 0 &&
        !orgTags.some(t => t.nombre.toLowerCase() === inputValue.trim().toLowerCase())

    const handleAssignTag = async (tagId: string) => {
        setLoading(true)
        try {
            await assignTagToCandidate(candidateId, tagId)
            toast.success('Etiqueta asignada')
            setInputValue('')
            setShowSuggestions(false)
            await fetchData()
        } catch (error) {
            console.error(error)
            toast.error('Error al asignar etiqueta')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateAndAssign = async () => {
        const nombre = inputValue.trim()
        if (!nombre) return
        setLoading(true)
        try {
            const newTag = await createTag(nombre)
            await assignTagToCandidate(candidateId, newTag.id)
            toast.success(`Etiqueta "${nombre}" creada y asignada`)
            setInputValue('')
            setShowSuggestions(false)
            await fetchData()
        } catch (error) {
            console.error(error)
            toast.error('Error al crear etiqueta')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveTag = async (candidateTagId: string) => {
        setRemovingId(candidateTagId)
        try {
            await removeTagFromCandidate(candidateTagId)
            setCandidateTags(prev => prev.filter(ct => ct.id !== candidateTagId))
            toast.success('Etiqueta removida')
        } catch (error) {
            console.error(error)
            toast.error('Error al remover etiqueta')
        } finally {
            setRemovingId(null)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (filteredSuggestions.length > 0) {
                handleAssignTag(filteredSuggestions[0].id)
            } else if (canCreateNew) {
                handleCreateAndAssign()
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold">Etiquetas</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Agregá etiquetas para clasificar y filtrar candidatos.
                    </p>
                </div>
            </div>

            {/* Etiquetas asignadas */}
            <div className="flex flex-wrap gap-2 min-h-[32px]">
                {candidateTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Sin etiquetas asignadas.</p>
                ) : (
                    candidateTags.map(ct => {
                        const tagName = ct.tag?.nombre || 'Sin nombre'
                        const color = getTagColor(tagName)
                        return (
                            <span
                                key={ct.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${color.bg} ${color.text} ${color.border}`}
                            >
                                <Tag className="h-3 w-3" />
                                {tagName}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(ct.id)}
                                    disabled={removingId === ct.id}
                                    className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
                                >
                                    {removingId === ct.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <X className="h-3 w-3" />
                                    )}
                                </button>
                            </span>
                        )
                    })
                )}
            </div>

            {/* Input para agregar etiquetas */}
            <div className="relative max-w-md">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value)
                                setShowSuggestions(true)
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribí para buscar o crear una etiqueta..."
                            disabled={loading}
                            className="pr-4"
                        />
                    </div>
                    {canCreateNew && (
                        <Button
                            size="sm"
                            onClick={handleCreateAndAssign}
                            disabled={loading}
                            className="shrink-0"
                        >
                            {loading ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                                <Plus className="h-3 w-3 mr-1" />
                            )}
                            Crear
                        </Button>
                    )}
                </div>

                {/* Sugerencias */}
                {showSuggestions && inputValue.length > 0 && filteredSuggestions.length > 0 && (
                    <div
                        ref={suggestionsRef}
                        className="absolute z-10 mt-1 w-full bg-background border rounded-lg shadow-lg max-h-[200px] overflow-y-auto"
                    >
                        {filteredSuggestions.map(tag => {
                            const color = getTagColor(tag.nombre)
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleAssignTag(tag.id)}
                                    disabled={loading}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                >
                                    <span className={`inline-block w-2 h-2 rounded-full ${color.bg} border ${color.border}`} />
                                    {tag.nombre}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Todas las etiquetas de la organización */}
            {orgTags.length > 0 && (
                <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                        Etiquetas disponibles de la organización
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {orgTags.filter(t => !assignedTagIds.has(t.id)).map(tag => {
                            const color = getTagColor(tag.nombre)
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleAssignTag(tag.id)}
                                    disabled={loading}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all hover:opacity-80 cursor-pointer ${color.bg} ${color.text} ${color.border} opacity-60`}
                                >
                                    <Plus className="h-2.5 w-2.5" />
                                    {tag.nombre}
                                </button>
                            )
                        })}
                        {orgTags.filter(t => !assignedTagIds.has(t.id)).length === 0 && (
                            <p className="text-xs text-muted-foreground italic">
                                Todas las etiquetas ya están asignadas.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
