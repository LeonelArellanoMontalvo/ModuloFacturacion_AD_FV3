
"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/auth/login');
    }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p>Redirigiendo al inicio de sesión...</p>
    </div>
  );
}
