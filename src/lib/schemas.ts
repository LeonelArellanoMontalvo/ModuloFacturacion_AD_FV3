import { z } from "zod";

export const tipoClienteSchema = z.object({
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo debe contener letras y espacios."),
  monto_maximo: z.coerce.number().min(0, "El monto máximo no puede ser menor que 0."),
});

export const clienteSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre es requerido.")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo debe contener letras y espacios."),
  apellido: z.string()
    .min(2, "El apellido es requerido.")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El apellido solo debe contener letras y espacios."),
  tipo_identificacion: z.string({ required_error: "Seleccione un tipo de identificación." }).min(1, "Seleccione un tipo de identificación."),
  numero_identificacion: z.string().min(5, "El número de identificación es requerido.").regex(/^\d+$/, "El número de identificación solo debe contener dígitos."),
  fecha_nacimiento: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  direccion: z.string().min(5, "La dirección es requerida."),
  telefono: z.string().regex(/^\d{7,10}$/, "Ingrese un número de teléfono válido (7-10 dígitos)."),
  correo_electronico: z.string().email("Ingrese un correo electrónico válido."),
  tipo_cliente: z.coerce.number({ required_error: "Seleccione un tipo de cliente." }).min(1, "Seleccione un tipo de cliente."),
  estado: z.string({ required_error: "Seleccione un estado." }).min(1, "Seleccione un estado."),
});


export const facturaHeaderSchema = z.object({
  id_cliente: z.coerce.number().min(1, "Debe seleccionar un cliente."),
  tipo_pago: z.string().min(1, "El tipo de pago es requerido."),
  estado_factura: z.string().min(1, "El estado es requerido."),
});

export const facturaSchema = z.object({
  header: facturaHeaderSchema,
  detalles: z.array(z.object({
    id_producto: z.coerce.number().min(1, "Debe seleccionar un producto."),
    cantidad: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
  })).min(1, "Debe agregar al menos un detalle a la factura."),
});
