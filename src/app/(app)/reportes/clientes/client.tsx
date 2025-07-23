
"use client";

import { useMemo } from "react";
import { Cliente } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, UserX } from "lucide-react";
import { UpdateTitle } from "../../facturas/[id]/imprimir/update-title";
import { PrintControls } from "../../facturas/[id]/imprimir/print-controls";
import { Badge } from "@/components/ui/badge";

interface ReporteClientesClientProps {
  data: Cliente[];
  reportDate: string;
  fileName: string;
}

export function ReporteClientesClient({ data, reportDate, fileName }: ReporteClientesClientProps) {
  const stats = useMemo(() => {
    const total = data.length;
    const activos = data.filter(c => c.estado?.toLowerCase() === 'activo').length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [data]);

  return (
    <>
      <UpdateTitle title={fileName} />
      <PageHeader
        title="Reporte de Clientes"
        className="no-print"
        action={<PrintControls />}
      />
      <div className="printable-area p-4 sm:p-6 md:p-8 border rounded-lg bg-card">
        <header className="mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                         <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">Reporte de Clientes</h1>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="text-sm font-semibold">Módulo de facturación/Venta</p>
                    <p className="text-xs text-muted-foreground">Fecha de Reporte: {reportDate}</p>
                </div>
            </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3 mb-8 no-print">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactivos}</div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo Cliente</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cliente) => (
                <TableRow key={cliente.id_cliente}>
                  <TableCell>{cliente.nombre} {cliente.apellido}</TableCell>
                  <TableCell>{cliente.tipo_identificacion}: {cliente.numero_identificacion}</TableCell>
                  <TableCell>{cliente.correo_electronico}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>{cliente.nombre_tipo_cliente || 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={cliente.estado?.toLowerCase() === 'activo' ? 'default' : 'secondary'}>
                        {cliente.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </>
  );
}
