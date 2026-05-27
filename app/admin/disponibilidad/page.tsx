"use client"
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { deleteAvailability, getAvailability } from "@/lib/services/disponibilidad/availability";
import { Availability } from "@/types/database";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DisponibilidadForm } from "@/components/admin/disponibilidad/DisponibilidadForm";
import { DisponibilidadTable } from "@/components/admin/disponibilidad/DisponibilidadTable";

export default function DisponibilidadPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            const data = await getAvailability();
            setAvailability(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAvailability();
    }, []);

    const handleCreate = () => {
        setEditingAvailability(null);
        setIsDialogOpen(true);
    }

    const handleEdit = (availability: Availability) => {
        setEditingAvailability(availability);
        setIsDialogOpen(true);
    }

    const handleDelete = async (id: string) => {
        await Swal.fire({
            title: "¿Estás seguro de eliminar esta disponibilidad?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteAvailability(id);
                    toast.success("Disponibilidad eliminada correctamente");
                    fetchAvailability();
                } catch (error) {
                    console.error(error);
                    toast.error("Error al eliminar la disponibilidad");
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
                        <h1 className="text-xl font-semibold tracking-tight">Disponibilidad</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las disponibilidades de tu organización
                        </p>
                    </div>
                    <div>
                        <Button className="flex items-center gap-2" onClick={handleCreate}>
                            <PlusCircle className="h-4 w-4" />
                            Crear Disponibilidad
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Tabla de Disponibilidad ── */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <DisponibilidadTable
                    availability={availability}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* ── Formulario de Disponibilidad ── */}
            <DisponibilidadForm
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                availability={editingAvailability}
                onSuccess={() => {
                    fetchAvailability();
                    toast.success(editingAvailability ? "Disponibilidad actualizada" : "Disponibilidad creada");
                }}
            />
        </div>
    )
}