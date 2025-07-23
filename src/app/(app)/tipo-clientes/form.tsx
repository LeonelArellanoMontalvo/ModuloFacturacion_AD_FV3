"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { tipoClienteSchema } from "@/lib/schemas"
import type { TipoCliente } from "@/lib/types"

export type FormValues = z.infer<typeof tipoClienteSchema>;

interface TipoClienteFormProps {
  onSubmit: (values: FormValues) => void;
  defaultValues?: TipoCliente | null;
  isPending: boolean;
  onCancel: () => void;
}

export function TipoClienteForm({ onSubmit, defaultValues, isPending, onCancel }: TipoClienteFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(tipoClienteSchema),
    defaultValues: {
      nombre: defaultValues?.nombre || "",
      monto_maximo: defaultValues?.monto_maximo || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mayorista" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monto_maximo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Máximo</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1000.00" {...field} />
              </FormControl>
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
  )
}
