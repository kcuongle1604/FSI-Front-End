"use client"

import { useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AppLayout from "@/components/AppLayout"
import BatchManagementTable from "./components/BatchManagementTable"
import { AddBatchDialog } from "./components/AddBatchDialog"
import { EditBatchDialog } from "./components/EditBatchDialog"
import { DeleteBatchDialog } from "./components/DeleteBatchDialog"
import { api } from "@/lib/api"

type Batch = {
  id: number
  code: string
  startYear: string
  endYear: string
}

type CohortApiItem = {
  cohort_id?: number
  name?: string | null
  cohort_name?: string | null
  year_start?: number
  year_end?: number
}

export default function QuanLyKhoaPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [batches, setBatches] = useState<Batch[]>([])
  const [loadingBatches, setLoadingBatches] = useState(false)
  const [batchError, setBatchError] = useState("")
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>()

  const fetchCohorts = async () => {
    try {
      setLoadingBatches(true)
      setBatchError("")

      const res = await api.get<CohortApiItem[]>("/api/v1/cohorts")
      const rows = Array.isArray(res.data) ? res.data : []

      const mapped = rows.map((item, index) => {
        const cohortId = Number(item.cohort_id)
        const codeFromName = (item.name || item.cohort_name || "").trim()
        const code = codeFromName || (Number.isFinite(cohortId) ? `${cohortId}K` : `K${index + 1}`)

        return {
          id: Number.isFinite(cohortId) ? cohortId : index + 1,
          code,
          startYear: item.year_start != null ? String(item.year_start) : "-",
          endYear: item.year_end != null ? String(item.year_end) : "-",
        }
      })

      setBatches(mapped)
    } catch (error) {
      console.error("Load cohorts failed", error)
      setBatchError("Không thể tải danh sách khóa")
      setBatches([])
    } finally {
      setLoadingBatches(false)
    }
  }

  useEffect(() => {
    fetchCohorts()
  }, [])

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

  const handleAddBatch = async (data: { code?: string; startYear: string; endYear?: string }) => {
    try {
      setBatchError("")

      const payload: { year_start: number; year_end?: number } = {
        year_start: Number(data.startYear),
      }

      if (data.endYear) {
        payload.year_end = Number(data.endYear)
      }

      await api.post("/api/v1/cohorts", payload)
      await fetchCohorts()
      return true
    } catch (error: any) {
      console.error("Create cohort failed", error)
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.detail || error?.response?.data?.message || "Không thể tạo khóa mới"
      setBatchError(message)
      return false
    }
  }

  const handleUpdateBatch = async (data: { code?: string; startYear: string; endYear?: string }) => {
    if (!selectedBatch?.id) {
      setBatchError("Không xác định được khóa cần cập nhật")
      return false
    }

    try {
      setBatchError("")

      const payload: { year_start: number; year_end?: number } = {
        year_start: Number(data.startYear),
      }

      if (data.endYear) {
        payload.year_end = Number(data.endYear)
      }

      await api.put(`/api/v1/cohorts/${selectedBatch.id}`, payload)
      await fetchCohorts()
      return true
    } catch (error: any) {
      console.error("Update cohort failed", error)
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.detail || error?.response?.data?.message || "Không thể cập nhật khóa"
      setBatchError(message)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedBatch?.id) {
      setBatchError("Không xác định được khóa cần xóa")
      return false
    }

    try {
      setBatchError("")
      await api.delete(`/api/v1/cohorts/${selectedBatch.id}`)
      await fetchCohorts()
      setSelectedBatch(undefined)
      return true
    } catch (error: any) {
      console.error("Delete cohort failed", error)
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.detail || error?.response?.data?.message || "Không thể xóa khóa"
      setBatchError(message)
      return false
    }
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cài đặt
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Quản lý khoá
            </span>
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

        {batchError && <p className="text-sm text-red-600 mb-3">{batchError}</p>}
        {loadingBatches && <p className="text-sm text-gray-600 mb-3">Đang tải danh sách khóa...</p>}

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
