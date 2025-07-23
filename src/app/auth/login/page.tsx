
"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, LogIn } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  usuario: z.string().min(1, 'El nombre de usuario es requerido.'),
  contrasena: z.string().min(1, 'La contraseña es requerida.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: '',
      contrasena: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setError(null);
    startTransition(async () => {
      try {
        await login(values.usuario, values.contrasena);
        router.push('/dashboard');
      } catch (err: any) {
        setError('Credenciales incorrectas. Por favor, intente de nuevo.');
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
         <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">Iniciar Sesión</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error de Autenticación</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Su nombre de usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contrasena"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Su contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Ingresando...' : 'Ingresar'}
                {!isPending && <LogIn className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

