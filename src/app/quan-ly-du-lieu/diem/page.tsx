"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/components/AppLayout"
import { Users, FileText } from "lucide-react"
import { History } from "lucide-react"
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
  ChevronsRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Dùng lại toàn bộ component & dữ liệu của Sinh viên
import ScoreFormDialog from "./components/ScoreFormDialog"
import DeleteScoreDialog from "./components/DeleteScoreDialog"
import ImportDialog from "../sinh-vien/components/ImportDialog"
import ImportHistoryTab from "../sinh-vien/components/ImportHistoryTab"
import { getStudents } from "../sinh-vien/student.api"
import type { Student, ImportHistory } from "../sinh-vien/types"
import { sampleStudents, classesByCourse } from "../sinh-vien/data"

function splitHoTen(fullName: string): { hoLot: string; ten: string } {
  const parts = fullName.trim().split(" ")
  if (parts.length <= 1) {
    return { hoLot: fullName, ten: "" }
  }
  return {
    hoLot: parts.slice(0, -1).join(" "),
    ten: parts[parts.length - 1] ?? "",
  }
}

const sampleScores = [
  { hp1: 3.0, hp2: 3.0, hp3: 3.0, hp4: 3.0 },
  { hp1: 2.7, hp2: 3.0, hp3: 3.3, hp4: 3.0 },
  { hp1: 3.0, hp2: 2.5, hp3: 3.2, hp4: 2.8 },
  { hp1: 2.5, hp2: 2.7, hp3: 3.0, hp4: 3.2 },
  { hp1: 3.2, hp2: 3.0, hp3: 2.8, hp4: 3.0 },
  { hp1: 2.3, hp2: 2.5, hp3: 2.7, hp4: 3.0 },
  { hp1: 3.3, hp2: 3.2, hp3: 3.0, hp4: 3.5 },
  { hp1: 2.8, hp2: 3.0, hp3: 2.5, hp4: 2.7 },
  { hp1: 3.0, hp2: 3.5, hp3: 3.2, hp4: 3.3 },
  { hp1: 2.0, hp2: 2.3, hp3: 2.5, hp4: 2.7 },
  { hp1: 3.4, hp2: 3.5, hp3: 3.3, hp4: 3.2 },
  { hp1: 2.6, hp2: 2.8, hp3: 3.0, hp4: 2.9 },
  { hp1: 3.1, hp2: 3.0, hp3: 3.2, hp4: 3.0 },
  { hp1: 2.4, hp2: 2.6, hp3: 2.8, hp4: 3.0 },
  { hp1: 3.0, hp2: 3.2, hp3: 3.1, hp4: 3.3 },
  { hp1: 2.9, hp2: 3.0, hp3: 2.7, hp4: 2.8 },
  { hp1: 3.2, hp2: 3.4, hp3: 3.5, hp4: 3.3 },
  { hp1: 2.5, hp2: 2.7, hp3: 2.9, hp4: 3.0 },
  { hp1: 3.0, hp2: 3.1, hp3: 3.0, hp4: 3.2 },
  { hp1: 2.8, hp2: 3.0, hp3: 3.2, hp4: 3.1 },
]

export default function DiemPage() {
  const [activeTab, setActiveTab] = useState("diem")
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedKhoa, setSelectedKhoa] = useState<string | undefined>()
  const [selectedLop, setSelectedLop] = useState<string | undefined>()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const [importHistory] = useState<ImportHistory[]>([])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const res = await getStudents()
        const apiStudents = Array.isArray(res?.data?.students) ? res.data.students : []

        if (apiStudents.length > 0) {
          const mapped: Student[] = apiStudents.map((s: any) => ({
            id: s.student_id,
            mssv: s.mssv,
            hoTen: s.ho_ten,
            lop: s.lop,
            ngaySinh: s.ngay_sinh,
            ghiChu: s.ghi_chu ?? "",
          }))
          setStudents(mapped)
        } else {
          setStudents(sampleStudents.slice(0, 5))
        }
      } catch (err) {
        console.error("Load sinh viên thất bại", err)
        setStudents(sampleStudents.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const allClasses = Object.values(classesByCourse).flat()

  const availableClasses =
    !selectedKhoa || selectedKhoa === "all"
      ? allClasses
      : classesByCourse[selectedKhoa] || []

  const filteredStudents = students.filter((student) => {
    if (!selectedLop || selectedLop === "all") {
      return false
    }

    if (
      selectedKhoa &&
      selectedKhoa !== "all" &&
      !String(student.lop).startsWith(selectedKhoa)
    ) {
      return false
    }

    if (selectedLop && selectedLop !== "all" && student.lop !== selectedLop) {
      return false
    }

    const query = searchQuery.toLowerCase()
    if (!query) return true

    return (
      student.hoTen.toLowerCase().includes(query) ||
      String(student.mssv).includes(searchQuery)
    )
  })

  const mockStudents: Student[] = Array.from({ length: 20 }).map((_, index) => ({
    id: index + 1,
    mssv: String(221121521206 + index),
    hoTen: "Nguyễn Văn Linh",
    lop: "48K21.2",
    ngaySinh: "16/04/2004",
    ghiChu: "",
  }))

  const PAGE_SIZE = 30
  const hasFilter = !!selectedLop && selectedLop !== "all"
  const visibleStudents = hasFilter ? filteredStudents.slice(0, PAGE_SIZE) : []

  // Dùng danh sách lọc theo Lớp nếu có, nếu không thì dùng toàn bộ sinh viên
  const lookupStudents = hasFilter ? filteredStudents : students
  const courseOptions = [
    "Học phần 1",
    "Học phần 2",
    "Học phần 3",
    "Học phần 4",
    "Học phần 5",
    "Học phần 6",
    "Học phần 7",
    "Học phần 8",
    "Học phần 9",
    "Học phần 10",
  ]

  const totalRecords = hasFilter ? filteredStudents.length : 0
  const displayCount = Math.min(PAGE_SIZE, totalRecords)
  const totalPages = Math.max(1, Math.ceil(Math.max(totalRecords, 1) / PAGE_SIZE))

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
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Điểm
            </span>
          </h1>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger
                value="diem"
                className="relative min-w-[180px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <FileText className="w-4 h-4" />
                  Điểm
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

          <div className="flex-1 min-h-0 mt-5 flex flex-col">
            <TabsContent
              value="diem"
              className="m-0 h-full outline-none flex flex-col"
            >
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

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedKhoa}
                    onValueChange={(value) => {
                      setSelectedKhoa(value)
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
                  <Select
                    value={selectedLop}
                    onValueChange={(value) => {
                      setSelectedLop(value)
                      // Nếu chưa chọn Khóa, tự suy ra từ tiền tố của Lớp (vd: 48K21.2 -> 48K)
                      if (!selectedKhoa || selectedKhoa === "all") {
                        const matchedKhoa = ["48K", "49K", "50K"].find((khoa) =>
                          String(value).startsWith(khoa)
                        )
                        if (matchedKhoa) {
                          setSelectedKhoa(matchedKhoa)
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 w-[140px] bg-white">
                      <SelectValue placeholder="Lớp" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      {availableClasses.map((lop) => (
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
                    <Table className="w-full min-w-[1100px]" style={{ borderCollapse: "collapse" }}>
                      <TableHeader>
                        <TableRow
                          className="border-b border-gray-200 bg-blue-50"
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            STT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            LỚP
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌ LÓT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            TÊN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                            NGÀY SINH
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 1
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 2
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 3
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 4
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 5
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 6
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 7
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 8
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 9
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                            HỌC PHẦN 10
                          </TableHead>
                          <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-12" />
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {visibleStudents.map((student, index) => (
                          <TableRow
                            key={student.id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            {(() => {
                              const { hoLot, ten } = splitHoTen(student.hoTen)
                              return (
                                <>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600">
                                    {String(index + 1).padStart(2, "0")}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600">
                                    {student.lop}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600">
                                    {hoLot}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600">
                                    {ten}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600">
                                    {student.ngaySinh}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    {sampleScores[index]?.hp1 ?? "-"}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    {sampleScores[index]?.hp2 ?? "-"}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    {sampleScores[index]?.hp3 ?? "-"}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    {sampleScores[index]?.hp4 ?? "-"}
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    -
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    -
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    -
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    -
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    -
                                  </TableCell>
                                  <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                    -
                                  </TableCell>
                                </>
                              )
                            })()}
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

      <ScoreFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={selectedStudent}
        studentOptions={lookupStudents}
        courseOptions={courseOptions}
      />
      <DeleteScoreDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        student={selectedStudent}
      />
      <ImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        importTypeOptions={[
          { value: "diem-tong-hop", label: "Điểm tổng hợp" },
          { value: "diem-tieng-anh", label: "Điểm tiếng anh" },
        ]}
        classOptions={allClasses.map((lop) => ({ value: lop, label: lop }))}
      />
    </AppLayout>
  )
}
