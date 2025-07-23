import { PageHeader } from "@/components/page-header";
import { Factura, Cliente } from "@/lib/types";
import { ReporteFacturasClient } from "./client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

async function getData(): Promise<Factura[]> {
  try {
    const [facturasRes, clientesRes] = await Promise.all([
      fetch('https://apdis-p5v5.vercel.app/api/facturas/', { cache: 'no-store' }),
      fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' }),
    ]);

    if (!facturasRes.ok) throw new Error('Failed to fetch facturas');
    if (!clientesRes.ok) throw new Error('Failed to fetch clientes');
    
    const facturasData: any[] = await facturasRes.json();
    const clientes: Cliente[] = await clientesRes.json();
    
    const facturas: Factura[] = facturasData.map(f => ({
      ...f,
      monto_total: parseFloat(f.monto_total),
      cliente: clientes.find(c => c.id_cliente === f.id_cliente),
    }));

    return facturas.sort((a,b) => new Date(b.fecha_factura).getTime() - new Date(a.fecha_factura).getTime());
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ReporteFacturasPage() {
  const facturas = await getData();
  const reportDate = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  const fileName = `Reporte Facturas - ${format(new Date(), "yyyy-MM-dd")}`;

  return (
    <>
      <ReporteFacturasClient data={facturas} reportDate={reportDate} fileName={fileName} />
    </>
  );
}
