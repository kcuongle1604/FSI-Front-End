"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/components/AppLayout"
import { Users, History } from "lucide-react"
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
  Upload,
  Download,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from "lucide-react"

// Import Components
import StudentFormDialog from "./components/StudentFormDialog"
import DeleteDialog from "./components/DeleteDialog"
import ImportDialog from "./components/ImportDialog"
import ImportHistoryTab from "./components/ImportHistoryTab"

// Import Data & Types
import { sampleStudents, importHistory } from "./data"
import { Student } from "./types"

export default function SinhVienPage() {
  const [activeTab, setActiveTab] = useState("thong-tin-sinh-vien")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const filteredStudents = sampleStudents.filter(student =>
    student.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.mssv.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDelete = (student: Student) => {
    setSelectedStudent(student)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedStudent(null)
    setIsFormOpen(true)
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý sinh viên
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* TabsList */}
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger 
                value="thong-tin-sinh-vien" 
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Thông tin sinh viên
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="lich-su-import"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Lịch sử import
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Table Container */}
          <div className="flex-1 min-h-0 bg-white rounded-lg border border-slate-200 overflow-hidden mt-5">
            <TabsContent value="thong-tin-sinh-vien" className="m-0 h-full outline-none flex flex-col">
              {/* Search and Actions Bar */}
              <div className="flex items-center gap-3 p-6 pb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nhập MSSV hoặc tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button 
                    onClick={handleAdd}
                    className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm"
                    onClick={() => setIsImportOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Tải
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto px-6 pb-6">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-10 px-0 text-left text-sm font-medium text-gray-700">STT</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">MSSV</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">HỌ VÀ TÊN</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">LỚP</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">NGÀY SINH</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">GHI CHÚ</TableHead>
                      <TableHead className="h-10 px-4 text-right text-sm font-medium text-gray-700">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.slice(0, 30).map((student, index) => (
                      <TableRow key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="h-12 px-0 text-sm text-gray-600">
                          {String(index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{student.mssv}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{student.hoTen}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{student.lop}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{student.ngaySinh}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{student.ghiChu || "-"}</TableCell>
                        <TableCell className="h-12 px-4 text-right">
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
                                onClick={() => handleEdit(student)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-sm text-red-600"
                                onClick={() => handleDelete(student)}
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
                  Hiển thị {Math.min(30, filteredStudents.length)}/{filteredStudents.length} bản ghi
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
                    disabled={filteredStudents.length <= 30}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={filteredStudents.length <= 30}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lich-su-import" className="m-0 h-full outline-none">
              <ImportHistoryTab 
                history={importHistory} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
      <StudentFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} student={selectedStudent} />
      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} student={selectedStudent} />
      <ImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </AppLayout>
  )
}