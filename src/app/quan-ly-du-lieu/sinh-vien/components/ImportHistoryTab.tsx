// Nội dung Tab "Lịch sử import"
"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileImport } from "../types"

interface ImportHistoryTabProps {
  history: FileImport[]
}

export default function ImportHistoryTab({ history }: ImportHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [importPage, setImportPage] = useState(1)
  const importPageSize = 30
  const importTotalPages = Math.ceil(history.length / importPageSize) || 1

  const filteredHistory = history.filter(doc =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedImportHistory = filteredHistory.slice(
    (importPage - 1) * importPageSize,
    importPage * importPageSize
  )

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      {/* Search Bar */}
      <div className="flex items-center gap-3 p-6 pb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Nhập tên file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="h-10 px-0 text-left text-sm font-medium text-gray-700">STT</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">TÊN FILE</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">TRẠNG THÁI</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">THÀNH CÔNG</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">THẤT BẠI</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">TỔNG</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">NGÀY TẠO</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">NGƯỜI TẠO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedImportHistory.map((doc, index) => (
              <TableRow key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                <TableCell className="h-12 px-0 text-sm text-gray-600">
                  {String((importPage - 1) * importPageSize + index + 1).padStart(2, '0')}
                </TableCell>
                <TableCell className="h-12 px-4 text-sm font-medium text-gray-900">{doc.fileName}</TableCell>
                <TableCell className="h-12 px-4 text-sm text-gray-600">{doc.status}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{doc.success}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{doc.failed}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{doc.total}</TableCell>
                <TableCell className="h-12 px-4 text-sm text-gray-600">{doc.createdAt}</TableCell>
                <TableCell className="h-12 px-4 text-sm text-gray-600">{doc.createdBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Hiển thị {Math.min(importPageSize, paginatedImportHistory.length)}/{filteredHistory.length} bản ghi
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            onClick={() => setImportPage(1)}
            disabled={importPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            onClick={() => setImportPage(prev => Math.max(1, prev - 1))}
            disabled={importPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-gray-700">{importPage}</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-600">{importTotalPages}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            onClick={() => setImportPage(prev => Math.min(importTotalPages, prev + 1))}
            disabled={importPage === importTotalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            onClick={() => setImportPage(importTotalPages)}
            disabled={importPage === importTotalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}