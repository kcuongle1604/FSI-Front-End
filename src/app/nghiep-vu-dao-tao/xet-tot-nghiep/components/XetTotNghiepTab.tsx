import { useEffect, useState } from "react"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type XetTotNghiep = {
  id: number
  mssv: string
  name: string
  class: string
  year: string
  course: string
  tcbb: string
  tctc: string
  totalCredits: string
  gpa: string
  ccdr: string
  program: string
  status: string
}

interface XetTotNghiepTabProps {
  students: XetTotNghiep[]
}

export default function XetTotNghiepTab({ students }: XetTotNghiepTabProps) {
  const router = useRouter()
  const [programFilter, setProgramFilter] = useState<"all" | "hoan-thanh" | "chua-hoan-thanh">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "dat" | "khong-dat">("all")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredStudents = students.filter((student) => {
    const matchesProgram =
      programFilter === "all" ||
      (programFilter === "hoan-thanh" && student.program === "Hoàn thành") ||
      (programFilter === "chua-hoan-thanh" && student.program === "Chưa hoàn thành")

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "dat" && student.status === "Đạt") ||
      (statusFilter === "khong-dat" && student.status === "Không đạt")

    return matchesProgram && matchesStatus
  })

  const PAGE_SIZE = 10
  const totalRecords = filteredStudents.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const pagedStudents = filteredStudents.slice(startIndex, startIndex + PAGE_SIZE)
  const displayCount = pagedStudents.length

  useEffect(() => {
    setCurrentPage(1)
  }, [programFilter, statusFilter, students])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleStudentClick = (mssv: string) => {
    const search = typeof window !== "undefined" ? window.location.search : ""
    router.push(`/nghiep-vu-dao-tao/xet-tot-nghiep/${mssv}${search}`)
  }

  return (
    <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      {/* Table */}
      <div className="flex flex-col overflow-hidden min-h-0">
        <div className="overflow-auto">
          <Table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-blue-50" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">STT</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">MSSV</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">Họ Và Tên</TableHead>
                <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">Lớp</TableHead>
                <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">TCBB</TableHead>
                <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">TCTC</TableHead>
                <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">Tổng TC</TableHead>
                <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">GPA</TableHead>
                <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">CCDR</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                      CHƯƠNG TRÌNH HỌC
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={programFilter === "all"}
                      onCheckedChange={() => setProgramFilter("all")}
                    >
                      Tất cả
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={programFilter === "hoan-thanh"}
                      onCheckedChange={() => setProgramFilter("hoan-thanh")}
                    >
                      Hoàn thành
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={programFilter === "chua-hoan-thanh"}
                      onCheckedChange={() => setProgramFilter("chua-hoan-thanh")}
                    >
                      Chưa hoàn thành
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                      ĐIỀU KIỆN TN
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === "all"}
                      onCheckedChange={() => setStatusFilter("all")}
                    >
                      Tất cả
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === "dat"}
                      onCheckedChange={() => setStatusFilter("dat")}
                    >
                      Đạt
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === "khong-dat"}
                      onCheckedChange={() => setStatusFilter("khong-dat")}
                    >
                      Không đạt
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedStudents.length > 0 ? (
              pagedStudents.map((student, index) => (
                <TableRow key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="h-12 px-4 text-center text-sm text-gray-600">
                    {String(startIndex + index + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="h-12 px-4 text-sm">
                    <button
                      type="button"
                      onClick={() => handleStudentClick(student.mssv)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-normal text-sm cursor-pointer"
                      style={{ textDecoration: 'none' }}
                    >
                      {student.mssv}
                    </button>
                  </TableCell>
                  <TableCell className="h-12 px-4 text-sm text-gray-600">{student.name}</TableCell>
                  <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.class}</TableCell>
                  <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.tcbb}</TableCell>
                  <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.tctc}</TableCell>
                  <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.totalCredits}</TableCell>
                  <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.gpa}</TableCell>
                  <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.ccdr}</TableCell>
                  <TableCell className="h-12 px-4 text-sm text-gray-600">{student.program}</TableCell>
                  <TableCell className="h-12 px-4 text-sm">
                    <span className={student.status === "Đạt" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {student.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-120 text-center text-gray-500">
                  Không có dữ liệu xét tốt nghiệp
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
        <div className="text-sm text-gray-600">
          Hiển thị {displayCount}/{totalRecords} dòng
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-gray-700">{safeCurrentPage}</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-600">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
