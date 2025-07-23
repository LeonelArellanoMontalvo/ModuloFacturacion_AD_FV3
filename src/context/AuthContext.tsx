
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface Permiso {
  id_permiso: number;
  nombre_permiso: string;
  descripcion: string; // "C", "R", "U", "D", "CR", "CRU", "CRUD"
  url_permiso: string;
  estado: boolean;
  id_modulo: string;
}

interface User {
  usuario: string;
  id_usuario?: number;
  id_modulo: string;
  permisos: Permiso[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  hasPermission: (subModulo: string, accion: 'C' | 'R' | 'U' | 'D') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (usuario: string, contrasena: string) => {
    const response = await fetch('https://aplicacion-de-seguridad-v2.onrender.com/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena, id_modulo: 'FAC' }),
    });

    const rawResponseText = await response.text();

    if (!response.ok) {
        try {
            const errorData = JSON.parse(rawResponseText);
            throw new Error(errorData.message || 'Credenciales incorrectas.');
        } catch (e) {
            throw new Error(rawResponseText || 'Credenciales incorrectas.');
        }
    }

    const data = JSON.parse(rawResponseText);

    const userData: User = {
      usuario,
      id_usuario: data.id_usuario,
      id_modulo: 'FAC',
      permisos: data.permisos,
    };

    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/auth/login');
  }, [router]);

  const hasPermission = useCallback((subModulo: string, accion: 'C' | 'R' | 'U' | 'D'): boolean => {
    if (!user) return false;

    // The dashboard is a special case, always visible if the user is logged in
    if (subModulo === 'Inicio') return true;

    // Report permissions logic
    if (subModulo === 'Reportes Clientes') {
        const clientePermiso = user.permisos.find(p => p.nombre_permiso.toLowerCase() === 'clientes' && p.estado);
        if (!clientePermiso) return false;
        return clientePermiso.descripcion === 'CRU' || clientePermiso.descripcion === 'CRUD';
    }

    if (subModulo === 'Reportes Facturas') {
        const facturaPermiso = user.permisos.find(p => p.nombre_permiso.toLowerCase() === 'facturas' && p.estado);
        if (!facturaPermiso) return false;
        return facturaPermiso.descripcion === 'CRU' || facturaPermiso.descripcion === 'CRUD';
    }

    const permiso = user.permisos.find(p => p.nombre_permiso.toLowerCase() === subModulo.toLowerCase());
    
    if (!permiso || !permiso.estado) {
        return false;
    };

    return permiso.descripcion.includes(accion);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
