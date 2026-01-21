"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AppLayout from "@/components/AppLayout"
import ClassManagementTable from "./components/ClassManagementTable"
import { AddClassDialog } from "./components/AddClassDialog"
import { EditClassDialog } from "./components/EditClassDialog"
import { DeleteClassDialog } from "./components/DeleteClassDialog"

type SchoolClass = {
  id: number
  name: string
  specialization: string
  advisor: string
  studentCount: number | string
}

const classes = [
  { id: 1, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: "Trống" },
  { id: 2, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: "Trống" },
  { id: 3, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: 60 },
  { id: 4, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: 60 },
  { id: 5, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: 60 },
  { id: 6, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: 60 },
  { id: 7, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: 60 },
  { id: 8, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: 60 },
  { id: 9, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: 60 },
  { id: 10, name: "48K21.2", specialization: "Quản trị hệ thống thông tin", advisor: "Cao Thị Nhâm", studentCount: 60 },
]

export default function QuanLyLopHocPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<SchoolClass | undefined>()

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

  const handleAddClass = (data: { name: string; specialization: string; advisor: string; studentCount: string | number }) => {
    console.log("Add class:", data)
  }

  const handleUpdateClass = (data: { name: string; specialization: string; advisor: string; studentCount: string | number }) => {
    console.log("Update class:", data)
  }

  const handleConfirmDelete = () => {
    console.log("Delete class:", selectedClass)
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý lớp học
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
