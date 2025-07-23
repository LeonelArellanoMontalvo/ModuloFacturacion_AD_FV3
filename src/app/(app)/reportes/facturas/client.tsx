
"use client";

import { useMemo } from "react";
import { Factura } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CircleDollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { UpdateTitle } from "../../facturas/[id]/imprimir/update-title";
import { PrintControls } from "../../facturas/[id]/imprimir/print-controls";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ReporteFacturasClientProps {
  data: Factura[];
  reportDate: string;
  fileName: string;
}

export function ReporteFacturasClient({ data, reportDate, fileName }: ReporteFacturasClientProps) {
  const stats = useMemo(() => {
    const totalFacturas = data.length;
    const pagadasData = data.filter(f => f.estado_factura?.toLowerCase() === 'pagado');
    const pendientesData = data.filter(f => f.estado_factura?.toLowerCase() === 'pendiente' || f.estado_factura?.toLowerCase() === 'credito');

    const montoPagado = pagadasData.reduce((acc, f) => acc + (f.monto_total || 0), 0);
    const montoPendiente = pendientesData.reduce((acc, f) => acc + (f.monto_total || 0), 0);
    
    const pagadas = pagadasData.length;
    const pendientes = pendientesData.length;

    return { totalFacturas, montoPagado, montoPendiente, pagadas, pendientes };
  }, [data]);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <>
      <UpdateTitle title={fileName} />
      <PageHeader
        title="Reporte de Facturas"
        className="no-print"
        action={<PrintControls />}
      />
      <div className="printable-area p-4 sm:p-6 md:p-8 border rounded-lg bg-card">
        <header className="mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                         <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">Reporte de Facturas</h1>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="text-sm font-semibold">Módulo de facturación/Venta</p>
                    <p className="text-xs text-muted-foreground">Fecha de Reporte: {reportDate}</p>
                </div>
            </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 no-print">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Facturas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFacturas}</div>
              <p className="text-xs text-muted-foreground">({stats.pagadas} pagadas, {stats.pendientes} pendientes)</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.montoPagado.toFixed(2)}</div>
               <p className="text-xs text-muted-foreground">Monto de facturas pagadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">${stats.montoPendiente.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Monto de facturas a crédito</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total Facturado</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.montoPagado + stats.montoPendiente).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Suma de todos los montos</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((factura) => (
                <TableRow key={factura.id_factura}>
                  <TableCell className="font-medium">{factura.numero_factura}</TableCell>
                  <TableCell>{factura.cliente?.nombre} {factura.cliente?.apellido || ''}</TableCell>
                  <TableCell>{formatDate(factura.fecha_factura)}</TableCell>
                  <TableCell className="text-right">${(factura.monto_total || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                        variant={factura.estado_factura?.toLowerCase() === 'pagado' ? 'default' : (factura.estado_factura?.toLowerCase() === 'anulada' ? 'destructive' : 'outline')}
                        className="capitalize"
                    >
                        {factura.estado_factura}
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
