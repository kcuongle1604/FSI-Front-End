"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import type { ScoreCell, StudentScore } from "../types"
import { createScore, getProgramSubjectsByClass, getSemesters, getSemestersByCohort, updateScore } from "../score.api"
import type { Semester, StudentProgramScoreSubject } from "../score.api"

interface ScoreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: StudentScore | null
  studentOptions: StudentScore[]
  courseOptions: string[]
  classId?: number | null
  classCohortId?: number | null
  onSaveSuccess?: (payload?: {
    studentId: number
    subjectId: string
    subjectLabel: string
    matchedScoreKey?: string
    score4: string
  }) => void
}

interface SubjectOption {
  id: string
  label: string
  aliases: string[]
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

export default function ScoreFormDialog({
  open,
  onOpenChange,
  student,
  studentOptions,
  courseOptions,
  classId,
  classCohortId,
  onSaveSuccess,
}: ScoreFormDialogProps) {
  const isEdit = !!student

  const [score, setScore] = useState("")
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemesterId, setSelectedSemesterId] = useState("")
  const [loadingSemesters, setLoadingSemesters] = useState(false)
  const [derivedCohortId, setDerivedCohortId] = useState<number | null>(null)

  const [selectedStudent, setSelectedStudent] = useState<StudentScore | null>(null)
  const [studentSearch, setStudentSearch] = useState("")
  const [showStudentLookup, setShowStudentLookup] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState("")
  const [courseSearch, setCourseSearch] = useState("")
  const [showCourseLookup, setShowCourseLookup] = useState(false)
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [autoFilledScore, setAutoFilledScore] = useState(false)
  const lastSemesterFetchKeyRef = useRef("")

  const selectedCourseLabel =
    subjectOptions.find((option) => option.id === selectedCourse)?.label || selectedCourse

  const filteredStudentOptions = studentOptions.filter((s) => {
    const keyword = studentSearch.trim().toLowerCase()
    if (!keyword) return true
    return `${String(s.student_id)} ${s.full_name}`.toLowerCase().includes(keyword)
  })

  const filteredCourseOptions = subjectOptions.filter((option) => {
    const keyword = courseSearch.trim().toLowerCase()
    if (!keyword) return true
    return [option.label, ...option.aliases].some((item) => item.toLowerCase().includes(keyword))
  })

  const normalizeSubjectOptions = (rawList: StudentProgramScoreSubject[]): SubjectOption[] => {
    const mapped = rawList
      .map((item) => {
        const rawId = item.subject_id ?? item.id
        const subjectName = typeof item.subject_name === "string" ? item.subject_name.trim() : ""
        const name = typeof item.name === "string" ? item.name.trim() : ""
        const code = typeof item.code === "string" ? item.code.trim() : ""
        const rawLabel = subjectName || name || code
        const id = rawId === undefined || rawId === null ? "" : String(rawId).trim()
        const label = (typeof rawLabel === "string" ? rawLabel : String(rawLabel || "")).trim()
        if (!id || !label) return null

        const aliases = [subjectName, name, code, id]
          .map((value) => value.trim())
          .filter((value) => value.length > 0)

        return { id, label, aliases }
      })
      .filter((item): item is SubjectOption => item !== null)

    const unique = new Map<string, SubjectOption>()
    mapped.forEach((item) => {
      if (!unique.has(item.id)) {
        unique.set(item.id, item)
      }
    })

    return Array.from(unique.values())
  }

  const normalizeText = (value: string): string => {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
  }

  const findScoreEntryBySubjectOption = (
    scoresMap: Record<string, ScoreCell>,
    subjectOption: SubjectOption
  ): { key: string; cell: ScoreCell } | null => {
    const scoreEntries = Object.entries(scoresMap).map(([key, value]) => ({
      key,
      value,
      normalizedKey: normalizeText(key),
    }))

    const candidates = [subjectOption.label, ...subjectOption.aliases]
      .map((item) => normalizeText(item))
      .filter((item) => item.length > 0)

    for (const candidate of candidates) {
      const exact = scoreEntries.find((entry) => entry.normalizedKey === candidate)
      if (exact) return { key: exact.key, cell: exact.value as ScoreCell }
    }

    for (const candidate of candidates) {
      if (candidate.length < 4) continue
      const partial = scoreEntries.find(
        (entry) => entry.normalizedKey.includes(candidate) || candidate.includes(entry.normalizedKey)
      )
      if (partial) return { key: partial.key, cell: partial.value as ScoreCell }
    }

    return null
  }

  const getScoreValueFromCell = (cell: ScoreCell | undefined): string | null => {
    if (cell === null || cell === undefined) return null
    if (typeof cell === "number" || typeof cell === "string") return String(cell)

    const rawValue = cell.score_4 ?? cell.score ?? cell.value
    if (rawValue === null || rawValue === undefined) return null
    return String(rawValue)
  }


  const getCurrentStudentScoreMap = (): Record<string, ScoreCell> => {
    if (!isEdit) return {}
    return selectedStudent?.scores || student?.scores || {}
  }

  const getSemesterLabel = (semester: Semester): string => {
    return (
      semester.semester_name ||
      semester.name ||
      [semester.term, semester.academic_year].filter(Boolean).join(" - ") ||
      semester.code ||
      `Kỳ #${semester.id ?? semester.semester_id ?? "N/A"}`
    )
  }

  const getSemesterId = (semester: Semester): number | null => {
    const rawId = semester.id ?? semester.semester_id
    if (typeof rawId !== "number" || Number.isNaN(rawId)) {
      return null
    }
    return rawId
  }

  const getCohortIdFromClassName = (className: string): number | null => {
    const normalized = className.trim()
    if (!normalized) return null

    const matched = normalized.match(/\d{2}/)
    if (!matched) return null

    const cohortId = Number(matched[0])
    return Number.isFinite(cohortId) ? cohortId : null
  }

  const toFiniteNumber = (value: unknown): number | null => {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : null
  }

  useEffect(() => {
    const fetchKey = `${open}|${selectedStudent?.student_id ?? ""}|${classCohortId ?? ""}`
    if (lastSemesterFetchKeyRef.current === fetchKey) {
      return
    }
    lastSemesterFetchKeyRef.current = fetchKey

    const fetchSemestersByStudent = async () => {
      if (!open || !selectedStudent) {
        setSemesters([])
        setSelectedSemesterId("")
        setDerivedCohortId(null)
        return
      }

      const cohortId =
        toFiniteNumber(classCohortId) ?? getCohortIdFromClassName(selectedStudent.class_name || "")
      setDerivedCohortId(cohortId)
      setSelectedSemesterId("")

      try {
        setLoadingSemesters(true)
        const res = cohortId ? await getSemestersByCohort(cohortId) : await getSemesters({ skip: 0, limit: 100 })
        const payload = res.data as Semester[] | { data?: Semester[]; items?: Semester[] }
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : []

        const normalizedSemesters = list.filter((semester) => getSemesterId(semester) !== null)
        setSemesters(normalizedSemesters)
        if (isEdit && normalizedSemesters.length > 0) {
          const firstSemesterId = getSemesterId(normalizedSemesters[0])
          if (firstSemesterId !== null) {
            setSelectedSemesterId(String(firstSemesterId))
          }
        }
        if (normalizedSemesters.length === 0) {
          setFormError(
            cohortId ? `Không có kỳ học cho khóa ${cohortId}.` : "Không có kỳ học khả dụng."
          )
        } else {
          setFormError("")
        }
      } catch (error: any) {
        setSemesters([])
        setFormError(extractBackendMessage(error, "Không tải được danh sách kỳ học theo khóa."))
      } finally {
        setLoadingSemesters(false)
      }
    }

    fetchSemestersByStudent()
  })

  useEffect(() => {
    const fetchSubjectsByClass = async () => {
      if (!open || !selectedStudent || !classId) {
        setSubjectOptions([])
        setSelectedCourse("")
        return
      }

      setSelectedCourse("")
      setCourseSearch("")
      setShowCourseLookup(false)

      try {
        setLoadingSubjects(true)
        const res = await getProgramSubjectsByClass(classId)
        const payload = res.data as StudentProgramScoreSubject[] | { data?: StudentProgramScoreSubject[]; items?: StudentProgramScoreSubject[] }
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : []

        const normalized = normalizeSubjectOptions(list)
        setSubjectOptions(normalized)
        if (normalized.length === 0) {
          setFormError("Không có học phần trong chương trình của lớp đã chọn.")
        } else {
          setFormError("")
        }
      } catch (error: any) {
        const fallback = courseOptions
          .filter((name) => typeof name === "string" && name.trim().length > 0)
          .map((name) => ({ id: name, label: name, aliases: [name] }))
        setSubjectOptions(fallback)
        setFormError(
          extractBackendMessage(error, "Không tải được danh sách học phần theo lớp. Đang dùng danh sách dự phòng.")
        )
      } finally {
        setLoadingSubjects(false)
      }
    }

    fetchSubjectsByClass()
  }, [open, selectedStudent, classId, courseOptions])

  useEffect(() => {
    if (!isEdit || !selectedCourse) {
      setAutoFilledScore(false)
      return
    }

    const selectedSubjectOption = subjectOptions.find((option) => option.id === selectedCourse)
    if (!selectedSubjectOption) {
      setAutoFilledScore(false)
      return
    }

    const matchedEntry = findScoreEntryBySubjectOption(getCurrentStudentScoreMap(), selectedSubjectOption)
    const existingScoreCell = matchedEntry?.cell
    const existingScore = getScoreValueFromCell(existingScoreCell)
    if (existingScore === null || existingScore === undefined) {
      setScore("")
      setAutoFilledScore(false)
      return
    }

    setScore(existingScore)
    setAutoFilledScore(true)
  }, [isEdit, selectedCourse, subjectOptions, selectedStudent, student])

  useEffect(() => {
    if (student) {
      setSelectedStudent(student)
    } else {
      setSelectedStudent(null)
    }

    setStudentSearch("")
    setShowStudentLookup(false)

    setSelectedCourse("")
    setCourseSearch("")
    setShowCourseLookup(false)
    setSubjectOptions([])
    setLoadingSubjects(false)
    setAutoFilledScore(false)

    setScore("")
    setSelectedSemesterId("")
    setDerivedCohortId(null)
    setFormError("")
    setSaving(false)
  }, [student, open])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSave = async () => {
    if (!isEdit && !selectedSemesterId) {
      setFormError("Vui lòng chọn kỳ học.")
      return
    }
    if (!selectedStudent) {
      setFormError("Vui lòng chọn sinh viên.")
      return
    }
    if (!selectedCourse) {
      setFormError("Vui lòng chọn học phần.")
      return
    }

    const normalizedScore = score.trim()
    if (!normalizedScore) {
      setFormError("Vui lòng nhập điểm.")
      return
    }

    const isSpecialScore = normalizedScore.toUpperCase() === "M"
    const numericScore = Number(normalizedScore)
    if (!isSpecialScore && (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 4)) {
      setFormError("Điểm không hợp lệ. Vui lòng nhập trong khoảng 0 đến 4.")
      return
    }

    const selectedSubjectOption = subjectOptions.find((option) => option.id === selectedCourse)
    if (!selectedSubjectOption) {
      setFormError("Không xác định được học phần đã chọn.")
      return
    }

    try {
      setSaving(true)
      setFormError("")

      if (isEdit) {
        await updateScore({
          student_id: selectedStudent.student_id,
          subject_id: selectedCourse,
          score_4: normalizedScore,
        })
      } else {
        const fallbackSemesterId = semesters.length > 0 ? getSemesterId(semesters[0]) : null
        const semesterId = Number(selectedSemesterId || (fallbackSemesterId !== null ? String(fallbackSemesterId) : ""))
        if (!Number.isFinite(semesterId)) {
          setFormError("Không xác định được kỳ học để lưu điểm.")
          return
        }

        await createScore({
          semester_id: semesterId,
          student_id: selectedStudent.student_id,
          subject_id: selectedCourse,
          score_4: normalizedScore,
        })
      }

      onOpenChange(false)
      const matchedEntry = isEdit
        ? findScoreEntryBySubjectOption(getCurrentStudentScoreMap(), selectedSubjectOption)
        : null
      onSaveSuccess?.({
        studentId: selectedStudent.student_id,
        subjectId: selectedCourse,
        subjectLabel: selectedSubjectOption.label,
        matchedScoreKey: matchedEntry?.key,
        score4: normalizedScore,
      })
    } catch (error: any) {
      setFormError(extractBackendMessage(error, "Không thể lưu điểm. Vui lòng thử lại."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa thông tin điểm" : "Thêm mới thông tin điểm"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2 relative">
            <Label>
              Sinh viên <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              {!selectedStudent && (
                <Input
                  placeholder="Nhập MSSV/Họ và tên"
                  value={studentSearch}
                  onChange={(e) => {
                    const value = e.target.value
                    setStudentSearch(value)
                    setShowStudentLookup(value.trim().length > 0)
                  }}
                  onClick={() => {
                    if (studentSearch.trim().length > 0 || filteredStudentOptions.length > 0) {
                      setShowStudentLookup(true)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if ((e.currentTarget.value || "").trim().length > 0) {
                        setShowStudentLookup(true)
                      }
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      if (!selectedStudent) {
                        setStudentSearch("")
                      }
                      setShowStudentLookup(false)
                    }, 120)
                  }
                  autoComplete="off"
                  className="pr-9"
                />
              )}
              {selectedStudent && (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {`${selectedStudent.student_id} - ${selectedStudent.full_name}`}
                  </span>
                </div>
              )}
            </div>
            {showStudentLookup && filteredStudentOptions.length > 0 && (
              <div className="absolute top-full left-0 z-30 mt-1 w-full bg-white border border-gray-300 rounded-md shadow max-h-52 overflow-auto">
                  {filteredStudentOptions.map((s, index) => (
                  <button
                    type="button"
                      key={`${s.student_id}-${index}`}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedStudent(s)
                      setShowStudentLookup(false)
                      setStudentSearch("")
                    }}
                  >
                      {`${s.student_id} - ${s.full_name}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isEdit && (
            <div className="grid gap-2">
              <Label>
                Kỳ học <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId} disabled={!selectedStudent || loadingSemesters}>
                <SelectTrigger className="bg-white">
                  <SelectValue
                    placeholder={
                      !selectedStudent
                        ? "Chọn sinh viên trước"
                        : loadingSemesters
                          ? "Đang tải kỳ học theo khóa..."
                          : !derivedCohortId
                            ? "Chọn kỳ học"
                            : `Chọn kỳ học của khóa ${derivedCohortId}`
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => {
                    const semesterId = getSemesterId(semester)
                    if (semesterId === null) return null

                    return (
                      <SelectItem key={semesterId} value={String(semesterId)}>
                        {getSemesterLabel(semester)}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2 relative">
            <Label>
              Học phần <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              {!selectedCourse && (
                <Input
                  placeholder="Nhập tên học phần"
                  value={courseSearch}
                  disabled={!selectedStudent || loadingSubjects}
                  onChange={(e) => {
                    const value = e.target.value
                    setCourseSearch(value)
                    setShowCourseLookup(value.trim().length > 0)
                  }}
                  onClick={() => {
                    if (
                      !loadingSubjects &&
                      selectedStudent &&
                      (courseSearch.trim().length > 0 || filteredCourseOptions.length > 0)
                    ) {
                      setShowCourseLookup(true)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (!loadingSubjects && selectedStudent && (e.currentTarget.value || "").trim().length > 0) {
                        setShowCourseLookup(true)
                      }
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      if (!selectedCourse) {
                        setCourseSearch("")
                      }
                      setShowCourseLookup(false)
                    }, 120)
                  }
                  autoComplete="off"
                  className="pr-9"
                />
              )}
              {selectedCourse && (
                <div className="w-full pr-9 px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {selectedCourseLabel}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse("")
                        setCourseSearch("")
                        setShowCourseLookup(false)
                      }}
                      className="hover:text-blue-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>
              )}
            </div>
            {showCourseLookup && filteredCourseOptions.length > 0 && (
              <div className="absolute top-full left-0 z-30 mt-1 w-full bg-white border border-gray-300 rounded-md shadow max-h-52 overflow-auto">
                {filteredCourseOptions.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedCourse(option.id)
                      setShowCourseLookup(false)
                      setCourseSearch("")
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            {!selectedCourse && (
              <p className="text-xs text-gray-500">
                {!selectedStudent
                  ? "Chọn sinh viên trước để tải học phần."
                  : !classId
                    ? "Chọn lớp trước để tải học phần."
                  : loadingSubjects
                    ? "Đang tải học phần theo lớp..."
                    : subjectOptions.length === 0
                      ? "Không có học phần khả dụng."
                      : `Có ${subjectOptions.length} học phần khả dụng.`}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>
              Nhập điểm (thang điểm 4.0) <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập điểm"
              value={score}
              onChange={(e) => {
                setScore(e.target.value)
                setAutoFilledScore(false)
              }}
            />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={handleSave} disabled={saving}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
