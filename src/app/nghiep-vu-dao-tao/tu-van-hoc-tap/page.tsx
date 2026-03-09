"use client"

import { useState } from "react"
import { Download, Users } from "lucide-react"
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
import TuVanHocTapTab, { TuVanHocTap } from "./components/TuVanHocTapTab"

const YEAR_LABELS: Record<string, string> = {
  "Kỳ 1 - 2024 - 2025": "Kỳ 1/2024-2025",
  "Kỳ 2 - 2024 - 2025": "Kỳ 2/2024-2025",
  "Kỳ 2 - 2023 - 2024": "Kỳ 2/2023-2024",
}

const students: TuVanHocTap[] = [
  ...Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    mssv: "221121521260",
    name: "Nguyễn Văn A",
    class: "48.21.2",
    year: "Kỳ 2 - 2024 - 2025",
    course: "48K",
    tcbb: 112,
    tctc: 30,
    totalCredits: 120,
    gpa: "3.36",
    ccdr: "",
    program: "Hoàn thành",
    status: "Đạt"
  }))
]

export default function TuVanHocTapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  // Đã bỏ filter Kỳ
  const [selectedCourse, setSelectedCourse] = useState("") // Mặc định: Chọn khóa
  const [selectedClass, setSelectedClass] = useState("") // Mặc định: Chọn lớp
  const [confirmOpen, setConfirmOpen] = useState(false)

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.mssv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    // Nếu chưa chọn khóa/lớp thì luôn true
    const matchesCourse = !selectedCourse || selectedCourse === "all" || student.course === selectedCourse
    const matchesClass = !selectedClass || selectedClass === "all" || student.class === selectedClass
    return matchesSearch && matchesCourse && matchesClass
  })

  const allClasses = Array.from(new Set(students.map((s) => s.class))).sort()
  const classOptions = selectedCourse === "all"
    ? allClasses
    : Array.from(new Set(students.filter((s) => s.course === selectedCourse).map((s) => s.class))).sort()

  // Luôn hiển thị dữ liệu nếu chưa chọn bộ lọc
  const visibleStudents = filteredStudents

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        {/* Breadcrumb Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">&gt; Tư vấn học tập</span>
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
                setSelectedClass("")
              }}
            >
              <SelectTrigger className="h-9 w-[120px] bg-white">
                <SelectValue placeholder="Chọn khóa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="48K">48K</SelectItem>
                <SelectItem value="49K">49K</SelectItem>
                <SelectItem value="50K">50K</SelectItem>
              </SelectContent>
            </Select>
            {/* Lớp filter */}
            <Select
              value={selectedClass}
              onValueChange={(value) => {
                if (selectedCourse === "all" && value !== "all") {
                  const found = students.find((s) => s.class === value)
                  if (found) {
                    setSelectedCourse(found.course)
                  }
                }
                setSelectedClass(value)
              }}
            >
              <SelectTrigger className="h-9 w-[140px] bg-white">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {classOptions.map((lop) => (
                  <SelectItem key={lop} value={lop}>{lop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* Đã xóa button Tư vấn học tập */}
            <Button
              className="bg-white text-slate-700 border border-slate-200 hover:bg-[#06b6d4] hover:text-black h-9 gap-2 text-sm transition-colors shadow-none"
              style={{ boxShadow: 'none' }}
            >
              <Download className="h-4 w-4" />
              Mẫu
            </Button>
          </div>
        </div>
        {/* Table */}
        <TuVanHocTapTab students={selectedCourse && selectedCourse !== "all" && selectedClass && selectedClass !== "all" ? visibleStudents : []} />
      </div>
    </AppLayout>
  )
}
