'use client';

import { Experience } from "@/types/database";
import { GenericMasterTable } from "../shared/GenericMasterTable";

interface ExperienceTableProps {
    experiences: Experience[];
    onEdit: (experience: Experience) => void;
    onDelete: (id: string) => void;
}

export function ExperienceTable({ experiences, onEdit, onDelete }: ExperienceTableProps) {
    const columns = [
        {
            header: "Descripción",
            accessor: "description" as keyof Experience,
            render: (exp: Experience) => <span className="font-medium">{exp.description}</span>
        },
        {
            header: "Fecha de Creación",
            accessor: "created_at" as keyof Experience,
            render: (exp: Experience) => {
                if (!exp.created_at) return <span className="text-sm text-muted-foreground">-</span>;
                const date = new Date(exp.created_at);
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
            data={experiences}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage="No hay niveles de experiencia registrados."
        />
    );
}
