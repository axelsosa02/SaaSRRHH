'use client';

import { Area } from "@/types/database";
import { GenericMasterTable } from "../shared/GenericMasterTable";

interface AreaTableProps {
    areas: Area[];
    onEdit: (area: Area) => void;
    onDelete: (id: string) => void;
}

export function AreaTable({ areas, onEdit, onDelete }: AreaTableProps) {
    const columns = [
        {
            header: "Nombre",
            accessor: "nombre" as keyof Area,
            render: (area: Area) => <span className="font-medium">{area.nombre}</span>
        },
        {
            header: "Fecha de Creación",
            accessor: "created_at" as keyof Area,
            render: (area: Area) => {
                if (!area.created_at) return <span className="text-sm text-muted-foreground">-</span>;
                const date = new Date(area.created_at);
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
            data={areas}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage="No hay áreas de trabajo registradas."
        />
    );
}
