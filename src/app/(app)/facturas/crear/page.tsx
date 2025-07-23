import { PageHeader } from "@/components/page-header"
import { Cliente, Producto, TipoCliente } from "@/lib/types"
import { CrearFacturaForm } from "./form"
import { Card, CardContent } from "@/components/ui/card"

interface DeudaCliente {
    id_cliente: number;
    total_deuda: number;
}

async function getData(): Promise<{ clientes: Cliente[], productos: Producto[], tiposCliente: TipoCliente[], deudas: DeudaCliente[] }> {
    try {
        const [clientesRes, productosRes, tiposClienteRes, deudasRes] = await Promise.all([
            fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' }),
            fetch('https://ad-xglt.onrender.com/api/v1/productos', { cache: 'no-store' }),
            fetch('https://apdis-p5v5.vercel.app/api/tipo_clientes/', { cache: 'no-store' }),
            fetch('https://module-cuentasporcobrar-api.onrender.com/api/clientes/deudores', { cache: 'no-store' })
        ]);
        
        if (!clientesRes.ok) throw new Error('Failed to fetch clientes');
        if (!productosRes.ok) throw new Error('Failed to fetch productos');
        if (!tiposClienteRes.ok) throw new Error('Failed to fetch tipos de cliente');
        
        const clientes: Cliente[] = await clientesRes.json();
        const productosData: {productos: any[]} = await productosRes.json();
        const tiposClienteData: any[] = await tiposClienteRes.json();
        
        const tiposCliente: TipoCliente[] = tiposClienteData.map(tc => ({
            ...tc,
            monto_maximo: parseFloat(tc.monto_maximo)
        }));

        let deudas: DeudaCliente[] = [];
        if (deudasRes.ok) {
            const deudasData: { id_cliente: number; total_deuda: number }[] = await deudasRes.json();
            deudas = deudasData.map(d => ({
                id_cliente: d.id_cliente,
                total_deuda: Number(d.total_deuda) || 0 // Aseguramos que sea un número
            }));
        } else {
            console.warn("Could not fetch debt data, assuming zero debt for all clients.");
        }

        const productos: Producto[] = productosData.productos.map((p: any) => ({
            id_producto: p.id_producto,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: parseFloat(p.pvp),
            stock_disponible: Number(p.stock_actual),
            estado: p.estado,
            graba_iva: p.graba_iva
        }));
        
        const activeClientes = clientes.filter(c => c.estado?.toLowerCase() === 'activo');
        const activeProductos = productos.filter(p => p.estado?.toUpperCase() === 'ACTIVO' && p.stock_disponible > 0);

        return { clientes: activeClientes, productos: activeProductos, tiposCliente, deudas };
    } catch (error) {
        console.error(error);
        return { clientes: [], productos: [], tiposCliente: [], deudas: [] };
    }
}


export default async function CrearFacturaPage() {
    const { clientes, productos, tiposCliente, deudas } = await getData();

    return (
        <>
            <PageHeader title="Crear Nueva Factura" />
            <Card>
                <CardContent className="p-6">
                    <CrearFacturaForm clientes={clientes} productos={productos} tiposCliente={tiposCliente} deudas={deudas} />
                </CardContent>
            </Card>
        </>
    )
}
