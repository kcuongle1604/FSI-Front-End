"use client"

import { useEffect, useState } from "react"
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

// Components
import StudentFormDialog from "./components/StudentFormDialog"
import DeleteDialog from "./components/DeleteDialog"
import ImportDialog from "./components/ImportDialog"
import ImportHistoryTab from "./components/ImportHistoryTab"

// API & Types
import { getStudents } from "./student.api"
import type { Student, ImportHistory } from "./types"

export default function SinhVienPage() {
  const [activeTab, setActiveTab] = useState("thong-tin-sinh-vien")
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // giữ nguyên để dùng cho tab lịch sử import
  const [importHistory] = useState<ImportHistory[]>([])

  // ===== FIX: LOAD DATA TỪ API =====
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const res = await getStudents()

        // map đúng structure FE
        const mapped: Student[] = res.data.students.map((s: any) => ({
          id: s.student_id,
          mssv: s.mssv,
          hoTen: s.ho_ten,
          lop: s.lop,
          ngaySinh: s.ngay_sinh,
          ghiChu: s.ghi_chu ?? "",
        }))

        setStudents(mapped)
      } catch (err) {
        console.error("Load sinh viên thất bại", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // ===== FIX: MSSV là number =====
  const filteredStudents = students.filter(student =>
    student.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(student.mssv).includes(searchQuery)
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
          {/* TabsList – GIỮ NGUYÊN */}
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

          {/* Content */}
          <div className="flex-1 min-h-0 bg-white rounded-lg border border-slate-200 overflow-hidden mt-5">
            <TabsContent value="thong-tin-sinh-vien" className="m-0 h-full outline-none flex flex-col">
              
              {/* Search & Actions */}
              <div className="flex items-center gap-3 p-6 pb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
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
                      <TableHead className="h-10 px-0 text-sm font-medium text-gray-700">STT</TableHead>
                      <TableHead className="h-10 px-4 text-sm font-medium text-gray-700">MSSV</TableHead>
                      <TableHead className="h-10 px-4 text-sm font-medium text-gray-700">HỌ VÀ TÊN</TableHead>
                      <TableHead className="h-10 px-4 text-sm font-medium text-gray-700">LỚP</TableHead>
                      <TableHead className="h-10 px-4 text-sm font-medium text-gray-700">NGÀY SINH</TableHead>
                      <TableHead className="h-10 px-4 text-sm font-medium text-gray-700">GHI CHÚ</TableHead>
                      <TableHead className="h-10 px-4 text-right" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredStudents.slice(0, 30).map((student, index) => (
                      <TableRow key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="px-0">
                          {String(index + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell className="px-4">{student.mssv}</TableCell>
                        <TableCell className="px-4">{student.hoTen}</TableCell>
                        <TableCell className="px-4">{student.lop}</TableCell>
                        <TableCell className="px-4">{student.ngaySinh}</TableCell>
                        <TableCell className="px-4">{student.ghiChu || "-"}</TableCell>
                        <TableCell className="px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" sideOffset={8}>
                              <DropdownMenuItem onClick={() => handleEdit(student)}>
                                <Edit className="h-4 w-4 mr-2" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(student)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination – GIỮ NGUYÊN */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Hiển thị {Math.min(30, filteredStudents.length)}/{filteredStudents.length} bản ghi
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 text-sm">1 / 1</div>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lich-su-import" className="m-0 h-full outline-none">
              <ImportHistoryTab history={importHistory} />
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