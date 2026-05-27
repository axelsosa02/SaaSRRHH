"use client"
import { ExperienceForm } from "@/components/admin/experience/ExperienceForm"
import { ExperienceTable } from "@/components/admin/experience/ExperienceTable"
import { getExperience, deleteExperience } from "@/lib/services/experiencia/experience"
import { Experience } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle, Users } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

export default function ExperiencePage() {

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [experience, setExperience] = useState<Experience[]>([])
    const [loading, setLoading] = useState(true)
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null)

    const fetchExperience = async () => {
        setLoading(true);
        try {
            const data = await getExperience()
            setExperience(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al obtener las experiencias");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchExperience()
    }, [])

    const handleCreate = () => {
        setEditingExperience(null);
        setIsDialogOpen(true);
    }

    const handleEdit = (experience: Experience) => {
        setEditingExperience(experience);
        setIsDialogOpen(true);
    }

    const handleDelete = async (id: string) => {
        await Swal.fire({
            title: "¿Estás seguro de eliminar esta experiencia?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteExperience(id);
                    toast.success("Experiencia eliminada correctamente");
                    fetchExperience();
                } catch (error) {
                    console.error(error);
                    toast.error("Error al eliminar la experiencia");
                }
            }
        });
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* ── Encabezado ── */}
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="size-5" />
                </div>
                <div className="flex justify-between w-full">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Experiencia</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las experiencias de tu organización
                        </p>
                    </div>
                    <div>
                        <Button className="flex items-center gap-2" onClick={handleCreate}>
                            <PlusCircle className="h-4 w-4" />
                            Crear Experiencia
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Tabla de Experiencias ── */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <ExperienceTable
                    experiences={experience} //datos para mostrar
                    onEdit={handleEdit} //editar
                    onDelete={(handleDelete)} //eliminar
                />
            )}

            {/* ── Formulario de Experiencia ── */}
            <ExperienceForm
                isOpen={isDialogOpen} //mantiene abierto o cerrado
                onClose={() => setIsDialogOpen(false)} //cierra el modal
                experience={editingExperience} //prellenado o vacío
                onSuccess={() => {
                    fetchExperience();
                    toast.success(editingExperience ? "Experiencia actualizada" : "Experiencia creada");
                }}
            />
        </div>
    )
}
