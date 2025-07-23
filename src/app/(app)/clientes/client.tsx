"use client";

import React, { useState, useMemo, useTransition } from "react";
import { Cliente, TipoCliente } from "@/lib/types";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClienteForm } from "./form";
import { deleteCliente } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";

interface ClientesClientProps {
  data: Cliente[];
  tipos: TipoCliente[];
}

export function ClientesClient({ data, tipos }: ClientesClientProps) {
  const [isDeleting, startDeleting] = useTransition();
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);

  const noTipos = tipos.length === 0;

  const canCreate = hasPermission('Clientes', 'C');

  const handleCreate = () => {
    if (noTipos || !canCreate) return;
    setCurrentCliente(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setCurrentCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setClienteToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (clienteToDelete === null) return;
    startDeleting(async () => {
        const result = await deleteCliente(clienteToDelete);
        if (result?.error) {
            toast({
                title: "Error al eliminar",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Cliente eliminado",
                description: "El cliente ha sido eliminado exitosamente.",
            });
        }
        setIsDeleteDialogOpen(false);
        setClienteToDelete(null);
    });
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setCurrentCliente(null);
  };

  const columns = useMemo(() => getColumns(handleEdit, handleDeleteRequest, hasPermission), [hasPermission]);
  const filterOptions = [
    { value: "nombre_completo", label: "Nombre" },
    { value: "numero_identificacion", label: "Identificación" },
    { value: "nombre_tipo_cliente", label: "Tipo" },
    { value: "estado", label: "Estado" },
  ];

  return (
    <>
      {noTipos && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>
            No puede crear un cliente porque no hay tipos de cliente definidos. Por favor, cree un tipo de cliente primero.
          </AlertDescription>
        </Alert>
      )}
      <DataTable
        columns={columns}
        data={data}
        filterOptions={filterOptions}
        toolbar={
          canCreate ? (
            <Button onClick={handleCreate} disabled={noTipos}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Cliente
            </Button>
          ) : null
        }
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentCliente ? "Editar" : "Crear"} Cliente</DialogTitle>
            <DialogDescription>
              {currentCliente ? "Edite los detalles del cliente." : "Complete el formulario para crear un nuevo cliente."}
            </DialogDescription>
          </DialogHeader>
          <ClienteForm
            defaultValues={currentCliente}
            tipos={tipos}
            onCancel={() => setIsDialogOpen(false)}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente.
                Si el registro está en uso, la eliminación fallará.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
