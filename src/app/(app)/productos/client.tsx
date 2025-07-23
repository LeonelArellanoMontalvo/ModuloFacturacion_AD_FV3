"use client";

import React, { useMemo } from "react";
import { Producto } from "@/lib/types";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table";

interface ProductosClientProps {
  data: Producto[];
}

export function ProductosClient({ data }: ProductosClientProps) {
  const columns = useMemo(() => getColumns(), []);
  
  const filterOptions = [
    { value: "codigo", label: "Código" },
    { value: "nombre", label: "Nombre" },
    { value: "estado", label: "Estado" },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      filterOptions={filterOptions}
    />
  );
}
