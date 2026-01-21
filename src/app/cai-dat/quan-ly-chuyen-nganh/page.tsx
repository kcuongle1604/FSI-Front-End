"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AppLayout from "@/components/AppLayout"
import SpecializationManagementTable from "./components/SpecializationManagementTable"
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
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý chuyên ngành
          </h1>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập tên chuyên ngành..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
          
          {/* Actions */}
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

        {/* Table */}
        <SpecializationManagementTable 
          specializations={filteredSpecializations}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
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
