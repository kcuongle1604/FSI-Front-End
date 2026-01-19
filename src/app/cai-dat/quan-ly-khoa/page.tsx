"use client"

import * as React from "react"
import { useState } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Edit, 
  Trash2, 
  Plus,
  MoreVertical,
  Search,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from "lucide-react"
import AppLayout from "@/components/AppLayout"
import { AddBatchDialog } from "./components/AddBatchDialog"
import { EditBatchDialog } from "./components/EditBatchDialog"
import { DeleteBatchDialog } from "./components/DeleteBatchDialog"

type Batch = {
  id: number
  code: string
}

const batches = [
  { id: 1, code: "48K" },
  { id: 2, code: "48K" },
  { id: 3, code: "48K" },
  { id: 4, code: "48K" },
  { id: 5, code: "48K" },
  { id: 6, code: "48K" },
  { id: 7, code: "48K" },
  { id: 8, code: "48K" },
  { id: 9, code: "48K" },
  { id: 10, code: "48K" },
]

export default function QuanLyKhoaPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>()

  const filteredBatches = batches.filter(batch => 
    batch.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEditClick = (batch: Batch) => {
    setSelectedBatch(batch)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (batch: Batch) => {
    setSelectedBatch(batch)
    setOpenDeleteDialog(true)
  }

  const handleAddBatch = (data: { code: string }) => {
    console.log("Add batch:", data)
  }

  const handleUpdateBatch = (data: { code: string }) => {
    console.log("Update batch:", data)
  }

  const handleConfirmDelete = () => {
    console.log("Delete batch:", selectedBatch)
  }

  return (
    <AppLayout 
      title="Quản lý khoá"
      showSearch={false}
    >
      {/* Search and Actions Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Nhập mã khoá..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            onClick={() => setOpenAddDialog(true)}
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="flex flex-col flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">STT</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">MÃ KHOÁ</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredBatches.slice(0, 30).map((batch, index) => (
              <TableRow key={batch.id} className="border-b border-gray-200 hover:bg-gray-50">
                <TableCell className="h-12 px-6 text-sm text-gray-600">
                  {String(index + 1).padStart(2, '0')}
                </TableCell>
                <TableCell className="h-12 px-6 text-sm text-gray-600">{batch.code}</TableCell>
                <TableCell className="h-12 px-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40" side="bottom" sideOffset={8}>
                      <DropdownMenuItem
                        className="cursor-pointer text-sm"
                        onClick={() => handleEditClick(batch)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-sm text-red-600"
                        onClick={() => handleDeleteClick(batch)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Hiển thị {Math.min(30, filteredBatches.length)}/{filteredBatches.length} bản ghi
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-300"
              disabled={true}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-300"
              disabled={true}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-3">
              <span className="text-sm font-medium text-gray-700">1</span>
              <span className="text-sm text-gray-400">/</span>
              <span className="text-sm text-gray-600">2</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-300"
              disabled={filteredBatches.length <= 30}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-300"
              disabled={filteredBatches.length <= 30}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Batch Dialog */}
      <AddBatchDialog 
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onAdd={handleAddBatch}
      />

      {/* Edit Batch Dialog */}
      <EditBatchDialog 
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        batch={selectedBatch}
        onUpdate={handleUpdateBatch}
      />

      {/* Delete Batch Dialog */}
      <DeleteBatchDialog 
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        batch={selectedBatch}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  )
}
