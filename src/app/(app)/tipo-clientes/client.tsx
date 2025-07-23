"use client"

import React, { useState, useMemo, useTransition } from "react"
import { TipoCliente } from "@/lib/types"
import { getColumns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { TipoClienteForm, FormValues } from "./form"
import { createTipoCliente, updateTipoCliente, deleteTipoCliente } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/AuthContext"

interface TipoClientesClientProps {
  data: TipoCliente[]
}

export function TipoClientesClient({ data }: TipoClientesClientProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const { hasPermission } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTipo, setCurrentTipo] = useState<TipoCliente | null>(null)
  const [tipoToDelete, setTipoToDelete] = useState<number | null>(null)

  const canCreate = hasPermission('Tipos de Cliente', 'C');

  const handleCreate = () => {
    if (!canCreate) return;
    setCurrentTipo(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (tipo: TipoCliente) => {
    setCurrentTipo(tipo)
    setIsDialogOpen(true)
  }

  const handleDeleteRequest = (id: number) => {
    setTipoToDelete(id);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (tipoToDelete === null) return;
    startTransition(async () => {
        const result = await deleteTipoCliente(tipoToDelete);
        if (result?.error) {
            toast({
                title: "Error al eliminar",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Tipo de cliente eliminado",
                description: "El tipo de cliente ha sido eliminado exitosamente.",
            });
        }
        setIsDeleteDialogOpen(false);
        setTipoToDelete(null);
    });
  }

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      const action = currentTipo ? updateTipoCliente(currentTipo.id_tipcli, values) : createTipoCliente(values)
      const result = await action
      
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: `Éxito`,
          description: `Tipo de cliente ${currentTipo ? 'actualizado' : 'creado'} con éxito.`,
        })
        setIsDialogOpen(false)
        setCurrentTipo(null)
      }
    })
  }

  const columns = useMemo(() => getColumns(handleEdit, handleDeleteRequest, hasPermission), [hasPermission])

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterKey="nombre"
        toolbar={
          canCreate ? (
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Tipo
            </Button>
          ) : null
        }
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTipo ? "Editar" : "Crear"} Tipo de Cliente</DialogTitle>
            <DialogDescription>
              {currentTipo ? "Edite los detalles del tipo de cliente." : "Complete el formulario para crear un nuevo tipo de cliente."}
            </DialogDescription>
          </DialogHeader>
          <TipoClienteForm
            onSubmit={handleSubmit}
            defaultValues={currentTipo}
            isPending={isPending}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de cliente.
                Si el registro está en uso, la eliminación fallará.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isPending}>
                {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
