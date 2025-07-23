
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Verificando credenciales...</p>
        </div>
    );
  }

  if (!user) {
    return null; // or a loading indicator
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg font-headline">Módulo de facturación</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          {user && (
            <div className="w-full space-y-2">
               <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt={user.usuario} data-ai-hint="user avatar" />
                    <AvatarFallback>{user.usuario.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user.usuario}</span>
                    <span className="text-xs text-muted-foreground">{user.id_modulo}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold font-headline">Grupo #3</h1>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
