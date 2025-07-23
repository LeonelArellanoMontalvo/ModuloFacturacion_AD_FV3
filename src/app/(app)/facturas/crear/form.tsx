
"use client"

import React, { useMemo, useTransition, useState, useEffect } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createFactura } from "@/lib/actions"
import { facturaSchema } from "@/lib/schemas"
import type { Cliente, Producto, TipoCliente } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus, BadgeAlert } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type FormValues = z.infer<typeof facturaSchema>;

interface DeudaCliente {
    id_cliente: number;
    total_deuda: number;
}

interface CrearFacturaFormProps {
  clientes: Cliente[];
  productos: Producto[];
  tiposCliente: TipoCliente[];
  deudas: DeudaCliente[];
}

const IVA_RATE = 0.15;

export function CrearFacturaForm({ clientes, productos, tiposCliente, deudas }: CrearFacturaFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const router = useRouter()
  const { toast } = useToast()
  const [productSearch, setProductSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [creditCheckPassed, setCreditCheckPassed] = useState<boolean | null>(null);

  const facturaSchemaWithStockValidation = useMemo(() => {
    return facturaSchema.superRefine((data, ctx) => {
      data.detalles.forEach((detalle, index) => {
        if (!detalle.id_producto) return;
        
        const producto = productos.find(p => p.id_producto === Number(detalle.id_producto));
        if (producto) {
            if (Number(detalle.cantidad) > producto.stock_disponible) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Stock insuficiente. Disp: ${producto.stock_disponible}`,
                    path: [`detalles`, index, `cantidad`],
                });
            }
        }
      });
    });
  }, [productos]);

  const form = useForm<FormValues>({
    resolver: zodResolver(facturaSchemaWithStockValidation),
    mode: "onChange",
    defaultValues: {
      header: {
        id_cliente: undefined,
        tipo_pago: "Efectivo",
        estado_factura: "Pagado",
      },
      detalles: [{ id_producto: undefined, cantidad: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles",
  });

  const selectedClientId = useWatch({ control: form.control, name: "header.id_cliente" });
  const detalles = useWatch({ control: form.control, name: 'detalles' });
  const tipoPago = useWatch({ control: form.control, name: 'header.tipo_pago' });

  useEffect(() => {
    if (tipoPago === 'Credito') {
        form.setValue('header.estado_factura', 'Pendiente');
    } else {
        form.setValue('header.estado_factura', 'Pagado');
    }
  }, [tipoPago, form]);


  const selectedCliente = useMemo(() => clientes.find(c => c.id_cliente === Number(selectedClientId)), [selectedClientId, clientes]);

  const totalFactura = useMemo(() => {
    return detalles.reduce((acc, detalle) => {
        const producto = productos.find(p => p.id_producto === Number(detalle.id_producto));
        const cantidad = Number(detalle.cantidad) || 0;
        const precio = producto?.precio || 0;
        const subtotal = cantidad * precio;
        const iva = producto?.graba_iva ? subtotal * IVA_RATE : 0;
        return acc + subtotal + iva;
    }, 0);
  }, [detalles, productos]);


  useEffect(() => {
    setCreditCheckPassed(null);
  }, [selectedClientId, totalFactura, tipoPago]);

  const handleCreditCheck = () => {
    if (!selectedCliente || tipoPago !== 'Credito') return;

    const tipoClienteData = tiposCliente.find(tc => tc.nombre.toLowerCase() === selectedCliente.nombre_tipo_cliente.toLowerCase());

    if (!tipoClienteData || tipoClienteData.monto_maximo === 0) {
        toast({
            title: "Verificación de Crédito",
            description: "Este cliente no tiene un límite de crédito asignado o es cero.",
            variant: "destructive",
        });
        setCreditCheckPassed(false);
        return;
    }

    const creditLimit = tipoClienteData.monto_maximo;
    const currentDebt = deudas.find(d => d.id_cliente === selectedCliente.id_cliente)?.total_deuda || 0;
    const newTotalDebt = currentDebt + totalFactura;
    
    if (newTotalDebt <= creditLimit) {
        toast({
            title: "Crédito Aprobado",
            description: "El cliente aún tiene crédito disponible.",
            className: "bg-green-100 dark:bg-green-900",
        });
        setCreditCheckPassed(true);
    } else {
        toast({
            title: "Límite de Crédito Excedido",
            description: `Deuda actual ($${currentDebt.toFixed(2)}) + esta factura ($${totalFactura.toFixed(2)}) excede el límite ($${creditLimit.toFixed(2)}).`,
            variant: "destructive",
        });
        setCreditCheckPassed(false);
    }
  };


  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await createFactura(values);
      if (result?.success && result.newFacturaId) {
        toast({
          title: "Factura Creada",
          description: "La factura se ha guardado exitosamente.",
        });
        router.push(`/facturas/${result.newFacturaId}/imprimir`);
      } else if (result?.error) {
        toast({
          title: "Error al crear factura",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  const filteredClientes = useMemo(() => {
    if (!clientSearch) return clientes;
    const searchLower = clientSearch.toLowerCase();
    return clientes.filter(c => 
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(searchLower) ||
      c.numero_identificacion.includes(searchLower)
    );
  }, [clientSearch, clientes]);
  
  const filteredProductos = useMemo(() => {
    if (!productSearch) return productos;
    return productos.filter(p => p.nombre.toLowerCase().includes(productSearch.toLowerCase()));
  }, [productSearch, productos]);

  const selectedProductIds = useMemo(() => detalles.map(d => Number(d.id_producto)), [detalles]);

  const isCreditPayment = tipoPago === 'Credito';
  const isSaveDisabled = isPending || (isCreditPayment && !creditCheckPassed);
  const isCreditCheckDisabled = !isCreditPayment || !selectedClientId || totalFactura === 0;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsCancelDialogOpen(true)} disabled={isPending}>
                  Cancelar
              </Button>
              {isCreditPayment && (
                  <Button type="button" variant="outline" onClick={handleCreditCheck} disabled={isCreditCheckDisabled}>
                      <BadgeAlert className="mr-2 h-4 w-4" />
                      Verificar Crédito
                  </Button>
              )}
              <Button type="submit" disabled={isSaveDisabled}>
                {isPending ? "Guardando Factura..." : "Guardar Factura"}
              </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Factura</CardTitle>
              <CardDescription>Seleccione un cliente y complete los datos de la cabecera.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="header.id_cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Buscar cliente por nombre o ID..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Separator />
                        <div className="max-h-[200px] overflow-y-auto">
                          {filteredClientes.map(c => (
                            <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                              {c.nombre} {c.apellido} ({c.numero_identificacion})
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedCliente && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormItem>
                    <FormLabel>Tipo Identificación</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.tipo_identificacion || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>N° Identificación</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.numero_identificacion || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.direccion || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.correo_electronico || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.telefono || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="header.tipo_pago"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Tipo de Pago</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                                      <SelectItem value="Credito">Crédito</SelectItem>
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="header.estado_factura"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Estado de la Factura</FormLabel>
                                <FormControl>
                                  <Input {...field} readOnly className="bg-muted" />
                                </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Card>
              <CardHeader>
                  <CardTitle>Detalles de la Factura</CardTitle>
                  <CardDescription>Agregue los productos a la factura.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {fields.map((field, index) => {
                      const selectedProductoId = detalles[index]?.id_producto;
                      const producto = productos.find(p => p.id_producto === Number(selectedProductoId));
                      const cantidad = detalles[index]?.cantidad || 0;
                      const precio_unitario = producto?.precio || 0;
                      const subtotal_base = precio_unitario * cantidad;
                      const iva = producto?.graba_iva ? subtotal_base * IVA_RATE : 0;
                      const total_linea = subtotal_base + iva;

                      return (
                          <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg relative items-end">
                              <FormField
                                  control={form.control}
                                  name={`detalles.${index}.id_producto`}
                                  render={({ field }) => (
                                      <FormItem className="md:col-span-3">
                                          <FormLabel>Producto</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                              <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un producto" /></SelectTrigger></FormControl>
                                              <SelectContent>
                                                  <div className="p-2">
                                                    <Input
                                                      placeholder="Buscar producto..."
                                                      value={productSearch}
                                                      onChange={(e) => setProductSearch(e.target.value)}
                                                      autoFocus
                                                      className="w-full"
                                                    />
                                                  </div>
                                                  <Separator />
                                                  <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredProductos.map(p => (
                                                        <SelectItem key={p.id_producto} value={String(p.id_producto)} disabled={selectedProductIds.includes(p.id_producto) && p.id_producto !== Number(field.value)}>
                                                            {p.nombre}
                                                        </SelectItem>
                                                    ))}
                                                  </div>
                                              </SelectContent>
                                          </Select>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                               <FormField
                                  control={form.control}
                                  name={`detalles.${index}.cantidad`}
                                  render={({ field }) => (
                                      <FormItem className="md:col-span-1">
                                          <FormLabel>Cantidad</FormLabel>
                                          <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                               <FormItem className="md:col-span-1">
                                  <FormLabel>Stock</FormLabel>
                                  <Input value={producto?.stock_disponible ?? 'N/A'} readOnly className="bg-muted text-center"/>
                              </FormItem>
                              <FormItem className="md:col-span-2">
                                  <FormLabel>P. Unitario</FormLabel>
                                  <Input value={`$${(producto?.precio || 0).toFixed(2)}`} readOnly className="bg-muted text-right"/>
                              </FormItem>
                              <FormItem className="md:col-span-1">
                                  <FormLabel>Subtotal</FormLabel>
                                  <Input value={`$${subtotal_base.toFixed(2)}`} readOnly className="bg-muted text-right" />
                              </FormItem>
                              <FormItem className="md:col-span-1">
                                  <FormLabel>IVA</FormLabel>
                                  <Input value={`$${iva.toFixed(2)}`} readOnly className="bg-muted text-right" />
                              </FormItem>
                              <FormItem className="md:col-span-2">
                                  <FormLabel>Total Línea</FormLabel>
                                  <Input value={`$${total_linea.toFixed(2)}`} readOnly className="bg-muted text-right font-semibold" />
                              </FormItem>
                               <FormItem>
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                               </FormItem>
                          </div>
                      )
                  })}

                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append({ id_producto: undefined, cantidad: 1 })}
                    disabled={fields.length >= productos.length}
                  >
                      <Plus className="mr-2 h-4 w-4" /> Agregar Detalle
                  </Button>
              </CardContent>
          </Card>
          
          <div className="flex flex-col items-end gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-4">
                <div className="text-xl font-bold">Total Factura:</div>
                <div className="text-2xl font-bold text-primary">${totalFactura.toFixed(2)}</div>
            </div>
          </div>
        </form>
      </Form>
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea cancelar?</AlertDialogTitle>
            <AlertDialogDescription>
                Todos los cambios no guardados se perderán. Esta acción no se puede deshacer.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/facturas')}>
                Sí, Cancelar
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

    