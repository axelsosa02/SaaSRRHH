'use client'

import { Availability } from "@/types/database"
import { GenericMasterTable } from "../shared/GenericMasterTable"

interface AvailabilityTableProps {
    availability: Availability[]
    onEdit: (availability: Availability) => void
    onDelete: (id: string) => void
}

export function DisponibilidadTable({ availability, onEdit, onDelete }: AvailabilityTableProps) {
    const columns = [
        {
            header: "Nombre",
            accessor: "nombre" as keyof Availability,
            render: (availability: Availability) => <span className="font-medium">{availability.nombre}</span>
        },
        {
            header: "Fecha de Creación",
            accessor: "created_at" as keyof Availability,
            render: (availability: Availability) => {
                if (!availability.created_at) return <span className="text-sm text-muted-foreground">-</span>;
                const date = new Date(availability.created_at);
                return (
                    <span className="text-sm text-muted-foreground">
                        {isNaN(date.getTime())
                            ? 'Fecha inválida'
                            : date.toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                    </span>
                );
            }
        }
    ];
    return (
        <GenericMasterTable
            data={availability}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage="No hay disponibilidades registradas."
        />
    )
}