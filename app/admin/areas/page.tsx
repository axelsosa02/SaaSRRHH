"use client"
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAreas, deleteArea } from "@/lib/services/areas/areas";
import { Area } from "@/types/database";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { AreaForm } from "@/components/admin/area/AreaForm";
import { AreaTable } from "@/components/admin/area/AreaTable";

export default function AreasPage() {
    //Controla si el modal (Dialog) está abierto o cerrado. Arranca en false (cerrado). Cuando la consultora hace click en "Crear Área" o "Editar", se pone en true y el modal aparece. Cuando cierra el modal, vuelve a false.
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    //Guarda la lista de áreas que vienen de Supabase. Arranca como array vacío [] porque todavía no se cargó nada. Cuando fetchAreas() termina exitosamente, se llena con los datos reales. Es lo que le pasás a <AreaTable /> para que las muestre en pantalla.
    const [areas, setAreas] = useState<Area[]>([]);
    //Indica si los datos se están cargando en este momento. Arranca en true porque al montar el componente inmediatamente empieza a traer datos. Mientras es true, se muestra el spinner <Loader2 />. Cuando fetchAreas() termina (con éxito o error), se pone en false y aparece la tabla.
    const [loading, setLoading] = useState(true);
    //Guarda el área que se está editando. Puede ser un objeto Area o null. Cuando es null significa que se está creando un área nueva. Cuando tiene un valor significa que se está editando un área existente. El <AreaForm /> recibe este valor y lo usa para saber si mostrar el formulario vacío o prellenado con los datos del área.
    const [editingArea, setEditingArea] = useState<Area | null>(null);

    const fetchAreas = async () => {
        setLoading(true); //pide datos a Supabase
        try {
            const data = await getAreas(); //ejecuta la función que tiene el SELECT * desde servicios/areas.ts
            setAreas(data); //la tabla se llena
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); //desaparece el spinner
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []); // [] significa que se ejecuta solo una vez al montar el componente

    const handleCreate = () => {
        setEditingArea(null); //formulario vacío
        setIsDialogOpen(true); //abre el modal
    };

    const handleEdit = (area: Area) => {
        setEditingArea(area); //formulario prellenado con los datos del área
        setIsDialogOpen(true); //abre el modal
    };

    const handleDelete = async (id: string) => {
        // if (!confirm("¿Estás seguro de eliminar esta área?")) return;

        await Swal.fire({
            title: "¿Estás seguro de eliminar esta área?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteArea(id);
                    toast.success("Área eliminada correctamente");
                    fetchAreas();
                } catch (error) {
                    console.error(error);
                    toast.error("Error al eliminar el área");
                }
            }
        });

        // try {
        //     await deleteArea(id);
        //     toast.success("Área eliminada correctamente");
        //     fetchAreas();
        // } catch (error) {
        //     console.error(error);
        //     toast.error("Error al eliminar el área");
        // }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* ── Encabezado ── */}
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="size-5" />
                </div>
                <div className="flex justify-between w-full">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Áreas de Trabajo</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las áreas de trabajo de tu organización
                        </p>
                    </div>
                    <div>
                        <Button className="flex items-center gap-2" onClick={handleCreate}>
                            <PlusCircle className="h-4 w-4" />
                            Crear Área
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Tabla de Áreas ── */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <AreaTable
                    areas={areas} //datos para mostrar
                    onEdit={handleEdit} //editar
                    onDelete={(handleDelete)} //eliminar
                />
            )}

            {/* ── Formulario de Área ── */}
            <AreaForm
                isOpen={isDialogOpen} //mantiene abierto o cerrado
                onClose={() => setIsDialogOpen(false)} //cierra el modal
                area={editingArea} //prellenado o vacío
                onSuccess={() => {
                    fetchAreas();
                    toast.success(editingArea ? "Área actualizada" : "Área creada");
                }}
            />
        </div>
    );
}
