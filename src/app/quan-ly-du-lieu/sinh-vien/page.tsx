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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Components
import StudentFormDialog from "./components/StudentFormDialog"
import DeleteDialog from "./components/DeleteDialog"
import ImportDialog from "./components/ImportDialog"
import ImportHistoryTab from "./components/ImportHistoryTab"

// API & Types
import { getStudents, getClasses } from "./student.api"
import type { Student, ImportHistory } from "./types"
import { sampleStudents } from "./data"

export default function SinhVienPage() {
  const [activeTab, setActiveTab] = useState("thong-tin-sinh-vien")
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<any[]>([])

  const [selectedKhoa, setSelectedKhoa] = useState<string | undefined>()
  const [selectedLop, setSelectedLop] = useState<string | undefined>()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // giữ nguyên để dùng cho tab lịch sử import
  const [importHistory] = useState<ImportHistory[]>([])

  // ===== FIX: LOAD DATA TỪ API =====
  // Convert yyyy-mm-dd to dd/mm/yyyy for display
  const convertDateToDisplay = (isoDate: string | null): string => {
    if (!isoDate) return ""
    const parts = isoDate.split("-")
    if (parts.length !== 3) return isoDate
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)

      // Build query params
      const params: any = {}
      if (selectedLop && selectedLop !== "all") {
        params.class_name = selectedLop
      }

      const res = await getStudents(params)

      const apiStudents = Array.isArray(res?.data?.students) ? res.data.students : []

      if (apiStudents.length > 0) {
        // Map đúng structure từ API response
        const mapped: Student[] = apiStudents.map((s: any) => ({
          id: s.student_id,
          mssv: s.student_id, // API không có mssv riêng, dùng student_id
          hoTen: s.full_name,
          lop: s.class_name,
          ngaySinh: convertDateToDisplay(s.dob), // Convert yyyy-mm-dd to dd/mm/yyyy
          ghiChu: s.notes ?? "",
        }))

        setStudents(mapped)
      } else {
        // fallback: hiển thị 5 bản ghi mẫu
        setStudents(sampleStudents.slice(0, 5))
      }
    } catch (err) {
      console.error("Load sinh viên thất bại", err)
      // fallback khi API lỗi: hiển thị 5 bản ghi mẫu
      setStudents(sampleStudents.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await getClasses()
      if (res?.data) {
        setClasses(Array.isArray(res.data) ? res.data : [])
      }
    } catch (err) {
      console.error("Load classes failed", err)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  // Refetch students when selectedLop changes
  useEffect(() => {
    if (selectedLop) {
      fetchStudents()
    }
  }, [selectedLop])

  // ===== Lọc theo Khóa, Lớp và tìm kiếm =====
  const availableClasses = !selectedKhoa || selectedKhoa === "all"
    ? classes.map((c: any) => c.class_name || c.name || c)
    : classes
      .filter((c: any) => {
        const className = c.class_name || c.name || c
        return String(className).startsWith(selectedKhoa)
      })
      .map((c: any) => c.class_name || c.name || c)

  const filteredStudents = students.filter((student) => {
    // Chưa chọn lớp => không hiển thị dữ liệu
    if (!selectedLop || selectedLop === "all") {
      return false
    }

    // Lọc theo Khóa nếu được chọn
    if (selectedKhoa && selectedKhoa !== "all" && !String(student.lop).startsWith(selectedKhoa)) {
      return false
    }

    // Lọc theo Lớp cụ thể
    if (selectedLop && selectedLop !== "all" && student.lop !== selectedLop) {
      return false
    }

    // Lọc theo text tìm kiếm (MSSV hoặc Họ tên)
    const query = searchQuery.toLowerCase()
    if (!query) return true

    return (
      student.hoTen.toLowerCase().includes(query) ||
      String(student.mssv).includes(searchQuery)
    )
  })

  const PAGE_SIZE = 30
  const totalRecords = filteredStudents.length
  const displayCount = Math.min(PAGE_SIZE, totalRecords)
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))

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
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Sinh viên
            </span>
          </h1>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
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
          <div className="flex-1 min-h-0 mt-5 flex flex-col">
            <TabsContent value="thong-tin-sinh-vien" className="m-0 h-full outline-none flex flex-col">
              {/* Search & Actions – giống Quản lý người dùng */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập MSSV..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedKhoa}
                    onValueChange={(value) => {
                      setSelectedKhoa(value)
                      // Reset lớp khi đổi khóa để bắt buộc chọn lại
                      setSelectedLop(undefined)
                    }}
                  >
                    <SelectTrigger className="h-9 w-[120px] bg-white">
                      <SelectValue placeholder="Khóa" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="48K">48K</SelectItem>
                      <SelectItem value="49K">49K</SelectItem>
                      <SelectItem value="50K">50K</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedLop} onValueChange={setSelectedLop}>
                    <SelectTrigger className="h-9 w-[180px] bg-white">
                      <SelectValue placeholder="Lớp" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="all">Tất cả</SelectItem>
                      {availableClasses.map((lop: string) => (
                        <SelectItem key={lop} value={lop}>
                          {lop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  >
                    <Download className="h-4 w-4" />
                    Mẫu
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
                </div>
              </div>

              {/* Card bảng – giống UserManagementTable */}
              <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="overflow-auto">
                    <Table className="w-full" style={{ borderCollapse: "collapse" }}>
                      <TableHeader>
                        <TableRow
                          className="border-b border-gray-200 bg-blue-50"
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            STT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            MSSV
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌ VÀ TÊN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            LỚP
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            NGÀY SINH
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            GHI CHÚ
                          </TableHead>
                          <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-12" />
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredStudents.slice(0, 30).map((student, index) => (
                          <TableRow
                            key={student.id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <TableCell className="h-12 px-4 text-sm text-gray-600">
                              {String(index + 1).padStart(2, "0")}
                            </TableCell>
                            <TableCell className="h-12 px-4 text-sm text-gray-600">
                              {student.mssv}
                            </TableCell>
                            <TableCell className="h-12 px-4 text-sm text-gray-600">
                              {student.hoTen}
                            </TableCell>
                            <TableCell className="h-12 px-4 text-sm text-gray-600">
                              {student.lop}
                            </TableCell>
                            <TableCell className="h-12 px-4 text-sm text-gray-600">
                              {student.ngaySinh}
                            </TableCell>
                            <TableCell className="h-12 px-4 text-sm text-gray-600">
                              {student.ghiChu || "-"}
                            </TableCell>
                            <TableCell className="h-12 px-4 text-right w-12">
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
                </div>

                {/* Pagination – giống UserManagementTable */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
                  <div className="text-sm text-gray-600">
                    Hiển thị {displayCount}/{totalRecords} dòng
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300"
                      disabled
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300"
                      disabled
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 px-3 text-sm">
                      <span className="font-medium text-gray-700">1</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300"
                      disabled={totalRecords <= PAGE_SIZE}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300"
                      disabled={totalRecords <= PAGE_SIZE}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="lich-su-import"
              className="m-0 h-full outline-none flex flex-col min-h-0"
            >
              <ImportHistoryTab history={importHistory} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
      <StudentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={selectedStudent}
        onSuccess={fetchStudents}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        student={selectedStudent}
        onSuccess={fetchStudents}
      />
      <ImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} onImportSuccess={fetchStudents} />
    </AppLayout>
  )
}