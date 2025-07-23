"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Factura } from "@/lib/types"
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
  onDelete: (id: number) => void,
  onViewDetails: (factura: Factura) => void,
  onPrint: (id: number) => void,
  hasPermission: (subModulo: string, accion: 'C' | 'R' | 'U' | 'D') => boolean
): ColumnDef<Factura>[] => {
  const canDelete = hasPermission('Facturas', 'D');

  const columns: ColumnDef<Factura>[] = [
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
        const factura = row.original;
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
              <DropdownMenuItem onClick={() => onViewDetails(factura)}>
                Mostrar Detalles
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => onPrint(factura.id_factura)}>
                Imprimir
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem 
                    onClick={() => onDelete(factura.id_factura)} 
                    className="text-destructive"
                    disabled={!factura.isDeletable}
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
      accessorKey: "numero_factura",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            N° Factura
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "id_factura",
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
      id: "cliente_nombre",
      accessorFn: row => {
        const cliente = row.cliente;
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : "";
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cliente
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const cliente = row.original.cliente;
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A';
      }
    },
    {
      accessorKey: "fecha_factura",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha de Factura
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
          try {
              const dateString = row.getValue("fecha_factura") as string;
              if (!dateString || !dateString.includes('T')) {
                return "Fecha inválida";
              }
              const datePart = dateString.split('T')[0];
              const [year, month, day] = datePart.split('-');
              
              if (!year || !month || !day) {
                return "Fecha inválida";
              }

              return `${day}/${month}/${year}`;
          } catch (error) {
              return "Fecha inválida";
          }
      }
    },
    {
      accessorKey: "tipo_pago",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tipo de Pago
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const tipoPago = row.original.tipo_pago;
        return <div className="capitalize">{tipoPago}</div>;
      }
    },
    {
      accessorKey: "monto_total",
      header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Monto Total
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("monto_total"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
   
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "estado_factura",
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
          const status = (row.getValue("estado_factura") as string || "").toLowerCase();
          let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
          
          if (status === 'pagada' || status === 'pagado') variant = 'default';
          else if (status === 'no pagada' || status === 'pendiente' || status === 'credito') variant = 'outline';
          else if (status === 'anulada') variant = 'destructive';
          
          return <Badge variant={variant} className="capitalize">{row.getValue("estado_factura")}</Badge>;
      }
    },
  ];

  if (!canDelete) {
      return columns.filter(col => col.id !== 'actions');
  }
  return columns;
}
