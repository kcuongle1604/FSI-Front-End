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
import { AddSpecializationDialog } from "./components/AddSpecializationDialog"
import { EditSpecializationDialog } from "./components/EditSpecializationDialog"
import { DeleteSpecializationDialog } from "./components/DeleteSpecializationDialog"

type Specialization = {
  id: number
  code: string
  name: string
  batches: string[]
}

type SpecializationFormData = {
  code: string
  name: string
  batches: string[]
}

const specializations = [
  { id: 1, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 2, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 3, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 4, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 5, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 6, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 7, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 8, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 9, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
  { id: 10, code: "21", name: "Quản trị hệ thống thông tin", batches: ["48K", "49K", "50K", "51K"] },
]

export default function QuanLyChuyenNganhPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | undefined>()

  const filteredSpecializations = specializations.filter(spec => 
    spec.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spec.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEditClick = (spec: Specialization) => {
    setSelectedSpecialization(spec)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (spec: Specialization) => {
    setSelectedSpecialization(spec)
    setOpenDeleteDialog(true)
  }

  const handleAddSpecialization = (data: SpecializationFormData) => {
    console.log("Add specialization:", data)
  }

  const handleUpdateSpecialization = (data: SpecializationFormData) => {
    console.log("Update specialization:", data)
  }

  const handleConfirmDelete = () => {
    console.log("Delete specialization:", selectedSpecialization)
  }

  return (
    <AppLayout 
      title="Quản lý chuyên ngành"
      showSearch={false}
    >
      {/* Search and Actions Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Nhập tên chuyên ngành..."
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
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">MÃ CHUYÊN NGÀNH</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">TÊN CHUYÊN NGÀNH</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">KHÓA ÁP DỤNG</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredSpecializations.slice(0, 30).map((spec, index) => (
              <TableRow key={spec.id} className="border-b border-gray-200 hover:bg-gray-50">
                <TableCell className="h-12 px-6 text-sm text-gray-600">
                  {String(index + 1).padStart(2, '0')}
                </TableCell>
                <TableCell className="h-12 px-6 text-sm text-gray-600">{spec.code}</TableCell>
                <TableCell className="h-12 px-6 text-sm text-gray-600">{spec.name}</TableCell>
                <TableCell className="h-12 px-6 text-sm text-gray-600">{spec.batches.join(", ")}</TableCell>
                <TableCell className="h-12 px-6">
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
                        onClick={() => handleEditClick(spec)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-sm text-red-600"
                        onClick={() => handleDeleteClick(spec)}
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
            Hiển thị {Math.min(30, filteredSpecializations.length)}/{filteredSpecializations.length} bản ghi
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
              disabled={filteredSpecializations.length <= 30}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-300"
              disabled={filteredSpecializations.length <= 30}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Specialization Dialog */}
      <AddSpecializationDialog 
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onAdd={handleAddSpecialization}
      />

      {/* Edit Specialization Dialog */}
      <EditSpecializationDialog 
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        specialization={selectedSpecialization}
        onUpdate={handleUpdateSpecialization}
      />

      {/* Delete Specialization Dialog */}
      <DeleteSpecializationDialog 
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        specialization={selectedSpecialization}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  )
}
