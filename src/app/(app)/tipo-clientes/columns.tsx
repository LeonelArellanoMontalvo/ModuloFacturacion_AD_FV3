"use client"

import { ColumnDef } from "@tanstack/react-table"
import { TipoCliente } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const getColumns = (
  onEdit: (tipo: TipoCliente) => void,
  onDelete: (id: number) => void,
  hasPermission: (subModulo: string, accion: 'C' | 'R' | 'U' | 'D') => boolean
): ColumnDef<TipoCliente>[] => {
  const canUpdate = hasPermission('Tipos de Cliente', 'U');
  const canDelete = hasPermission('Tipos de Cliente', 'D');

  const columns: ColumnDef<TipoCliente>[] = [
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
        const tipoCliente = row.original

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
              {canUpdate && <DropdownMenuItem onClick={() => onEdit(tipoCliente)}>Editar</DropdownMenuItem>}
              {canDelete && (
                <DropdownMenuItem 
                    onClick={() => onDelete(tipoCliente.id_tipcli)} 
                    className="text-destructive"
                    disabled={!tipoCliente.isDeletable}
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
      accessorKey: "id_tipcli",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "nombre",
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
      accessorKey: "monto_maximo",
      header: ({ column }) => {
          return (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Monto Máximo
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("monto_maximo"))
        const formatted = new Intl.NumberFormat("es-EC", {
          style: "currency",
          currency: "USD",
        }).format(amount)
   
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
  ];

  if (!canUpdate && !canDelete) {
    return columns.filter(col => col.id !== 'actions');
  }
  
  return columns;
}
