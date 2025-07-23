import { PageHeader } from "@/components/page-header";
import { Cliente, TipoCliente, Factura } from "@/lib/types";
import { ClientesClient } from "./client";

async function getData(): Promise<{ clientes: Cliente[], tipos: TipoCliente[] }> {
  try {
    const [clientesRes, tiposRes, facturasRes] = await Promise.all([
      fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' }),
      fetch('https://apdis-p5v5.vercel.app/api/tipo_clientes/', { cache: 'no-store' }),
      fetch('https://apdis-p5v5.vercel.app/api/facturas/', { cache: 'no-store' })
    ]);

    if (!clientesRes.ok) throw new Error('Failed to fetch clientes');
    if (!tiposRes.ok) throw new Error('Failed to fetch tipos de clientes');
    if (!facturasRes.ok) throw new Error('Failed to fetch facturas');

    const clientes: Cliente[] = await clientesRes.json();
    const tipos: TipoCliente[] = await tiposRes.json();
    const facturas: Factura[] = await facturasRes.json();

    const usedClienteIds = new Set(facturas.map(f => f.id_cliente));

    const clientesWithStatus = clientes.map(cliente => ({
      ...cliente,
      isDeletable: !usedClienteIds.has(cliente.id_cliente)
    }));

    const sortedClientes = clientesWithStatus.sort((a, b) => b.id_cliente - a.id_cliente);

    return { clientes: sortedClientes, tipos };
  } catch (error) {
    console.error(error);
    return { clientes: [], tipos: [] };
  }
}

export default async function ClientesPage() {
  const { clientes, tipos } = await getData();

  return (
    <>
      <PageHeader title="Gestionar Clientes" />
      <div className="p-4 sm:p-6 md:p-8 border rounded-lg bg-card">
        <ClientesClient data={clientes} tipos={tipos} />
      </div>
    </>
  );
}
