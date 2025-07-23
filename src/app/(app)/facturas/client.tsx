
"use client";

import React, { useState, useMemo, useTransition, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Factura, Cliente, DetalleFactura } from "@/lib/types";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateFacturaStatusBatch } from "@/lib/actions";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface DetalleResponse {
    id_factura: number;
    detalles: DetalleFactura[];
}

async function getDetalles(facturaId: number): Promise<DetalleFactura[]> {
    try {
        const res = await fetch(`https://apdis-p5v5.vercel.app/api/detalle_facturas/`, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`Failed to fetch details for factura ${facturaId}`);
            return [];
        }
        
        const allDetails: DetalleResponse[] = await res.json();
        
        const facturaDetails = allDetails.find(item => item.id_factura === facturaId);

        return facturaDetails ? facturaDetails.detalles : [];
    } catch (error) {
        console.error("Error parsing details response:", error);
        return [];
    }
}


interface FacturasClientProps {
  data: Factura[];
  clientes: Cliente[];
  facturasToUpdate: number[];
}

export function FacturasClient({ data, clientes, facturasToUpdate }: FacturasClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, startUpdating] = useTransition();
  const [isInfoAlertOpen, setIsInfoAlertOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [detalles, setDetalles] = useState<DetalleFactura[]>([]);
  const [isLoadingDetalles, startLoadingDetalles] = useTransition();

  useEffect(() => {
    if (facturasToUpdate.length > 0) {
      startUpdating(async () => {
        console.log(`Client: Triggering update for ${facturasToUpdate.length} facturas.`);
        const result = await updateFacturaStatusBatch(facturasToUpdate);
        if (result.error) {
           toast({
            title: "Error al sincronizar",
            description: "No se pudieron actualizar los estados de algunas facturas pagadas.",
            variant: "destructive",
          });
        }
        if (result.success) {
           toast({
            title: "Sincronización completa",
            description: `${result.updatedCount} facturas se actualizaron a 'Pagado'.`,
          });
          // No need to re-fetch, data is already updated optimistically on the server render
          // router.refresh() will re-run the server component's getData function
          router.refresh();
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturasToUpdate, toast]);

  const noClientes = clientes.length === 0;
  const canCreate = hasPermission('Facturas', 'C');

  const handleViewDetails = useCallback((factura: Factura) => {
    setSelectedFactura(factura);
    setIsDetailsOpen(true);
    startLoadingDetalles(async () => {
        const detallesData = await getDetalles(factura.id_factura);
        setDetalles(detallesData);
    });
  }, []);

  const handleDeleteRequest = useCallback((id: number) => {
    setIsInfoAlertOpen(true);
  }, []);
  
  const handlePrintRequest = useCallback((id: number) => {
    router.push(`/facturas/${id}/imprimir`);
  }, [router]);
  
  const columns = useMemo(() => getColumns(handleDeleteRequest, handleViewDetails, handlePrintRequest, hasPermission), [handleDeleteRequest, handleViewDetails, handlePrintRequest, hasPermission]);

  const filterOptions = [
    { value: "numero_factura", label: "N° Factura" },
    { value: "cliente_nombre", label: "Cliente" },
    { value: "estado_factura", label: "Estado" },
  ];

  return (
    <>
      {noClientes && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>
            No puede crear una factura porque no hay clientes registrados. Por favor, cree un cliente primero.
          </AlertDescription>
        </Alert>
      )}
      <DataTable
        columns={columns}
        data={data}
        filterOptions={filterOptions}
        toolbar={
          canCreate ? (
            <Link href="/facturas/crear" passHref>
              <Button disabled={noClientes || isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdating ? "Sincronizando..." : "Crear Factura"}
              </Button>
            </Link>
          ) : null
        }
      />

    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Factura {selectedFactura?.numero_factura}</DialogTitle>
            {selectedFactura && (
                 <DialogDescription>
                    Cliente: {selectedFactura.cliente?.nombre} {selectedFactura.cliente?.apellido} | Fecha: {format(new Date(selectedFactura.fecha_factura), 'dd/MM/yyyy')}
                </DialogDescription>
            )}
          </DialogHeader>
          {isLoadingDetalles ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unit.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {detalles.map(d => (
                            <TableRow key={d.id_detalle_factura}>
                                <TableCell>{d.nombre || 'N/A'}</TableCell>
                                <TableCell>{d.cantidad}</TableCell>
                                <TableCell className="text-right">${(parseFloat(d.precio_unitario) || 0).toFixed(2)}</TableCell>
                                <TableCell className="text-right">${(parseFloat(d.total_producto) || 0).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isInfoAlertOpen} onOpenChange={setIsInfoAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Acción no permitida</AlertDialogTitle>
            <AlertDialogDescription>
                Por motivos de mantener la integridad de los datos, no se permite eliminar facturas generadas.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsInfoAlertOpen(false)}>Entendido</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
