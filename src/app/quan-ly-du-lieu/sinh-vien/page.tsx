"use client"

import { useEffect, useRef, useState } from "react"
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
  Loader2,
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
import { usePathname, useRouter, useSearchParams } from "next/navigation"

// Components
import StudentFormDialog from "./components/StudentFormDialog"
import DeleteDialog from "./components/DeleteDialog"
import ImportDialog from "./components/ImportDialog"
import ImportHistoryTab from "./components/ImportHistoryTab"

// API & Types
import { getStudents, getClasses, getCohorts, getUploadHistory } from "./student.api"
import type { Student, ImportHistory, FileImport } from "./types"

function extractBackendMessage(error: any, fallback: string): string {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string" && detail.trim()) return detail
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item: any) => (typeof item === "string" ? item : item?.msg || JSON.stringify(item)))
      .join(", ")
  }

  const message = error?.response?.data?.message || error?.message
  if (typeof message === "string" && message.trim()) return message

  return fallback
}

export default function SinhVienPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState("thong-tin-sinh-vien")
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [classes, setClasses] = useState<any[]>([])
  const [cohorts, setCohorts] = useState<any[]>([])

  const [selectedKhoa, setSelectedKhoa] = useState<string | undefined>()
  const [selectedLop, setSelectedLop] = useState<string | undefined>()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const isSyncingFromUrlRef = useRef(false)
  const didInitFromUrlRef = useRef(false)

  // giữ nguyên để dùng cho tab lịch sử import
  const [importHistory, setImportHistory] = useState<FileImport[]>([])

  const getValidTab = (tab: string | null) => {
    return tab === "lich-su-import" ? "lich-su-import" : "thong-tin-sinh-vien"
  }

  useEffect(() => {
    isSyncingFromUrlRef.current = true

    const tabFromUrl = getValidTab(searchParams?.get("tab"))
    const queryFromUrl = searchParams?.get("q") ?? ""
    const khoaFromUrl = searchParams?.get("khoa") ?? undefined
    const lopFromUrl = searchParams?.get("lop") ?? undefined

    setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl))
    setSearchQuery((prev) => (prev === queryFromUrl ? prev : queryFromUrl))
    setSelectedKhoa((prev) => (prev === khoaFromUrl ? prev : khoaFromUrl))
    setSelectedLop((prev) => (prev === lopFromUrl ? prev : lopFromUrl))

    didInitFromUrlRef.current = true
    window.setTimeout(() => {
      isSyncingFromUrlRef.current = false
    }, 0)
  }, [searchParams])

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
      setLoadError("")

      // Build query params
      const params: any = {}
      if (selectedLop && selectedLop !== "all") {
        params.class_name = selectedLop
      } else if (selectedKhoa && selectedKhoa !== "all") {
        const cohortId = Number(selectedKhoa)
        if (Number.isFinite(cohortId)) {
          params.cohort_id = cohortId
        }
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
        setStudents([])
      }
    } catch (err: any) {
      setLoadError(extractBackendMessage(err, "Không tải được danh sách sinh viên."))
      setStudents([])
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
    } catch (err: any) {
      setLoadError(extractBackendMessage(err, "Không tải được danh sách lớp."))
    }
  }

  const fetchCohorts = async () => {
    try {
      const res = await getCohorts()
      if (res?.data) {
        setCohorts(Array.isArray(res.data) ? res.data : [])
      }
    } catch (err: any) {
      setLoadError(extractBackendMessage(err, "Không tải được danh sách khóa."))
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchClasses()
    fetchCohorts()
  }, [])

  const fetchImportHistory = async () => {
    try {
      const res = await getUploadHistory(["student"])
      const payload = res.data
      const data = Array.isArray(payload?.data) ? payload.data : []

      const mapped: FileImport[] = data.map((item: any, idx: number) => ({
        id: item.id || idx + 1,
        fileName: item.file_name || "",
        status: item.status || "",
        success: item.success_count || 0,
        failed: item.failure_count || 0,
        total: item.total_processed || 0,
        createdAt: item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : "",
        createdBy: item.created_by || "",
      }))

      setImportHistory(mapped)
    } catch (err) {
      console.error("Lỗi khi tải lịch sử import sinh viên:", err)
      setImportHistory([])
    }
  }

  useEffect(() => {
    if (activeTab === "lich-su-import") {
      fetchImportHistory()
    }
  }, [activeTab])

  // Refetch students when filters change
  useEffect(() => {
    fetchStudents()
  }, [selectedKhoa, selectedLop])

  // ===== Lọc theo Khóa, Lớp và tìm kiếm =====
  const availableClasses = !selectedKhoa || selectedKhoa === "all"
    ? classes.map((c: any) => c.class_name || c.name || c)
    : classes
      .filter((c: any) => {
        // Filter classes by cohort_id
        return c.cohort_id === Number(selectedKhoa)
      })
      .map((c: any) => c.class_name || c.name || c)

  const filteredStudents = students.filter((student) => {
    // Lọc theo Lớp cụ thể
    if (selectedLop && selectedLop !== "all" && student.lop !== selectedLop) {
      return false
    }

    // Chọn khóa nhưng chưa chọn lớp: lọc theo các lớp thuộc khóa đã chọn
    if ((!selectedLop || selectedLop === "all") && selectedKhoa && selectedKhoa !== "all") {
      const allowedClasses = new Set(
        classes
          .filter((c: any) => c.cohort_id === Number(selectedKhoa))
          .map((c: any) => c.class_name || c.name || c)
      )

      if (!allowedClasses.has(student.lop)) {
        return false
      }
    }

    // Lọc theo text tìm kiếm (MSSV hoặc Họ tên)
    const query = searchQuery.toLowerCase()
    if (!query) return true

    return (
      student.hoTen.toLowerCase().includes(query) ||
      String(student.mssv).includes(searchQuery)
    )
  })

  const PAGE_SIZE = 10
  const totalRecords = filteredStudents.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const pagedStudents = filteredStudents.slice(startIndex, startIndex + PAGE_SIZE)
  const displayCount = pagedStudents.length
  const isEmptyState = !loading && filteredStudents.length === 0

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedKhoa, selectedLop, searchQuery])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    if (!didInitFromUrlRef.current || isSyncingFromUrlRef.current) return

    const params = new URLSearchParams(searchParams?.toString() ?? "")

    if (activeTab !== "thong-tin-sinh-vien") params.set("tab", activeTab)
    else params.delete("tab")

    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    else params.delete("q")

    if (selectedKhoa) params.set("khoa", selectedKhoa)
    else params.delete("khoa")

    if (selectedLop) params.set("lop", selectedLop)
    else params.delete("lop")

    const next = params.toString()
    const current = searchParams?.toString() ?? ""

    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [activeTab, searchQuery, selectedKhoa, selectedLop, pathname, router, searchParams])

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
                className="relative min-w-[180px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center justify-center gap-2 w-full">
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
                    <SelectTrigger className="h-9 w-[200px] bg-white">
                      <SelectValue placeholder="Khóa" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="all">Tất cả</SelectItem>
                      {cohorts.map((cohort: any) => {
                        const label = cohort.name 
                          ? `${cohort.name} (${cohort.year_start}-${cohort.year_end})`
                          : `Khóa ${cohort.cohort_id} (${cohort.year_start}-${cohort.year_end})`
                        return (
                          <SelectItem key={cohort.cohort_id} value={String(cohort.cohort_id)}>
                            {label}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedLop}
                    onValueChange={(value) => {
                      setSelectedLop(value)
                      // Nếu chưa chọn Khóa, tự suy ra từ cohort_id của lớp
                      if (!selectedKhoa || selectedKhoa === "all") {
                        const selectedClass = classes.find((c: any) => {
                          const className = c.class_name || c.name || c
                          return className === value
                        })
                        if (selectedClass?.cohort_id) {
                          setSelectedKhoa(String(selectedClass.cohort_id))
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 w-[130px] bg-white">
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

              {loadError && (
                <p className="mb-3 text-sm text-red-600">{loadError}</p>
              )}

              {/* Card bảng – vừa đủ 10 dòng mỗi trang */}
              <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
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
                          <TableHead className="h-10 px-4 min-w-[96px] text-right text-sm font-semibold text-gray-700 bg-blue-50" />
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-[32.5rem] px-4 text-center align-middle">
                              <div className="flex h-full min-h-[20rem] items-center justify-center gap-3 text-gray-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Đang tải danh sách sinh viên...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : isEmptyState ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-[32.5rem] px-4 text-center align-middle">
                              <div className="flex h-full min-h-[20rem] items-center justify-center text-gray-500">
                                Không có sinh viên nào
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          pagedStudents.map((student, index) => (
                            <TableRow
                              key={student.id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <TableCell className="h-12 px-4 text-sm text-gray-600">
                                {String(startIndex + index + 1).padStart(2, "0")}
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
                              <TableCell className="h-12 px-4 min-w-[96px] text-sm text-gray-600 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => handleEdit(student)}>
                                      <Edit className="h-4 w-4 mr-2" /> Sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer text-sm text-red-600 focus:text-red-600"
                                      onClick={() => handleDelete(student)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" /> Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
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
                    <div className="flex items-center gap-1 px-3 text-sm">
                      <span className="font-medium text-gray-700">{safeCurrentPage}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{totalPages}</span>
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