// src/components/shared/data-table-custom.tsx
"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

// Định nghĩa kiểu dữ liệu cho cột với Generic T
interface Column<T> {
  header: string
  // accessorKey phải là một key tồn tại trong T hoặc chuỗi tùy chọn
  accessorKey?: keyof T | string 
  align?: "left" | "center" | "right"
  className?: string
  cell?: (item: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  totalRecords?: number
  recordsPerPage?: number
}

export function DataTableCustom<T>({ 
  columns, 
  data, 
  totalRecords = 0, 
  recordsPerPage = 20 
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <Table className="min-w-max">
          <TableHeader className="bg-slate-50/50 sticky top-0 z-10 shadow-sm">
            <TableRow className="border-b border-slate-200">
              {columns.map((col, i) => (
                <TableHead 
                  key={i} 
                  className={`px-3 py-3 text-sm font-bold text-slate-700 ${
                    col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""
                  } ${col.className || ""}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {columns.map((col, i) => {
                    // Logic render: Ưu tiên hàm cell, nếu không có thì lấy giá trị từ accessorKey
                    const renderValue = () => {
                      if (col.cell) return col.cell(item, index);
                      if (col.accessorKey) {
                        const value = item[col.accessorKey as keyof T];
                        return value !== undefined ? String(value) : "";
                      }
                      return null;
                    };

                    return (
                      <TableCell 
                        key={i} 
                        className={`px-3 py-2 text-sm text-slate-600 ${
                          col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""
                        }`}
                      >
                        {renderValue()}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-slate-400 font-medium">
                  Không có dữ liệu hiển thị.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar - Cố định ở đáy card */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 mt-auto">
          <div className="text-sm text-slate-600 font-medium">
            Hiển thị {Math.min(data.length, recordsPerPage)}/{totalRecords || data.length} bản ghi
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-3 text-sm font-semibold text-slate-700">
              1 <span className="text-slate-400 font-normal">/</span> 1
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}