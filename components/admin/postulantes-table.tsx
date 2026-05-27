"use client"

/**
 * PostulantesTable: Componente para visualizar y gestionar la lista de candidatos.
 * Utiliza @tanstack/react-table para la lógica de tablas (ordenamiento, filtrado, paginación).
 */

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronUp, FileText, Search, X } from "lucide-react"

import type { Area, Availability, Experience } from "@/types/database"
import type { Candidates } from "@/types/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// ── Helpers de color por variante ──────────────────────────────────────────────

// const experienciaColor: Record<Experience, string> = {
//     "Sin experiencia": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
//     Junior: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
//     "Semi-Senior": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
//     Senior: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
// }

// const disponibilidadColor: Record<Availability, string> = {
//     Inmediata: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
//     "2 semanas": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
//     "1 mes": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
//     "Más de 1 mes": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
// }

// ── Definición de Columnas ─────────────────────────────────────────────────────
/**
 * Define la estructura y el comportamiento de cada columna de la tabla.
 */

const columns: ColumnDef<Candidates>[] = [
    {
        // Columna combinada de Nombre y Apellido
        id: "nombre_completo",
        accessorFn: (row) => `${row.nombre} ${row.apellido}`,
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Postulante
                {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="size-3.5" />
                ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="size-3.5" />
                ) : (
                    <ArrowUpDown className="size-3.5 opacity-40" />
                )}
            </button>
        ),
        cell: ({ row }) => (
            <div>
                <p className="font-medium text-foreground">
                    {row.original.nombre} {row.original.apellido}
                </p>
                <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
        ),
    },
    {
        accessorKey: "puesto",
        header: "Puesto",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">{row.original.puesto}</span>
        ),
    },
    {
        // Columna de Área con filtro exacto
        accessorKey: "area",
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Área
                {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="size-3.5" />
                ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="size-3.5" />
                ) : (
                    <ArrowUpDown className="size-3.5 opacity-40" />
                )}
            </button>
        ),
        cell: ({ row }) => (
            <Badge variant="outline" className="font-normal">
                {row.original.area}
            </Badge>
        ),
        filterFn: (row, columnId, value) => {
            // Si el valor es "all" o no hay valor, no aplica filtro (muestra todos)
            if (!value || value === "all") return true
            return row.getValue(columnId) === value
        },
    },
    {
        // Columna de Experiencia con filtro exacto
        accessorKey: "experiencia",
        header: "Experiencia",
        cell: ({ row }) => {
            const exp = row.original.experiencia
            return (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}
                >
                    {exp}
                </span>
            )
        },
        filterFn: (row, columnId, value) => {
            if (!value || value === "all") return true
            return row.getValue(columnId) === value
        },
    },
    {
        // Columna de Disponibilidad con filtro exacto
        accessorKey: "disponibilidad",
        header: "Disponibilidad",
        cell: ({ row }) => {
            const disp = row.original.disponibilidad
            return (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}
                >
                    {disp}
                </span>
            )
        },
        filterFn: (row, columnId, value) => {
            if (!value || value === "all") return true
            return row.getValue(columnId) === value
        },
    },
    {
        // Columna de Localidad con filtro exacto
        accessorKey: "localidad",
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Localidad
                {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="size-3.5" />
                ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="size-3.5" />
                ) : (
                    <ArrowUpDown className="size-3.5 opacity-40" />
                )}
            </button>
        ),
        cell: ({ row }) => (
            <span className="text-sm">{row.original.localidad}</span>
        ),
        filterFn: (row, columnId, value) => {
            if (!value || value === "all") return true
            return row.getValue(columnId) === value
        },
    },
    {
        // Columna de Fecha de Postulación con ordenamiento y formato local
        accessorKey: "fechaPostulacion",
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Fecha
                {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="size-3.5" />
                ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="size-3.5" />
                ) : (
                    <ArrowUpDown className="size-3.5 opacity-40" />
                )}
            </button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.fechaPostulacion + "T00:00:00")
            return (
                <span className="text-sm text-muted-foreground">
                    {date.toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            )
        },
    },
    // Columna para visualizar el CV del postulante (abre en nueva pestaña)
    {
        accessorKey: "cv_url",
        header: "CV",
        cell: ({ row }) => {
            const url = row.original.cv_url
            if (!url) {
                return (
                    <span className="text-xs text-muted-foreground italic">
                        Sin CV
                    </span>
                )
            }
            return (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 cursor-pointer"
                    onClick={() => window.open(url, "_blank")}
                >
                    <FileText className="size-4" />
                    Ver CV
                </Button>
            )
        },
    },
]

interface PostulantesTableProps {
    data: Candidates[]
    areas: Area[]
    experience: Experience[]
    availability: Availability[]
}

// ── Componente Principal ───────────────────────────────────────────────────────

export function PostulantesTable({ data, areas, experience, availability }: PostulantesTableProps) {
    // Estado para el ordenamiento de las columnas
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "fechaPostulacion", desc: true },
    ])
    // Estado para los filtros específicos de cada columna
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    // Estado para la búsqueda global (texto libre)
    const [globalFilter, setGlobalFilter] = React.useState("")

    // Extrae una lista única de localidades de los datos para el filtro de localidad
    const localidades = React.useMemo(
        () => Array.from(new Set(data.map((p) => p.localidad))).sort(),
        [data]
    )

    // Configuración central de la tabla con TanStack Table
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // Lógica personalizada para la búsqueda global
        globalFilterFn: (row, _columnId, value) => {
            const search = value.toLowerCase()
            return (
                row.original.nombre.toLowerCase().includes(search) ||
                row.original.apellido.toLowerCase().includes(search) ||
                row.original.email.toLowerCase().includes(search) ||
                row.original.puesto.toLowerCase().includes(search) ||
                row.original.localidad.toLowerCase().includes(search) ||
                row.original.area.toLowerCase().includes(search) ||
                row.original.experiencia.toLowerCase().includes(search) ||
                row.original.disponibilidad.toLowerCase().includes(search)
            )
        },
        state: { sorting, columnFilters, globalFilter },
        initialState: { pagination: { pageSize: 10 } },
    })

    // Determina si hay algún filtro activo para mostrar el botón de "Limpiar"
    const hasFilters =
        globalFilter !== "" ||
        columnFilters.length > 0

    // Función para resetear todos los filtros
    function clearFilters() {
        setGlobalFilter("")
        setColumnFilters([])
    }

    // Helpers para simplificar el manejo de valores de filtros en los Selects
    // Retorna undefined cuando no hay filtro activo para que el Select muestre el placeholder
    function getFilterValue(colId: string): string | undefined {
        return (table.getColumn(colId)?.getFilterValue() as string) ?? undefined
    }

    // Cuando se selecciona "all", se limpia el filtro (undefined) para volver al placeholder
    function setFilterValue(colId: string, value: string | null) {
        table.getColumn(colId)?.setFilterValue(value === "all" ? undefined : value)
    }

    return (
        <div className="space-y-4 ">
            {/* ── SECCIÓN DE FILTROS ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                {/* Búsqueda Global: Filtra por nombre, email o puesto */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        id="postulantes-search"
                        placeholder="Buscar por nombre, email, puesto…"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>

                {/* Filtro por Área de Trabajo */}
                <Select
                    value={getFilterValue("area")}
                    onValueChange={(v) => setFilterValue("area", v)}
                >
                    <SelectTrigger id="filter-area" className="h-8 w-[170px] text-sm">
                        <SelectValue placeholder="Área de trabajo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las áreas</SelectItem>
                        {areas.map((a) => (
                            <SelectItem key={a.id} value={a.nombre}>{a.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filtro por Nivel de Experiencia */}
                <Select
                    value={getFilterValue("experiencia")}
                    onValueChange={(v) => setFilterValue("experiencia", v)}
                >
                    <SelectTrigger id="filter-experiencia" className="h-8 w-[160px] text-sm">
                        <SelectValue placeholder="Experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las experiencias</SelectItem>
                        {experience.map((e) => (
                            <SelectItem key={e.id} value={e.description}>{e.description}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filtro por Disponibilidad horaria/inicio */}
                <Select
                    value={getFilterValue("disponibilidad")}
                    onValueChange={(v) => setFilterValue("disponibilidad", v)}
                >
                    <SelectTrigger id="filter-disponibilidad" className="h-8 w-[160px] text-sm">
                        <SelectValue placeholder="Disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Cualquier disponibilidad</SelectItem>
                        {availability.map((d) => (
                            <SelectItem key={d.id} value={d.nombre}>{d.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filtro por Localidad (dinámico basado en los datos) */}
                <Select
                    value={getFilterValue("localidad")}
                    onValueChange={(v) => setFilterValue("localidad", v as string)}
                >
                    <SelectTrigger id="filter-localidad" className="h-8 w-[150px] text-sm">
                        <SelectValue placeholder="Localidad" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las localidades</SelectItem>
                        {localidades.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Botón para resetear todos los filtros aplicados */}
                {hasFilters && (
                    <Button
                        id="clear-filters"
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-3.5" />
                        Limpiar
                    </Button>
                )}
            </div>

            {/* ── CONTADOR DE RESULTADOS ── */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    {table.getFilteredRowModel().rows.length} de {data.length} postulantes
                    {hasFilters && " (filtrados)"}
                </span>
            </div>

            {/* ── CUERPO DE LA TABLA ── */}
            <div className="w-full rounded-lg border bg-card overflow-hidden">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    No se encontraron postulantes con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── CONTROLES DE PAGINACIÓN ── */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        id="pagination-prev"
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        id="pagination-next"
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    )
}
