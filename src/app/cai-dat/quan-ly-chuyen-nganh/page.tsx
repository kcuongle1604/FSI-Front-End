"use client"

import { useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AppLayout from "@/components/AppLayout"
import SpecializationManagementTable from "./components/SpecializationManagementTable"
import { AddSpecializationDialog } from "./components/AddSpecializationDialog"
import { EditSpecializationDialog } from "./components/EditSpecializationDialog"
import { DeleteSpecializationDialog } from "./components/DeleteSpecializationDialog"
import { api } from "@/lib/api"

type Specialization = {
  id: string
  apiId?: string
  code: string
  name: string
  batches: string[]
}

type SpecializationFormData = {
  code: string
  name: string
}

type MajorApiItem = {
  major_id?: string | number
  id?: string | number
  majorId?: string | number
  code?: string | number
  major_code?: string | number
  name?: string
  major_name?: string
  cohort_ids?: number[]
  cohorts?: Array<{ cohort_id?: number; name?: string }>
}

export default function QuanLyChuyenNganhPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [loadingSpecializations, setLoadingSpecializations] = useState(false)
  const [specializationError, setSpecializationError] = useState("")
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | undefined>()

  const fetchMajors = async () => {
    try {
      setLoadingSpecializations(true)
      setSpecializationError("")

      const res = await api.get<MajorApiItem[]>("/api/v1/majors")
      const rows = Array.isArray(res.data) ? res.data : []

      const mapped = rows.map((item, index) => {
        const apiId = String(item.major_id ?? item.id ?? item.majorId ?? "").trim()

        const cohortNames = Array.isArray(item.cohorts)
          ? item.cohorts
              .map((cohort) => String(cohort.name || cohort.cohort_id || "").trim())
              .filter(Boolean)
          : []
        const cohortIds = Array.isArray(item.cohort_ids)
          ? item.cohort_ids.map((cohortId) => String(cohortId))
          : []

        const codeText = String(item.code ?? item.major_code ?? apiId).trim()
        const nameText = String(item.name || item.major_name || "-").trim() || "-"
        const rowId = apiId || `major-${index}-${codeText || nameText}`

        return {
          id: rowId,
          apiId: apiId || undefined,
          code: codeText,
          name: nameText,
          batches: cohortNames.length > 0 ? cohortNames : cohortIds,
        }
      })

      setSpecializations(mapped)
    } catch (error) {
      console.error("Load majors failed", error)
      setSpecializationError("Không thể tải danh sách chuyên ngành")
      setSpecializations([])
    } finally {
      setLoadingSpecializations(false)
    }
  }

  useEffect(() => {
    fetchMajors()
  }, [])

  const filteredSpecializations = specializations.filter(spec => 
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

  const normalizeMajorCode = (rawCode: string) => {
    const trimmed = rawCode.trim()
    if (!trimmed) return ""
    return /^k/i.test(trimmed) ? `K${trimmed.slice(1)}` : `K${trimmed}`
  }

  const handleAddSpecialization = async (data: { code: string; name: string }) => {
    try {
      setSpecializationError("")

      const majorId = normalizeMajorCode(data.code)
      if (!majorId) {
        setSpecializationError("Mã chuyên ngành không được để trống")
        return false
      }

      await api.post("/api/v1/majors", {
        majorId,
        name: data.name.trim(),
      })

      await fetchMajors()
      return true
    } catch (error: any) {
      console.error("Create major failed", error)
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.detail || error?.response?.data?.message || "Không thể tạo chuyên ngành"
      setSpecializationError(message)
      return false
    }
  }

  const handleUpdateSpecialization = async (data: SpecializationFormData) => {
    if (!selectedSpecialization?.apiId) {
      setSpecializationError("Không xác định được chuyên ngành cần cập nhật")
      return false
    }

    try {
      setSpecializationError("")

      const majorId = normalizeMajorCode(data.code)
      if (!majorId) {
        setSpecializationError("Mã chuyên ngành không được để trống")
        return false
      }

      await api.patch(`/api/v1/majors/${encodeURIComponent(selectedSpecialization.apiId)}`, {
        majorId,
        name: data.name.trim(),
      })

      await fetchMajors()
      return true
    } catch (error: any) {
      console.error("Update major failed", error)
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.detail || error?.response?.data?.message || "Không thể cập nhật chuyên ngành"
      setSpecializationError(message)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedSpecialization?.apiId) {
      setSpecializationError("Không xác định được chuyên ngành cần xóa")
      return false
    }

    try {
      setSpecializationError("")

      const majorId = selectedSpecialization.apiId.trim()

      const deleteAttempts = [
        () => api.delete(`/api/v1/majors/${encodeURIComponent(majorId)}`),
        () => api.delete(`/api/v1/majors/${majorId}`, { params: { major_id: majorId } }),
        () => api.delete(`/api/v1/majors/${majorId}`, { data: { major_id: majorId } }),
        () => api.delete(`/api/v1/majors/${majorId}`, {
          params: { majorId },
          data: { majorId },
        }),
      ]

      let deleteError: any = null
      let deleted = false

      for (const attempt of deleteAttempts) {
        try {
          await attempt()
          deleted = true
          break
        } catch (error) {
          deleteError = error
        }
      }

      if (!deleted) {
        throw deleteError
      }

      await fetchMajors()
      setSelectedSpecialization(undefined)
      return true
    } catch (error: any) {
      console.error("Delete major failed", error)
      const statusCode = error?.response?.status
      const responseData = error?.response?.data
      const backendMessage =
        typeof responseData === "string"
          ? responseData
          : responseData?.detail || responseData?.message || JSON.stringify(responseData)

      setSpecializationError(
        `Xóa chuyên ngành ID=${selectedSpecialization.apiId || selectedSpecialization.id} thất bại (${statusCode || "unknown"}). ${backendMessage || "Vui lòng thử lại."}`
      )
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
              &gt; Quản lý chuyên ngành
            </span>
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

        {specializationError && <p className="text-sm text-red-600 mb-3">{specializationError}</p>}

        {/* Table */}
        <SpecializationManagementTable 
          specializations={filteredSpecializations}
          loading={loadingSpecializations}
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
