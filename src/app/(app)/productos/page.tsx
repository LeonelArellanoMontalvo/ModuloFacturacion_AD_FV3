import { PageHeader } from "@/components/page-header";
import { Producto } from "@/lib/types";
import { ProductosClient } from "./client";
import { Card, CardContent } from "@/components/ui/card";

async function getData(): Promise<Producto[]> {
  try {
    const res = await fetch('https://ad-xglt.onrender.com/api/v1/productos', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch productos');
    
    const data: { productos: any[] } = await res.json();
    
    const productos: Producto[] = data.productos.map((p: any) => ({
      id_producto: p.id_producto,
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: parseFloat(p.pvp),
      stock_disponible: Number(p.stock_actual),
      estado: p.estado,
      graba_iva: p.graba_iva,
      costo: parseFloat(p.costo)
    }));

    return productos.sort((a, b) => b.id_producto - a.id_producto);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ProductosPage() {
  const productos = await getData();

  return (
    <>
      <PageHeader title="Consultar Productos" />
      <Card>
        <CardContent className="p-6">
          <ProductosClient data={productos} />
        </CardContent>
      </Card>
    </>
  );
}
