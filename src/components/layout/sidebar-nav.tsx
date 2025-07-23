
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Tag, Package, BarChart3 } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

const allNavItems = [
  { href: "/dashboard", label: "Inicio", icon: Home, subModulo: 'Inicio' },
  { href: "/tipo-clientes", label: "Tipos de Cliente", icon: Tag, subModulo: 'Tipos de Cliente' },
  { href: "/clientes", label: "Clientes", icon: Users, subModulo: 'Clientes' },
  { href: "/facturas", label: "Facturas", icon: FileText, subModulo: 'Facturas' },
  { href: "/productos", label: "Productos", icon: Package, subModulo: 'Productos' },
  { href: "/reportes/clientes", label: "Reporte Clientes", icon: BarChart3, subModulo: 'Reportes Clientes' },
  { href: "/reportes/facturas", label: "Reporte Facturas", icon: BarChart3, subModulo: 'Reportes Facturas' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  
  const navItems = allNavItems.filter(item => {
    // For reports, the check is different, we just check for 'R' as hasPermission will handle the complex logic
    if (item.subModulo.startsWith('Reporte')) {
        return hasPermission(item.subModulo, 'R');
    }
    // For other modules, we check for 'R' permission to show them in the nav
    return hasPermission(item.subModulo, 'R');
  });


  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={pathname.startsWith(item.href) || (item.href === '/dashboard' && pathname === '/')}
            tooltip={item.label}
            asChild
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
