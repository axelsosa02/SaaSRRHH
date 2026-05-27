import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { addQuickCandidate, getAvailableCandidates, linkCandidateToJob } from '@/lib/services/kanban/kanban'

const schema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
    telefono: z.string().optional(),
    resumen: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    jobId: string
    onSuccess: () => void
}

export function AddCandidateModal({ isOpen, onClose, jobId, onSuccess }: Props) {
    const [activeTab, setActiveTab] = useState<'search' | 'create'>('search')
    const [loading, setLoading] = useState(false)
    const [availableCandidates, setAvailableCandidates] = useState<any[]>([])
    const [loadingCandidates, setLoadingCandidates] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [linkingId, setLinkingId] = useState<string | null>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            resumen: '',
        },
    })

    // Cargar candidatos disponibles cuando se abre el modal o cambia la pestaña a buscar
    useEffect(() => {
        if (isOpen && activeTab === 'search') {
            const fetchCandidates = async () => {
                setLoadingCandidates(true)
                try {
                    const data = await getAvailableCandidates(jobId)
                    setAvailableCandidates(data)
                } catch (error) {
                    console.error(error)
                    toast.error('Error al cargar candidatos del sistema')
                } finally {
                    setLoadingCandidates(false)
                }
            }
            fetchCandidates()
        }
    }, [isOpen, jobId, activeTab])

    const handleLinkCandidate = async (candidateId: string) => {
        setLinkingId(candidateId)
        try {
            await linkCandidateToJob(jobId, candidateId)
            toast.success('Candidato agregado al puesto')
            // Remover el candidato de la lista local
            setAvailableCandidates(prev => prev.filter(c => c.id !== candidateId))
            onSuccess()
        } catch (error) {
            console.error(error)
            toast.error('Error al vincular el candidato')
        } finally {
            setLinkingId(null)
        }
    }

    const onSubmit = async (data: FormValues) => {
        setLoading(true)
        try {
            await addQuickCandidate(jobId, data)
            toast.success('Candidato agregado')
            form.reset()
            onSuccess()
        } catch (error) {
            console.error(error)
            toast.error('Error al agregar candidato')
        } finally {
            setLoading(false)
        }
    }

    const filteredCandidates = availableCandidates.filter(c => {
        const search = searchTerm.toLowerCase()
        const fullName = `${c.nombre} ${c.apellido}`.toLowerCase()
        const email = (c.email || '').toLowerCase()
        return fullName.includes(search) || email.includes(search)
    })

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Agregar candidato</DialogTitle>
                </DialogHeader>

                {/* Tabs Selector */}
                <div className="flex border-b border-muted mb-2">
                    <button
                        type="button"
                        className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-all ${
                            activeTab === 'search'
                                ? 'border-primary text-primary font-semibold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('search')}
                    >
                        Buscar Existente
                    </button>
                    <button
                        type="button"
                        className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-all ${
                            activeTab === 'create'
                                ? 'border-primary text-primary font-semibold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('create')}
                    >
                        Cargar Manual
                    </button>
                </div>

                {activeTab === 'search' ? (
                    <div className="space-y-4 py-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar candidato por nombre o email..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loadingCandidates ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-2">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Cargando candidatos del sistema...</p>
                            </div>
                        ) : filteredCandidates.length === 0 ? (
                            <div className="text-center py-12 border rounded-xl border-dashed">
                                <p className="text-sm text-muted-foreground">
                                    {searchTerm
                                        ? 'No se encontraron resultados para tu búsqueda.'
                                        : 'No hay candidatos disponibles en el sistema o todos ya están en este puesto.'}
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                                {filteredCandidates.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/30 transition-all"
                                    >
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <span className="font-medium text-sm text-foreground truncate">
                                                {c.nombre} {c.apellido}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">{c.email}</span>
                                            {c.telefono && (
                                                <span className="text-xs text-muted-foreground truncate">{c.telefono}</span>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleLinkCandidate(c.id)}
                                            disabled={linkingId !== null}
                                        >
                                            {linkingId === c.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                            ) : null}
                                            Agregar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nombre"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="María" disabled={loading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="apellido"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellido</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="González" disabled={loading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo electrónico</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" placeholder="maria@email.com" disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefono"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="+54 341 555 1234" disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="resumen"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción / Notas iniciales <span className="text-muted-foreground">(opcional)</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Perfil del candidato, cómo llegó al proceso..."
                                                rows={3}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Agregar candidato
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}