"use client"

import { useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AppLayout from "@/components/AppLayout"
import ClassManagementTable from "./components/ClassManagementTable"
import { AddClassDialog } from "./components/AddClassDialog"
import { EditClassDialog } from "./components/EditClassDialog"
import { DeleteClassDialog } from "./components/DeleteClassDialog"
import { api } from "@/lib/api"

type SchoolClass = {
  id: number
  name: string
  specialization: string
  advisor: string
  studentCount: number | string
}

type ClassApiItem = {
  class_id?: number
  id?: number
  name?: string
  class_name?: string
  major_id?: number
  advisor_username?: string
  advisor_name?: string
  student_count?: number
}

function extractBackendMessage(error: any, fallback: string): string {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string" && detail.trim()) return detail

  const message = error?.response?.data?.message || error?.message
  if (typeof message === "string" && message.trim()) return message

  return fallback
}

export default function QuanLyLopHocPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<SchoolClass | undefined>()

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        setLoadError("")

        const res = await api.get<ClassApiItem[]>("/api/v1/classes")
        const list = Array.isArray(res.data) ? res.data : []

        const mapped = list.map((item, index) => {
          const rawClassId = Number(item.class_id ?? item.id)
          const majorId = Number(item.major_id)
          const studentCount = Number(item.student_count)

          return {
            id: Number.isFinite(rawClassId) ? rawClassId : index + 1,
            name: String(item.name || item.class_name || "-").trim() || "-",
            specialization: Number.isFinite(majorId) ? `Chuyên ngành #${majorId}` : "-",
            advisor: String(item.advisor_username || item.advisor_name || "-").trim() || "-",
            studentCount: Number.isFinite(studentCount) ? studentCount : "0",
          }
        })

        setClasses(mapped)
      } catch (error: any) {
        setLoadError(extractBackendMessage(error, "Không tải được danh sách lớp học."))
        setClasses([])
      } finally {
        setLoading(false)
      }
    }

    void fetchClasses()
  }, [])

  const filteredClasses = classes.filter(schoolClass => 
    schoolClass.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEditClick = (schoolClass: SchoolClass) => {
    setSelectedClass(schoolClass)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (schoolClass: SchoolClass) => {
    setSelectedClass(schoolClass)
    setOpenDeleteDialog(true)
  }

  const handleAddClass = (data: { name: string; specialization: string; advisor: string }) => {
  }

  const handleUpdateClass = (data: { name: string; specialization: string; advisor: string; studentCount: string | number }) => {
  }

  const handleConfirmDelete = () => {
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cài đặt
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Quản lý lớp học
            </span>
          </h1>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập tên lớp..."
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
        {loadError && <p className="mb-3 text-sm text-red-600">{loadError}</p>}
        {loading && <p className="mb-3 text-sm text-gray-600">Đang tải danh sách lớp học...</p>}

        <ClassManagementTable 
          classes={filteredClasses}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      {/* Add Class Dialog */}
      <AddClassDialog 
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onAdd={handleAddClass}
      />

      {/* Edit Class Dialog */}
      <EditClassDialog 
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        schoolClass={selectedClass}
        onUpdate={handleUpdateClass}
      />

      {/* Delete Class Dialog */}
      <DeleteClassDialog 
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        schoolClass={selectedClass}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  )
}
