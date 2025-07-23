
export interface TipoCliente {
  id_tipcli: number;
  nombre: string;
  monto_maximo: number;
  isDeletable?: boolean;
}

export interface Cliente {
  id_cliente: number;
  tipo_cliente: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  correo_electronico: string;
  estado: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  nombre_tipo_cliente?: string;
  isDeletable?: boolean;
}

export interface Factura {
  id_factura: number;
  id_cliente: number;
  numero_factura: string;
  fecha_factura: string;
  monto_total: number;
  tipo_pago: string;
  estado_factura: string;
  cliente?: Cliente;
  detalles?: DetalleFactura[];
  isDeletable?: boolean;
}

export interface DetalleFactura {
  id_detalle_factura: number;
  id_factura: number;
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: string;
  total_producto: string;
  cantidadDisponible: number;
}


export interface Producto {
  id_producto: number;
  codigo?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  costo?: number;
  stock_disponible: number;
  estado?: string;
  graba_iva?: boolean;
}
