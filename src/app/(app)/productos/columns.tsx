"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Producto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown } from "lucide-react"

export const getColumns = (): ColumnDef<Producto>[] => [
  {
    accessorKey: "codigo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Código
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
    cell: ({ row }) => <div className="min-w-[200px]">{row.original.nombre}</div>,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => <div className="min-w-[300px] text-muted-foreground">{row.original.descripcion}</div>,
  },
  {
    accessorKey: "pvp",
    accessorFn: (row) => row.precio,
    header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Precio (PVP)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
    },
    cell: ({ row }) => {
      const amount = parseFloat(String(row.original.precio));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "stock_disponible",
    header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Stock
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
    },
    cell: ({ row }) => <div className="text-center">{row.original.stock_disponible}</div>
  },
  {
    accessorKey: "graba_iva",
    header: "Graba IVA",
    cell: ({ row }) => {
      const grabaIva = row.original.graba_iva;
      return <Badge variant={grabaIva ? "default" : "secondary"}>{grabaIva ? "Sí" : "No"}</Badge>;
    },
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
]
