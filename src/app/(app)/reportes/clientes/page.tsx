import { PageHeader } from "@/components/page-header";
import { Cliente } from "@/lib/types";
import { ReporteClientesClient } from "./client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

async function getData(): Promise<Cliente[]> {
  try {
    const clientesRes = await fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' });
    if (!clientesRes.ok) throw new Error('Failed to fetch clientes');
    const clientes: Cliente[] = await clientesRes.json();
    return clientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ReporteClientesPage() {
  const clientes = await getData();
  const reportDate = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  const fileName = `Reporte Clientes - ${format(new Date(), "yyyy-MM-dd")}`;

  return (
    <>
      <ReporteClientesClient data={clientes} reportDate={reportDate} fileName={fileName} />
    </>
  );
}
