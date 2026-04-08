"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import type { ScoreCell, StudentScore } from "../types"
import { deleteScore, getProgramSubjectsByClass } from "../score.api"
import type { StudentProgramScoreSubject } from "../score.api"

interface DeleteScoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: StudentScore | null
  courseOptions: string[]
  classId?: number | null
  onDeleteSuccess?: (payload?: {
    studentId: number
    subjectId: string
    subjectLabel: string
    matchedScoreKey?: string
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

export default function DeleteScoreDialog({
  open,
  onOpenChange,
  student,
  courseOptions,
  classId,
  onDeleteSuccess,
}: DeleteScoreDialogProps) {
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [courseSearch, setCourseSearch] = useState("")
  const [showCourseLookup, setShowCourseLookup] = useState(false)
  const [formError, setFormError] = useState("")
  const [deleting, setDeleting] = useState(false)

  const selectedCourseLabel =
    subjectOptions.find((option) => option.id === selectedCourse)?.label || selectedCourse

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

  useEffect(() => {
    const fetchSubjectsByClass = async () => {
      if (!open || !student || !classId) {
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
  }, [open, student, classId, courseOptions])

  useEffect(() => {
    if (!open) return

    setSelectedCourse("")
    setCourseSearch("")
    setShowCourseLookup(false)
    setFormError("")
    setDeleting(false)
  }, [open, student])

  const handleDelete = async () => {
    if (!student) {
      setFormError("Không xác định được sinh viên cần xóa điểm.")
      return
    }

    if (!selectedCourse) {
      setFormError("Vui lòng chọn học phần cần xóa.")
      return
    }

    const selectedSubjectOption = subjectOptions.find((option) => option.id === selectedCourse)
    if (!selectedSubjectOption) {
      setFormError("Không xác định được học phần đã chọn.")
      return
    }

    try {
      setDeleting(true)
      setFormError("")

      await deleteScore({
        student_id: student.student_id,
        subject_id: selectedCourse,
      })

      const matchedEntry = findScoreEntryBySubjectOption(student.scores || {}, selectedSubjectOption)
      onOpenChange(false)
      onDeleteSuccess?.({
        studentId: student.student_id,
        subjectId: selectedCourse,
        subjectLabel: selectedSubjectOption.label,
        matchedScoreKey: matchedEntry?.key,
      })
    } catch (error: any) {
      setFormError(extractBackendMessage(error, "Không thể xóa điểm. Vui lòng thử lại."))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Xóa dữ liệu điểm</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>
              Sinh viên <span className="text-red-500">*</span>
            </Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                {student ? `${student.student_id} - ${student.full_name}` : "Chưa chọn sinh viên"}
              </span>
            </div>
          </div>

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
                  disabled={!student || loadingSubjects}
                  onChange={(e) => {
                    const value = e.target.value
                    setCourseSearch(value)
                    setShowCourseLookup(value.trim().length > 0)
                  }}
                  onClick={() => {
                    if (
                      !loadingSubjects &&
                      student &&
                      (courseSearch.trim().length > 0 || filteredCourseOptions.length > 0)
                    ) {
                      setShowCourseLookup(true)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (!loadingSubjects && student && (e.currentTarget.value || "").trim().length > 0) {
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
                {!student
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

          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={handleDelete}
            disabled={deleting}
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
