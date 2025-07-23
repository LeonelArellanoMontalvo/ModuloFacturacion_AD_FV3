"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  toolbar?: React.ReactNode
  filterKey?: string
  filterOptions?: { label: string; value: string }[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  filterKey,
  filterOptions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  
  const [activeFilterKey, setActiveFilterKey] = React.useState<string>(
    filterOptions?.[0]?.value ?? filterKey ?? ''
  );
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const handleFilterKeyChange = (value: string) => {
    table.getColumn(activeFilterKey)?.setFilterValue(''); // Clear previous filter
    setActiveFilterKey(value);
  }

  const activeFilterLabel = filterOptions?.find(o => o.value === activeFilterKey)?.label ?? 'valor';

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
            {filterOptions && (
                 <Select value={activeFilterKey} onValueChange={handleFilterKeyChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por..." />
                    </SelectTrigger>
                    <SelectContent>
                        {filterOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            {(filterKey || filterOptions) && activeFilterKey ? (
                 <Input
                    placeholder={`Filtrar por ${activeFilterLabel.toLowerCase()}...`}
                    value={(table.getColumn(activeFilterKey)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(activeFilterKey)?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            ) : null }
        </div>
        {toolbar}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
            <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            >
            <span className="sr-only">Ir a la primera página</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11 17l-5-5l5-5m7 10l-5-5l5-5"/></svg>
            </Button>
            <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            >
            <span className="sr-only">Ir a la página anterior</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 17l-5-5l5-5"/></svg>
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
            </div>
            <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            >
            <span className="sr-only">Ir a la página siguiente</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 17l5-5l-5-5"/></svg>
            </Button>
            <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            >
            <span className="sr-only">Ir a la última página</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13 17l5-5l-5-5M6 17l5-5l-5-5"/></svg>
            </Button>
            <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
                table.setPageSize(Number(value))
            }}
            >
            <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder={`${table.getState().pagination.pageSize} por página`} />
            </SelectTrigger>
            <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize} por página
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} fila(s).
        </div>
      </div>
    </div>
  )
}
