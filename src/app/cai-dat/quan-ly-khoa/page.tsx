"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AppLayout from "@/components/AppLayout"
import BatchManagementTable from "./components/BatchManagementTable"
import { AddBatchDialog } from "./components/AddBatchDialog"
import { EditBatchDialog } from "./components/EditBatchDialog"
import { DeleteBatchDialog } from "./components/DeleteBatchDialog"

type Batch = {
  id: number
  code: string
  startYear: string
  endYear: string
}

const batches = [
  { id: 1, code: "46K", startYear: "2020", endYear: "2024" },
  { id: 2, code: "47K", startYear: "2021", endYear: "2025" },
  { id: 3, code: "48K", startYear: "2022", endYear: "2026" },
  { id: 4, code: "49K", startYear: "2023", endYear: "2027" },
  { id: 5, code: "50K", startYear: "2024", endYear: "2028" },
  { id: 6, code: "51K", startYear: "2025", endYear: "2029" },
  { id: 7, code: "52K", startYear: "2026", endYear: "2030" },
  { id: 8, code: "53K", startYear: "2027", endYear: "2031" },
  { id: 9, code: "54K", startYear: "2028", endYear: "2032" },
  { id: 10, code: "55K", startYear: "2029", endYear: "2033" },
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

  const handleAddBatch = (data: { code: string; startYear: string; endYear: string }) => {
    console.log("Add batch:", data)
  }

  const handleUpdateBatch = (data: { code: string; startYear: string; endYear: string }) => {
    console.log("Update batch:", data)
  }

  const handleConfirmDelete = () => {
    console.log("Delete batch:", selectedBatch)
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý khoá
          </h1>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập mã khóa..."
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
        <BatchManagementTable 
          batches={filteredBatches}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
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
