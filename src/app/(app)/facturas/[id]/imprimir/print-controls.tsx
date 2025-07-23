"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

export function PrintControls() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 no-print">
      <Button variant="outline" onClick={() => router.push('/facturas')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Atrás
      </Button>
      <Button onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
    </div>
  );
}
