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
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý khóa
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
