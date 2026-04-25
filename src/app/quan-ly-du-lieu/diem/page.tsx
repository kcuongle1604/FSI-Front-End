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
import { usePathname, useRouter, useSearchParams } from "next/navigation"

// Components and APIs
import ScoreFormDialog from "./components/ScoreFormDialog"
import DeleteScoreDialog from "./components/DeleteScoreDialog"
import ScoreImportDialog from "./components/ScoreImportDialog"
import ImportHistoryTab from "../sinh-vien/components/ImportHistoryTab"
import { getScoreMatrix, getClasses } from "./score.api"
import { getCohorts } from "../sinh-vien/student.api"
import type { ImportHistory } from "../sinh-vien/types"
import type { ScoreCell, ScoreImportResponse, StudentScore } from "./types"

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

function formatScoreCell(value: ScoreCell): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return value

  const scoreValue = value.score_4 ?? value.score ?? value.value
  if (scoreValue === null || scoreValue === undefined) return "-"
  return String(scoreValue)
}

function normalizeScoreKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

export default function DiemPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState("diem")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState("")

  // Score matrix data
  const [scoreData, setScoreData] = useState<StudentScore[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<any[]>([]) // Using any[] to match student API response
  const [cohorts, setCohorts] = useState<any[]>([])
  const [selectedKhoa, setSelectedKhoa] = useState<string | undefined>()
  const [selectedClass, setSelectedClass] = useState<string | undefined>()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentScore | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const latestRefreshRequestRef = useRef(0)
  const isSyncingFromUrlRef = useRef(false)
  const didInitFromUrlRef = useRef(false)

  const [importHistory] = useState<ImportHistory[]>([])

  const getValidTab = (tab: string | null) => {
    return tab === "lich-su-import" ? "lich-su-import" : "diem"
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
    setSelectedClass((prev) => (prev === lopFromUrl ? prev : lopFromUrl))

    didInitFromUrlRef.current = true
    window.setTimeout(() => {
      isSyncingFromUrlRef.current = false
    }, 0)
  }, [searchParams])

  const toFiniteNumber = (value: unknown): number | null => {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : null
  }

  const selectedClassId = (() => {
    if (!selectedClass || selectedClass === "all") return null

    const matchedClass = classes.find((c: any) => {
      const className = c?.class_name || c?.name || c
      return className === selectedClass
    })

    const rawClassId = matchedClass?.class_id ?? matchedClass?.id
    return toFiniteNumber(rawClassId)
  })()

  const selectedClassCohortId = (() => {
    if (!selectedClass || selectedClass === "all") return null

    const matchedClass = classes.find((c: any) => {
      const className = c?.class_name || c?.name || c
      return className === selectedClass
    })

    const rawCohortId = matchedClass?.cohort_id
    return toFiniteNumber(rawCohortId)
  })()

  const scoreRefreshKey = `${selectedClass ?? ""}|${selectedClassId ?? ""}`

  const availableClasses = !selectedKhoa || selectedKhoa === "all"
    ? classes.map((c: any) => c.class_name || c.name || c)
    : classes
      .filter((c: any) => c.cohort_id === Number(selectedKhoa))
      .map((c: any) => c.class_name || c.name || c)

  const refreshScoreMatrix = async (targetClassName?: string, targetClassId?: number | null) => {
    const requestId = latestRefreshRequestRef.current + 1
    latestRefreshRequestRef.current = requestId

    if (!targetClassName || targetClassName === "all") {
      if (requestId === latestRefreshRequestRef.current) {
        setScoreData([])
        setSubjects([])
      }
      return
    }

    try {
      if (requestId === latestRefreshRequestRef.current) {
        setLoading(true)
        setPageError("")
      }
      const res = await getScoreMatrix(
        typeof targetClassId === "number" && Number.isFinite(targetClassId)
          ? { class_id: targetClassId }
          : { class_name: targetClassName }
      )
      if (requestId === latestRefreshRequestRef.current) {
        setScoreData(res.data.students)
        setSubjects(res.data.subjects)
      }
    } catch (err: any) {
      if (requestId === latestRefreshRequestRef.current) {
        setPageError(extractBackendMessage(err, "Không tải được bảng điểm."))
        setScoreData([])
        setSubjects([])
      }
    } finally {
      if (requestId === latestRefreshRequestRef.current) {
        setLoading(false)
      }
    }
  }

  const refreshScoreMatrixWithRetry = (targetClassName?: string, targetClassId?: number | null) => {
    void refreshScoreMatrix(targetClassName, targetClassId)

    if (!targetClassName || targetClassName === "all") {
      return
    }

    window.setTimeout(() => {
      void refreshScoreMatrix(targetClassName, targetClassId)
    }, 500)

    window.setTimeout(() => {
      void refreshScoreMatrix(targetClassName, targetClassId)
    }, 1200)
  }

  // Fetch available classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClasses()
        setClasses(Array.isArray(res?.data) ? res.data : [])
      } catch (err: any) {
        setPageError(extractBackendMessage(err, "Không tải được danh sách lớp."))
      }
    }

    const fetchCohorts = async () => {
      try {
        const res = await getCohorts()
        setCohorts(Array.isArray(res?.data) ? res.data : [])
      } catch (err: any) {
        setPageError(extractBackendMessage(err, "Không tải được danh sách khóa."))
      }
    }

    fetchClasses()
    fetchCohorts()
  }, [])

  // Fetch score matrix when class is selected
  useEffect(() => {
    refreshScoreMatrix(selectedClass, selectedClassId)
  }, [scoreRefreshKey])

  // Filter score data by search query
  const filteredScoreData = scoreData.filter((student) => {
    const query = searchQuery.toLowerCase()
    if (!query) return true

    return (
      student.full_name.toLowerCase().includes(query) ||
      String(student.student_id).includes(searchQuery)
    )
  })

  const PAGE_SIZE = 10
  const hasData = selectedClass && selectedClass !== "all"
  const totalRecords = filteredScoreData.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const visibleStudents = filteredScoreData.slice(startIndex, startIndex + PAGE_SIZE)
  const displayCount = visibleStudents.length

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedClass, searchQuery])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    if (!didInitFromUrlRef.current || isSyncingFromUrlRef.current) return

    const params = new URLSearchParams(searchParams?.toString() ?? "")

    if (activeTab !== "diem") params.set("tab", activeTab)
    else params.delete("tab")

    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    else params.delete("q")

    if (selectedKhoa) params.set("khoa", selectedKhoa)
    else params.delete("khoa")

    if (selectedClass) params.set("lop", selectedClass)
    else params.delete("lop")

    const next = params.toString()
    const current = searchParams?.toString() ?? ""

    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [
    activeTab,
    searchQuery,
    selectedKhoa,
    selectedClass,
    pathname,
    router,
    searchParams,
  ])

  const handleEdit = (student: StudentScore) => {
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDelete = (student: StudentScore) => {
    setSelectedStudent(student)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedStudent(null)
    setIsFormOpen(true)
  }

  const applyOptimisticScoreUpdate = (payload?: {
    studentId: number
    subjectId: string
    subjectLabel: string
    matchedScoreKey?: string
    score4: string
  }) => {
    if (!payload) return

    setScoreData((prev) =>
      prev.map((student) => {
        if (student.student_id !== payload.studentId) return student

        const scoreKeys = Object.keys(student.scores || {})
        const normalizedLabel = normalizeScoreKey(payload.subjectLabel)
        const normalizedSubjectId = normalizeScoreKey(payload.subjectId)

        const matchedKey =
          payload.matchedScoreKey ||
          scoreKeys.find((key) => normalizeScoreKey(key) === normalizedLabel) ||
          scoreKeys.find((key) => normalizeScoreKey(key) === normalizedSubjectId) ||
          payload.subjectLabel

        return {
          ...student,
          scores: {
            ...student.scores,
            [matchedKey]: payload.score4,
          },
        }
      })
    )
  }

  const applyOptimisticScoreDelete = (payload?: {
    studentId: number
    subjectId: string
    subjectLabel: string
    matchedScoreKey?: string
  }) => {
    if (!payload) return

    setScoreData((prev) =>
      prev.map((student) => {
        if (student.student_id !== payload.studentId) return student

        const scoreKeys = Object.keys(student.scores || {})
        const normalizedLabel = normalizeScoreKey(payload.subjectLabel)
        const normalizedSubjectId = normalizeScoreKey(payload.subjectId)

        const matchedKey =
          payload.matchedScoreKey ||
          scoreKeys.find((key) => normalizeScoreKey(key) === normalizedLabel) ||
          scoreKeys.find((key) => normalizeScoreKey(key) === normalizedSubjectId) ||
          payload.subjectLabel

        return {
          ...student,
          scores: {
            ...student.scores,
            [matchedKey]: null,
          },
        }
      })
    )
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
              {/* Search & Actions */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập MSSV hoặc tên..."
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
                      setSelectedClass(undefined)
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
                    value={selectedClass}
                    onValueChange={(value) => {
                      setSelectedClass(value)

                      if (!selectedKhoa || selectedKhoa === "all") {
                        const selectedClassItem = classes.find((c: any) => {
                          const className = c.class_name || c.name || c
                          return className === value
                        })
                        if (selectedClassItem?.cohort_id) {
                          setSelectedKhoa(String(selectedClassItem.cohort_id))
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 w-[130px] bg-white">
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="all">Tất cả</SelectItem>
                      {availableClasses.map((className: string) => (
                        <SelectItem key={className} value={className}>
                          {className}
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

              {pageError && (
                <p className="mb-3 text-sm text-red-600">{pageError}</p>
              )}

              {/* Score Table */}
              <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="overflow-auto">
                    <Table className="w-full" style={{ borderCollapse: "collapse" }}>
                      <TableHeader>
                        <TableRow
                          className="border-b border-gray-200 bg-blue-50"
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: 0, zIndex: 20, minWidth: "60px", width: "60px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            STT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "60px", zIndex: 20, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            LỚP
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "180px", zIndex: 20, minWidth: "150px", width: "150px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            HỌ LÓT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "330px", zIndex: 20, minWidth: "100px", width: "100px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            TÊN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "430px", zIndex: 20, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            NGÀY SINH
                          </TableHead>
                          {subjects.map((subject) => (
                            <TableHead
                              key={subject}
                              className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 whitespace-nowrap min-w-[80px] w-[100px] max-w-[100px]"
                            >
                              <div className="truncate" title={subject.toUpperCase()}>
                                {subject.toUpperCase()}
                              </div>
                            </TableHead>
                          ))}
                          <TableHead
                            className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-12"
                            style={{
                              position: "sticky",
                              right: 0,
                              zIndex: 20,
                              minWidth: "56px",
                              width: "56px",
                              boxShadow: "-2px 0 4px rgba(0,0,0,0.1)",
                            }}
                          />
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {visibleStudents.length > 0 ? (
                          visibleStudents.map((student, index) => {
                            const { hoLot, ten } = splitHoTen(student.full_name)
                            return (
                              <TableRow
                                key={student.student_id}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: 0, zIndex: 5, minWidth: "60px", width: "60px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {String(startIndex + index + 1).padStart(2, "0")}
                                </TableCell>
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "60px", zIndex: 5, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {student.class_name}
                                </TableCell>
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "180px", zIndex: 5, minWidth: "150px", width: "150px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {hoLot}
                                </TableCell>
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "330px", zIndex: 5, minWidth: "100px", width: "100px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {ten}
                                </TableCell>
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "430px", zIndex: 5, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {student.dob}
                                </TableCell>
                                {subjects.map((subject) => {
                                  const displayValue = formatScoreCell(student.scores[subject])
                                  return (
                                    <TableCell
                                      key={subject}
                                      className="h-12 px-4 text-sm text-gray-600 text-center min-w-[80px] w-[80px] max-w-[80px]"
                                    >
                                      <div className="truncate" title={displayValue}>
                                        {displayValue}
                                      </div>
                                    </TableCell>
                                  )
                                })}
                                <TableCell
                                  className="h-12 px-4 text-right w-12 bg-white"
                                  style={{
                                    position: "sticky",
                                    right: 0,
                                    zIndex: 6,
                                    minWidth: "56px",
                                    width: "56px",
                                    boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                      <DropdownMenuItem className="text-sm" onClick={() => handleEdit(student)}>
                                        <Edit className="h-4 w-4 mr-2" /> Sửa
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-sm text-red-600 focus:text-red-600"
                                        onClick={() => handleDelete(student)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" /> Xóa
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6 + subjects.length}
                              className="h-32 text-center text-gray-500"
                            >
                              {loading
                                ? "Đang tải..."
                                : !hasData
                                  ? "Vui lòng chọn  lớp để xem điểm"
                                  : "Không có dữ liệu"}
                            </TableCell>
                          </TableRow>
                        )}
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

      <ScoreFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={selectedStudent}
        studentOptions={scoreData}
        courseOptions={subjects}
        classId={selectedClassId}
        classCohortId={selectedClassCohortId}
        onSaveSuccess={(payload) => {
          applyOptimisticScoreUpdate(payload)
          const classFromRoute = searchParams?.get("lop") ?? selectedClass
          const matchedClassFromRoute = classes.find((c: any) => {
            const className = c?.class_name || c?.name || c
            return className === classFromRoute
          })
          const routeClassId = toFiniteNumber(matchedClassFromRoute?.class_id ?? matchedClassFromRoute?.id)

          router.refresh()
          window.setTimeout(() => {
            refreshScoreMatrixWithRetry(classFromRoute || selectedClass, routeClassId ?? selectedClassId)
          }, 2000)
        }}
      />
      <DeleteScoreDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        student={selectedStudent}
        courseOptions={subjects}
        classId={selectedClassId}
        onDeleteSuccess={(payload) => {
          applyOptimisticScoreDelete(payload)
          refreshScoreMatrixWithRetry(selectedClass, selectedClassId)
        }}
      />
      <ScoreImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportSuccess={(result: ScoreImportResponse) => {
          // Refresh scores if a class is selected
          if (selectedClass && selectedClass !== "all") {
            refreshScoreMatrixWithRetry(selectedClass, selectedClassId)
          }
        }}
      />
    </AppLayout>
  )
}
