"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clienteSchema } from "@/lib/schemas";
import type { Cliente, TipoCliente } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { createCliente, updateCliente } from "@/lib/actions";

export type FormValues = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  defaultValues?: Cliente | null;
  tipos: TipoCliente[];
  onCancel: () => void;
  onSuccess: () => void;
}

export function ClienteForm({ defaultValues, tipos, onCancel, onSuccess }: ClienteFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: defaultValues?.nombre || "",
      apellido: defaultValues?.apellido || "",
      tipo_identificacion: defaultValues?.tipo_identificacion || undefined,
      numero_identificacion: defaultValues?.numero_identificacion || "",
      fecha_nacimiento: defaultValues?.fecha_nacimiento ? new Date(defaultValues.fecha_nacimiento + 'T00:00:00') : undefined,
      direccion: defaultValues?.direccion || "",
      telefono: defaultValues?.telefono || "",
      correo_electronico: defaultValues?.correo_electronico || "",
      tipo_cliente: defaultValues?.tipo_cliente || undefined,
      estado: defaultValues?.estado || "Activo",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const action = defaultValues ? updateCliente(defaultValues.id_cliente, values) : createCliente(values);
      const result = await action;

      if (result?.error) {
        if (result.field) {
            form.setError(result.field as keyof FormValues, {
                type: "server",
                message: result.error,
            });
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        }
      } else {
        toast({
          title: "Éxito",
          description: `Cliente ${defaultValues ? 'actualizado' : 'creado'} con éxito.`,
        });
        onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl><Input placeholder="John" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="tipo_identificacion"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de Identificación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Cédula">Cédula</SelectItem>
                        <SelectItem value="RUC">RUC</SelectItem>
                        <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="numero_identificacion"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Número de Identificación</FormLabel>
                    <FormControl><Input placeholder="1234567890" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="fecha_nacimiento"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Nacimiento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="correo_electronico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl><Input placeholder="Av. Siempre Viva 123" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl><Input placeholder="0987654321" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipo_cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ? String(field.value) : undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.id_tipcli} value={String(tipo.id_tipcli)}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
         <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un estado" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
