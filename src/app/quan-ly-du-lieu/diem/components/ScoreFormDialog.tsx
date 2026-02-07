"use client"

import { useEffect, useState } from "react"
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
import { Search, X } from "lucide-react"
import type { Student } from "../sinh-vien/types"

interface ScoreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
  studentOptions: Student[]
  courseOptions: string[]
}

export default function ScoreFormDialog({
  open,
  onOpenChange,
  student,
  studentOptions,
  courseOptions,
}: ScoreFormDialogProps) {
  const isEdit = !!student

  const [score, setScore] = useState("")

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentSearch, setStudentSearch] = useState("")
  const [showStudentLookup, setShowStudentLookup] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState("")
  const [courseSearch, setCourseSearch] = useState("")
  const [showCourseLookup, setShowCourseLookup] = useState(false)

  const filteredStudentOptions = studentOptions.filter((s) => {
    const keyword = studentSearch.trim().toLowerCase()
    if (!keyword) return true
    return `${String(s.mssv)} ${s.hoTen}`.toLowerCase().includes(keyword)
  })

  const filteredCourseOptions = courseOptions.filter((c) => {
    const keyword = courseSearch.trim().toLowerCase()
    if (!keyword) return true
    return c.toLowerCase().includes(keyword)
  })

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

    setScore("")
  }, [student, open])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSave = () => {
    // Hiện tại chỉ đóng dialog, chưa gọi API lưu điểm
    onOpenChange(false)
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
                <div className="w-full pr-9 px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {`${selectedStudent.mssv} - ${selectedStudent.hoTen}`}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(null)
                        setStudentSearch("")
                        setShowStudentLookup(false)
                      }}
                      className="hover:text-blue-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>
              )}
            </div>
            {showStudentLookup && filteredStudentOptions.length > 0 && (
              <div className="absolute top-full left-0 z-30 mt-1 w-full bg-white border border-gray-300 rounded-md shadow max-h-52 overflow-auto">
                {filteredStudentOptions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedStudent(s)
                      setShowStudentLookup(false)
                      setStudentSearch("")
                    }}
                  >
                    {`${s.mssv} - ${s.hoTen}`}
                  </button>
                ))}
              </div>
            )}
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
                  onChange={(e) => {
                    const value = e.target.value
                    setCourseSearch(value)
                    setShowCourseLookup(value.trim().length > 0)
                  }}
                  onClick={() => {
                    if (courseSearch.trim().length > 0 || filteredCourseOptions.length > 0) {
                      setShowCourseLookup(true)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if ((e.currentTarget.value || "").trim().length > 0) {
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
                    {selectedCourse}
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
                {filteredCourseOptions.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedCourse(c)
                      setShowCourseLookup(false)
                      setCourseSearch("")
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>
              Nhập điểm (thang điểm 4.0) <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập điểm"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={handleSave}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
