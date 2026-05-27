'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface GenericMasterTableProps<T> {
    data: T[];
    columns: {
        header: string;
        accessor: keyof T;
        render?: (item: T) => React.ReactNode;
    }[];
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
    idField?: keyof T;
    emptyMessage?: string;
}

export function GenericMasterTable<T>({ 
    data, 
    columns, 
    onEdit, 
    onDelete, 
    idField = 'id' as keyof T,
    emptyMessage = "No hay registros disponibles."
}: GenericMasterTableProps<T>) {
    return (
        <div className="rounded-md border max-w-4xl">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col, idx) => (
                            <TableHead key={idx}>{col.header}</TableHead>
                        ))}
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length + 1} className="text-center py-10 text-muted-foreground">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item, idx) => (
                            <TableRow key={String(item[idField]) || idx}>
                                {columns.map((col, colIdx) => (
                                    <TableCell key={colIdx}>
                                        {col.render ? col.render(item) : String(item[col.accessor])}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(item)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(String(item[idField]))}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
