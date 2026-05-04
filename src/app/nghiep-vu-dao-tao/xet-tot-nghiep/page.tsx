"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { Download, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import AppLayout from "@/components/AppLayout"
import XetTotNghiepTab from "./components/XetTotNghiepTab"
import { api } from "@/lib/api"

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

type ClassApiItem = {
  class_id?: number
  id?: number
  class_name?: string
  name?: string
  cohort_id?: number
}

type SemesterApiItem = {
  semester_id?: number
  id?: number
  semester_name?: string
  name?: string
  term?: string
  academic_year?: string
}

type CohortApiItem = {
  cohort_id?: number
  id?: number
  name?: string
  year_start?: number
  year_end?: number
}

type GraduationClassInfo = {
  class_id?: number
  class_name?: string
  cohort_id?: number
  cohort_name?: string
  major_id?: number
  major_name?: string
  requirement_id?: number
  requirement_name?: string
  required_credits?: number
  elective_credits?: number
  total_credits?: number
  gpa?: number
  sum_certificate?: number
  total_certificate?: number
  total_students?: number
  eligible_students?: number
  ineligible_students?: number
}

type GraduationStudentItem = {
  stt?: number
  student_id?: number
  full_name?: string
  class_name?: string
  required_credits_earned?: number
  elective_credits_earned?: number
  total_credits_earned?: number
  gpa?: number
  sum_certificate_earned?: number
  sum_certificate?: number
  certificates?: number
  program_status?: string
  graduation_status?: unknown
  notes?: string | null
}

type GraduationEligibilityResponse = {
  status?: string
  message?: string
  class_info?: GraduationClassInfo
  students?: GraduationStudentItem[]
}

type GraduationSavePayload = {
  semester_id: number
  student_ids: number[]
}

type GraduationSaveResponse = {
  saved?: number
  skipped?: number
  message?: string
}

function parseSemestersPayload(
  payload: SemesterApiItem[] | { data?: SemesterApiItem[]; items?: SemesterApiItem[] } | null | undefined
): SemesterApiItem[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

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

function formatProgress(earned: unknown, required: unknown, fractionDigits = 0): string {
  const earnedNum = Number(earned)
  const requiredNum = Number(required)

  const formatValue = (value: number) =>
    fractionDigits > 0 ? value.toFixed(fractionDigits) : String(Math.trunc(value))

  const earnedText = Number.isFinite(earnedNum) ? formatValue(earnedNum) : "-"
  const requiredText = Number.isFinite(requiredNum) ? formatValue(requiredNum) : "-"

  return `${earnedText}/${requiredText}`
}

function normalizeFilterValue(value: string): string {
  return value
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
}

function isEligibleGraduationStatus(status: unknown): boolean {
  if (typeof status === "boolean") return status
  if (typeof status === "number") return status === 1

  if (Array.isArray(status)) {
    return status.some((item) => isEligibleGraduationStatus(item))
  }

  if (status && typeof status === "object") {
    const nested = status as Record<string, unknown>
    const preferredKeys = ["eligible", "is_eligible", "isEligible", "status", "graduation_status", "value", "result"]

    for (const key of preferredKeys) {
      if (Object.prototype.hasOwnProperty.call(nested, key) && isEligibleGraduationStatus(nested[key])) {
        return true
      }
    }

    return Object.values(nested).some((value) => isEligibleGraduationStatus(value))
  }

  const normalized = normalizeFilterValue(String(status || ""))
  if (!normalized) return false

  const positiveExact = new Set(["1", "true", "yes", "y", "x", "co", "dat", "eligible", "pass", "passed", "checked"])
  if (positiveExact.has(normalized)) return true

  const negativeExact = new Set(["0", "false", "no", "n", "khong", "khongdat", "chuadat", "ineligible", "fail", "failed", "truot"])
  if (negativeExact.has(normalized)) return false

  if (
    normalized.includes("khongdat") ||
    normalized.includes("chuadat") ||
    normalized.includes("ineligible") ||
    normalized.includes("noteligible") ||
    normalized.includes("failed") ||
    normalized.includes("fail") ||
    normalized.includes("truot")
  ) {
    return false
  }

  return (
    normalized.startsWith("dat") ||
    normalized.includes("dudieukien") ||
    normalized.includes("eligible") ||
    normalized.includes("pass") ||
    normalized.includes("totnghiep")
  )
}

function toGraduationStatusLabel(status: unknown): string {
  if (isEligibleGraduationStatus(status)) return "Đạt"

  const normalized = normalizeFilterValue(String(status || ""))
  if (!normalized) return "-"

  return "Không đạt"
}

function XetTotNghiepContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [students, setStudents] = useState<XetTotNghiep[]>([])
  const [classes, setClasses] = useState<ClassApiItem[]>([])
  const [semesters, setSemesters] = useState<SemesterApiItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemesterId, setSelectedSemesterId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [evaluatedMessage, setEvaluatedMessage] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [evaluatedCombos, setEvaluatedCombos] = useState<string[]>([])
  const [eligibleStudentIds, setEligibleStudentIds] = useState<number[]>([])

  const initialLop = searchParams?.get("lop") ?? ""
  const initialKy = searchParams?.get("ky") ?? ""

  const [pendingLopQuery, setPendingLopQuery] = useState(initialLop)
  const [pendingKyQuery, setPendingKyQuery] = useState(initialKy)

  const getSemesterLabel = (semester: SemesterApiItem): string => {
    return (
      semester.semester_name ||
      semester.name ||
      [semester.term, semester.academic_year].filter(Boolean).join(" - ") ||
      `Kỳ #${semester.semester_id ?? semester.id ?? ""}`
    )
  }

  const getClassId = (item: ClassApiItem): number | null => {
    const id = item.class_id ?? item.id
    return Number.isFinite(id) ? Number(id) : null
  }

  const getClassName = (item: ClassApiItem): string => {
    return String(item.class_name || item.name || "")
  }

  const selectedSemesterLabel = useMemo(() => {
    const target = semesters.find((item) => String(item.semester_id ?? item.id ?? "") === selectedSemesterId)
    return target ? getSemesterLabel(target) : ""
  }, [selectedSemesterId, semesters])

  const selectedClassLabel = useMemo(() => {
    const target = classes.find((item) => String(item.class_id ?? item.id ?? "") === selectedClassId)
    return target ? getClassName(target) : ""
  }, [selectedClassId, classes])

  const classOptions = useMemo(() => {
    return classes
      .filter((item) => getClassId(item) !== null && getClassName(item))
      .sort((a, b) => getClassName(a).localeCompare(getClassName(b)))
  }, [classes])

  useEffect(() => {
    if (!pendingLopQuery || !classOptions.length || selectedClassId) return

    const target = classOptions.find((item) =>
      normalizeFilterValue(getClassName(item)) === normalizeFilterValue(pendingLopQuery)
    )

    if (!target) return

    const id = getClassId(target)
    if (id !== null) {
      setSelectedClassId(String(id))
      setPendingLopQuery("")
    }
  }, [pendingLopQuery, classOptions, selectedClassId])

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [classesRes, semestersRes] = await Promise.all([
          api.get<ClassApiItem[]>("/api/v1/classes"),
          api.get<SemesterApiItem[]>("/api/v1/semesters"),
        ])

        setClasses(Array.isArray(classesRes.data) ? classesRes.data : [])
        setSemesters(parseSemestersPayload(semestersRes.data))
      } catch (error: any) {
        setErrorMessage(extractBackendMessage(error, "Không tải được bộ lọc"))
      }
    }

    fetchFilters()
  }, [])



  useEffect(() => {
    if (!pendingKyQuery || !semesters.length || selectedSemesterId) return

    const target = semesters.find((item) =>
      normalizeFilterValue(getSemesterLabel(item)) === normalizeFilterValue(pendingKyQuery)
    )

    if (!target) return

    const id = itemId(target)
    if (id) {
      setSelectedSemesterId(id)
      setPendingKyQuery("")
    }
  }, [pendingKyQuery, semesters, selectedSemesterId])

  const itemId = (item: SemesterApiItem): string => String(item.semester_id ?? item.id ?? "")

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")

    if (selectedClassLabel) params.set("lop", selectedClassLabel)
    else params.delete("lop")

    if (selectedSemesterLabel) params.set("ky", selectedSemesterLabel)
    else params.delete("ky")

    const next = params.toString()
    const current = searchParams?.toString() ?? ""

    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [
    selectedClassLabel,
    selectedSemesterLabel,
    pathname,
    router,
    searchParams,
  ])

  const hasRequiredFilters = Boolean(selectedSemesterId)

  useEffect(() => {
    const fetchEligibility = async () => {
      if (!hasRequiredFilters) {
        setStudents([])
        setEligibleStudentIds([])
        setErrorMessage("")
        setSuccessMessage("")
        setEvaluatedMessage("")
        return
      }

      try {
        setLoading(true)
        setErrorMessage("")
        setSuccessMessage("")
        setEvaluatedMessage("")

        const comboKey = `${selectedSemesterId}`

        const eligibilityResponse = await api.get<any>(
          `/api/v1/graduation-eligibility/semester/${selectedSemesterId}`
        )

        const backendStatus = normalizeFilterValue(String(eligibilityResponse.data?.status || ""))
        let dataSource = eligibilityResponse.data

        // Nếu API trả về đã evaluate thì có thể cần endpoint khác để lấy results
        // Tuy nhiên theo Backend, /semester/ không có trạng thái evaluated hay endpoint results riêng.
        // Chỉ việc đọc trực tiếp dữ liệu.
        
        const studentsFromApi = Array.isArray(dataSource?.students) ? dataSource.students : []
        const mappedStudents: XetTotNghiep[] = studentsFromApi.map((student: any, index: number) => {
          const normalizedStatus = toGraduationStatusLabel(student.graduation_status)

          return {
            id: Number(student.student_id ?? index + 1),
            mssv: String(student.student_id ?? ""),
            name: String(student.full_name || "-"),
            class: String(student.class_name || "-"),
            year: selectedSemesterLabel,
            course: String(student.cohort_name || student.cohort_id || "-"),
            tcbb: formatProgress(student.required_credits_earned, student.min_required_credits_needed),
            tctc: formatProgress(student.elective_credits_earned, student.min_elective_credits_needed),
            totalCredits: formatProgress(student.total_credits_earned, student.min_total_credits_needed),
            gpa: formatProgress(student.gpa, student.min_gpa_needed, 2),
            ccdr: formatProgress(student.sum_certificate_earned, student.sum_certificate),
            program: String(student.program_status || "-"),
            status: normalizedStatus,
          }
        })

        const eligibleIds = mappedStudents
          .filter((student) => student.status === "Đạt")
          .map((student) => Number(student.mssv))
          .filter((id) => Number.isFinite(id) && id > 0)

        setStudents(mappedStudents)
        setEligibleStudentIds(eligibleIds)

        if (backendStatus === "evaluated") {
          setEvaluatedMessage("Kỳ này đã xét tốt nghiệp")
          if (comboKey && !evaluatedCombos.includes(comboKey)) {
            setEvaluatedCombos((prev) => [...prev, comboKey])
          }
        }
      } catch (error: any) {
        setStudents([])
        setEligibleStudentIds([])
        setErrorMessage(extractBackendMessage(error, "Không tải được dữ liệu xét tốt nghiệp"))
      } finally {
        setLoading(false)
      }
    }

    fetchEligibility()
  }, [hasRequiredFilters, selectedSemesterId, selectedSemesterLabel, evaluatedCombos])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.mssv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesYear = selectedSemesterId ? student.year === selectedSemesterLabel : true
    const matchesClass = selectedClassId ? student.class === selectedClassLabel : true
    
    return matchesSearch && matchesYear && matchesClass
  })

  const visibleStudents = filteredStudents
  const currentComboKey = hasRequiredFilters ? `${selectedSemesterId}` : null
  const isCurrentComboEvaluated = currentComboKey ? evaluatedCombos.includes(currentComboKey) : false

  const handleConfirmEvaluate = async () => {
    if (!selectedSemesterId) {
      setErrorMessage("Vui lòng chọn kỳ trước khi xét tốt nghiệp")
      setSuccessMessage("")
      return
    }

    const semesterId = Number(selectedSemesterId)

    if (!Number.isFinite(semesterId)) {
      setErrorMessage("Thông tin kỳ không hợp lệ")
      setSuccessMessage("")
      return
    }

    const studentIdsToSave = eligibleStudentIds

    if (!studentIdsToSave.length) {
      setErrorMessage("Không có sinh viên đủ điều kiện để lưu kết quả xét tốt nghiệp")
      setSuccessMessage("")
      setConfirmOpen(false)
      return
    }

    try {
      setSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      // Cập nhật lại đường dẫn gọi save. Nếu endpoint backend thay đổi theo kỳ, cần dùng /api/v1/graduation-eligibility/semester/${semesterId}/save
      // Tuy nhiên nếu endpoint hiện tại vẫn cần classId, thì bạn cần đảm bảo gọi với API tương ứng.
      // Dựa vào yêu cầu, chúng ta đang xét theo kỳ, nên giả định có endpoint này hoặc ta chỉ thay logic xét.
      // Do yêu cầu "chọn kỳ xong gọi api ... parameter là semester_id", backend có thể chưa đổi API save, nhưng tôi sẽ giả định gọi theo semester.
      const payload = {
        semester_id: semesterId,
        student_ids: studentIdsToSave,
      }

      const saveResponse = await api.post<GraduationSaveResponse>(
        `/api/v1/graduation-eligibility/semester/${semesterId}/save`,
        payload
      )
      const saved = Number(saveResponse.data?.saved ?? 0)
      const skipped = Number(saveResponse.data?.skipped ?? 0)
      const backendMessage = String(saveResponse.data?.message ?? "").trim()

      setSuccessMessage(
        backendMessage || `Đã lưu ${saved} sinh viên, bỏ qua ${skipped} sinh viên.`
      )

      if (currentComboKey && !evaluatedCombos.includes(currentComboKey)) {
        setEvaluatedCombos((prev) => [...prev, currentComboKey])
      }
      setConfirmOpen(false)
    } catch (error: any) {
      setSuccessMessage("")
      setErrorMessage(extractBackendMessage(error, "Không lưu được kết quả xét tốt nghiệp"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Breadcrumb Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">&gt; Xét tốt nghiệp</span>
          </h1>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập MSSV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Kỳ filter */}
            <Select
              value={selectedSemesterId}
              onValueChange={setSelectedSemesterId}
            >
              <SelectTrigger className="h-9 w-[160px] bg-white">
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                {semesters
                  .filter((item) => Number.isFinite(item.semester_id ?? item.id))
                  .map((item) => {
                    const id = itemId(item)
                    return (
                      <SelectItem key={id} value={id}>{getSemesterLabel(item)}</SelectItem>
                    )
                  })}
              </SelectContent>
            </Select>
            {/* Lớp filter - Chỉ dùng filter ở client chứ không trigger API fetch */}
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
            >
              <SelectTrigger className="h-9 w-[140px] bg-white">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((item) => {
                  const id = getClassId(item)
                  if (id === null) return null
                  const name = getClassName(item)

                  return <SelectItem key={id} value={String(id)}>{name}</SelectItem>
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
              disabled={!hasRequiredFilters || visibleStudents.length === 0 || isCurrentComboEvaluated || saving}
              onClick={() => setConfirmOpen(true)}
            >
              <GraduationCap className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Xét tốt nghiệp"}
            </Button>
            <Button
              className="bg-white text-slate-700 border border-slate-200 hover:bg-[#06b6d4] hover:text-black h-9 gap-2 text-sm transition-colors shadow-none"
              style={{ boxShadow: 'none' }}
            >
              <Download className="h-4 w-4" />
              Mẫu
            </Button>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-600 mb-3">Đang tải dữ liệu xét tốt nghiệp...</p>}
        {evaluatedMessage && <p className="text-sm text-amber-700 mb-3">{evaluatedMessage}</p>}
        {successMessage && <p className="text-sm text-emerald-700 mb-3">{successMessage}</p>}
        {errorMessage && <p className="text-sm text-red-600 mb-3">{errorMessage}</p>}

        {/* Table */}
        <XetTotNghiepTab students={visibleStudents} />

        {/* Confirm Dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-[430px]">
            <DialogHeader>
              <DialogTitle>Xét tốt nghiệp</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn <span className="font-semibold">Xét tốt nghiệp</span> cho các sinh viên trong <span className="font-semibold">{selectedSemesterLabel}</span> không?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-[#167FFC] hover:bg-[#1470E3]"
                onClick={handleConfirmEvaluate}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Có"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

export default function XetTotNghiepPage() {
  return (
    <Suspense fallback={null}>
      <XetTotNghiepContent />
    </Suspense>
  )
}
