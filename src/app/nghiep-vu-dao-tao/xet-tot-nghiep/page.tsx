"use client"

import { useEffect, useMemo, useState } from "react"
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
  certificates?: number
  program_status?: string
  graduation_status?: string
  notes?: string | null
}

type GraduationEligibilityResponse = {
  class_info?: GraduationClassInfo
  students?: GraduationStudentItem[]
}

function parseSemestersPayload(
  payload: SemesterApiItem[] | { data?: SemesterApiItem[]; items?: SemesterApiItem[] } | null | undefined
): SemesterApiItem[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function parseCohortsPayload(
  payload: CohortApiItem[] | { data?: CohortApiItem[]; items?: CohortApiItem[] } | null | undefined
): CohortApiItem[] {
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

export default function XetTotNghiepPage() {
  const [students, setStudents] = useState<XetTotNghiep[]>([])
  const [classes, setClasses] = useState<ClassApiItem[]>([])
  const [cohorts, setCohorts] = useState<CohortApiItem[]>([])
  const [mappedCohorts, setMappedCohorts] = useState<CohortApiItem[]>([])
  const [semesters, setSemesters] = useState<SemesterApiItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemesterId, setSelectedSemesterId] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>()
  const [selectedClassId, setSelectedClassId] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [evaluatedCombos, setEvaluatedCombos] = useState<string[]>([])

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

  const getCohortId = (item: CohortApiItem): number | null => {
    const id = item.cohort_id ?? item.id
    return Number.isFinite(id) ? Number(id) : null
  }

  const getCohortLabel = (item: CohortApiItem): string => {
    const id = getCohortId(item)
    return id !== null ? String(id) : ""
  }

  const cohortOptions = useMemo(() => {
    const source = selectedSemesterId ? mappedCohorts : cohorts

    return source
      .filter((item) => getCohortId(item) !== null)
      .sort((a, b) => Number(getCohortId(a)) - Number(getCohortId(b)))
  }, [cohorts, mappedCohorts, selectedSemesterId])

  const classOptions = useMemo(() => {
    const filtered = !selectedCourse
      ? classes
      : classes.filter((item) => String(item.cohort_id ?? "") === selectedCourse)

    return filtered
      .filter((item) => getClassId(item) !== null && getClassName(item))
      .sort((a, b) => getClassName(a).localeCompare(getClassName(b)))
  }, [classes, selectedCourse])

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [classesRes, cohortsRes] = await Promise.all([
          api.get<ClassApiItem[]>("/api/v1/classes"),
          api.get<CohortApiItem[]>("/api/v1/cohorts"),
        ])

        setClasses(Array.isArray(classesRes.data) ? classesRes.data : [])
        const cohortList = Array.isArray(cohortsRes.data) ? cohortsRes.data : []
        setCohorts(cohortList)
        setMappedCohorts(cohortList)
      } catch (error: any) {
        setErrorMessage(extractBackendMessage(error, "Không tải được bộ lọc lớp/khóa"))
      }
    }

    fetchFilters()
  }, [])

  useEffect(() => {
    const fetchSemesters = async () => {
      if (!selectedCourse) {
        setSemesters([])
        setSelectedSemesterId("")
        return
      }

      try {
        const semestersRes = await api.get<SemesterApiItem[] | { data?: SemesterApiItem[]; items?: SemesterApiItem[] }>(
          `/api/v1/cohorts/${selectedCourse}/semesters`
        )
        const semesterList = parseSemestersPayload(semestersRes.data)

        setSemesters(semesterList)

        setSelectedSemesterId((prev) => {
          if (!prev) return prev
          const selectedStillExists = semesterList.some(
            (item) => String(item.semester_id ?? item.id ?? "") === prev
          )
          return selectedStillExists ? prev : ""
        })
      } catch (error: any) {
        setSemesters([])
        setSelectedSemesterId("")
        setErrorMessage(extractBackendMessage(error, "Không tải được danh sách kỳ học"))
      }
    }

    fetchSemesters()
  }, [selectedCourse])

  useEffect(() => {
    const fetchMappedCohorts = async () => {
      if (!selectedSemesterId) {
        setMappedCohorts(cohorts)
        return
      }

      try {
        const mappedRes = await api.get<CohortApiItem[] | { data?: CohortApiItem[]; items?: CohortApiItem[] }>(
          "/api/v1/mapping/cohort-semester-search",
          { params: { semester_id: Number(selectedSemesterId) } }
        )

        const nextMapped = parseCohortsPayload(mappedRes.data)
        setMappedCohorts(nextMapped)

        const selectedCourseStillExists = nextMapped.some(
          (item) => String(item.cohort_id ?? item.id ?? "") === selectedCourse
        )

        if (selectedCourse && !selectedCourseStillExists) {
          setSelectedCourse(undefined)
          setSelectedClassId("")
        }
      } catch (error: any) {
        setMappedCohorts([])
        setErrorMessage(extractBackendMessage(error, "Không tải được danh sách khóa theo kỳ"))
      }
    }

    fetchMappedCohorts()
  }, [selectedSemesterId, cohorts, selectedCourse])

  const hasRequiredFilters = Boolean(selectedSemesterId && selectedClassId)

  useEffect(() => {
    const fetchEligibility = async () => {
      if (!hasRequiredFilters) {
        setStudents([])
        setErrorMessage("")
        return
      }

      try {
        setLoading(true)
        setErrorMessage("")

        const response = await api.get<GraduationEligibilityResponse>(
          `/api/v1/graduation-eligibility/class/${selectedClassId}`,
          { params: { semester_id: Number(selectedSemesterId) } }
        )

        const classInfo = response.data?.class_info || {}
        const studentsFromApi = Array.isArray(response.data?.students) ? response.data.students : []
        const totalCertificates = Number(classInfo.total_certificate ?? 0)

        const mappedStudents: XetTotNghiep[] = studentsFromApi.map((student, index) => {
          const certificates = Number(student.certificates ?? 0)

          return {
            id: Number(student.student_id ?? index + 1),
            mssv: String(student.student_id ?? ""),
            name: String(student.full_name || "-"),
            class: String(student.class_name || classInfo.class_name || "-"),
            year: selectedSemesterLabel,
            course: String(classInfo.cohort_name || classInfo.cohort_id || "-"),
            tcbb: formatProgress(student.required_credits_earned, classInfo.required_credits),
            tctc: formatProgress(student.elective_credits_earned, classInfo.elective_credits),
            totalCredits: formatProgress(student.total_credits_earned, classInfo.total_credits),
            gpa: formatProgress(student.gpa, classInfo.gpa, 2),
            ccdr: totalCertificates > 0 ? `${certificates}/${totalCertificates}` : String(certificates),
            program: String(student.program_status || "-"),
            status: String(student.graduation_status || "-"),
          }
        })

        setStudents(mappedStudents)
      } catch (error: any) {
        setStudents([])
        setErrorMessage(extractBackendMessage(error, "Không tải được dữ liệu xét tốt nghiệp"))
      } finally {
        setLoading(false)
      }
    }

    fetchEligibility()
  }, [hasRequiredFilters, selectedClassId, selectedSemesterId, selectedSemesterLabel])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.mssv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesYear = selectedSemesterId ? student.year === selectedSemesterLabel : true
    const matchesCourse = !selectedCourse || student.course.includes(selectedCourse)
    const matchesClass = selectedClassId ? student.class === selectedClassLabel : true
    
    return matchesSearch && matchesYear && matchesCourse && matchesClass
  })

  const visibleStudents = hasRequiredFilters ? filteredStudents : []
  const currentComboKey = hasRequiredFilters ? `${selectedClassId}__${selectedSemesterId}` : null
  const isCurrentComboEvaluated = currentComboKey ? evaluatedCombos.includes(currentComboKey) : false

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
            {/* Khóa filter */}
            <Select
              value={selectedCourse}
              onValueChange={(value) => {
                setSelectedCourse(value)
                setSelectedSemesterId("")
                setSelectedClassId("")
              }}
            >
              <SelectTrigger className="h-9 w-[120px] bg-white">
                <SelectValue placeholder="Chọn khóa" />
              </SelectTrigger>
              <SelectContent>
                {cohortOptions.map((cohort) => {
                  const id = getCohortId(cohort)
                  if (id === null) return null

                  return (
                    <SelectItem key={id} value={String(id)}>{getCohortLabel(cohort)}</SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {/* Lớp filter */}
            <Select
              value={selectedClassId}
              onValueChange={(value) => {
                if (!selectedCourse) {
                  const found = classes.find((item) => String(item.class_id ?? item.id ?? "") === value)
                  if (found?.cohort_id != null) {
                    setSelectedCourse(String(found.cohort_id))
                  }
                }
                setSelectedClassId(value)
              }}
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
            {/* Kỳ filter */}
            <Select
              value={selectedSemesterId}
              onValueChange={setSelectedSemesterId}
              disabled={!selectedCourse}
            >
              <SelectTrigger className="h-9 w-[160px] bg-white">
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                {semesters
                  .filter((item) => Number.isFinite(item.semester_id ?? item.id))
                  .map((item) => {
                    const id = String(item.semester_id ?? item.id)
                    return (
                      <SelectItem key={id} value={id}>{getSemesterLabel(item)}</SelectItem>
                    )
                  })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
              disabled={!hasRequiredFilters || visibleStudents.length === 0 || isCurrentComboEvaluated}
              onClick={() => setConfirmOpen(true)}
            >
              <GraduationCap className="h-4 w-4" />
              Xét tốt nghiệp
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
                Bạn có chắc chắn muốn <span className="font-semibold">Xét tốt nghiệp</span> cho các sinh viên lớp <span className="font-semibold">{selectedClassLabel}</span> - <span className="font-semibold">{selectedSemesterLabel}</span> không?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-[#167FFC] hover:bg-[#1470E3]"
                onClick={() => {
                  if (currentComboKey && !evaluatedCombos.includes(currentComboKey)) {
                    setEvaluatedCombos((prev) => [...prev, currentComboKey])
                  }
                  setConfirmOpen(false)
                }}
              >
                Có
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
