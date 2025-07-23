"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Cliente } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const getColumns = (
  onEdit: (cliente: Cliente) => void,
  onDelete: (id: number) => void,
  hasPermission: (subModulo: string, accion: 'C' | 'R' | 'U' | 'D') => boolean
): ColumnDef<Cliente>[] => {
    const canUpdate = hasPermission('Clientes', 'U');
    const canDelete = hasPermission('Clientes', 'D');

    const columns: ColumnDef<Cliente>[] = [
        {
            id: "uso",
            header: "Uso",
            cell: ({ row }) => {
            const isDeletable = row.original.isDeletable
            const tooltipText = isDeletable ? "Este registro puede ser eliminado." : "Este registro está en uso y no puede ser eliminado."

            return (
                <Tooltip>
                <TooltipTrigger>
                    <div className={`h-2.5 w-2.5 rounded-full ${isDeletable ? 'bg-green-500' : 'bg-red-500'}`} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
                </Tooltip>
            )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
            const cliente = row.original;
            return (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {canUpdate && <DropdownMenuItem onClick={() => onEdit(cliente)}>Editar</DropdownMenuItem>}
                    {canDelete && (
                         <DropdownMenuItem 
                            onClick={() => onDelete(cliente.id_cliente)} 
                            className="text-destructive"
                            disabled={!cliente.isDeletable}
                            >
                            Eliminar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
                </DropdownMenu>
            )
            },
        },
        {
            id: "nombre_completo",
            accessorFn: row => `${row.nombre} ${row.apellido}`,
            header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Nombre
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
            },
        },
        {
            accessorKey: "numero_identificacion",
            header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Identificación
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
            },
            cell: ({ row }) => `${row.original.tipo_identificacion}: ${row.original.numero_identificacion}`,
        },
        {
            accessorKey: "correo_electronico",
            header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Correo Electrónico
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
            },
        },
        {
            accessorKey: "telefono",
            header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Teléfono
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
            },
        },
        {
            accessorKey: "nombre_tipo_cliente",
            header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Tipo
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
            },
            cell: ({ row }) => row.original.nombre_tipo_cliente || 'N/A',
        },
        {
            accessorKey: "estado",
            header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Estado
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
            },
            cell: ({ row }) => {
            const status = (row.getValue("estado") as string) || "";
            const isActive = status.toLowerCase() === "activo";
            return <Badge variant={isActive ? "default" : "secondary"}>{status}</Badge>;
            },
        },
    ];

    if (!canUpdate && !canDelete) {
        return columns.filter(col => col.id !== 'actions');
    }

    return columns;
}
