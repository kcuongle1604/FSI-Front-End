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
  { id: 1, mssv: "221121521260", name: "Nguyễn Văn A", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
  { id: 2, mssv: "221121521261", name: "Trần Thị B", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.25, ccdr: "", program: "", status: "" },
  { id: 3, mssv: "221121521262", name: "Lê Văn C", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 110, tctc: 28, totalCredits: 0, gpa: 3.10, ccdr: "", program: "", status: "" },
  { id: 4, mssv: "221121521263", name: "Phạm Thị D", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 115, tctc: 32, totalCredits: 0, gpa: 3.50, ccdr: "", program: "", status: "" },
  { id: 5, mssv: "221121521264", name: "Ngô Văn E", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.00, ccdr: "", program: "", status: "" },
  { id: 6, mssv: "221121521265", name: "Đỗ Thị F", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 113, tctc: 29, totalCredits: 0, gpa: 3.20, ccdr: "", program: "", status: "" },
  { id: 7, mssv: "221121521266", name: "Vũ Văn G", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 114, tctc: 31, totalCredits: 0, gpa: 3.18, ccdr: "", program: "", status: "" },
  { id: 8, mssv: "221121521267", name: "Bùi Thị H", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
  { id: 9, mssv: "221121521268", name: "Nguyễn Văn I", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
  { id: 10, mssv: "221121521269", name: "Trần Thị K", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
  { id: 11, mssv: "221121521270", name: "Phạm Văn L", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
  { id: 12, mssv: "221121521271", name: "Nguyễn Thị M", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
  { id: 13, mssv: "221121521272", name: "Trần Văn N", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
  { id: 14, mssv: "221121521273", name: "Lê Thị O", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
  { id: 15, mssv: "221121521274", name: "Bùi Văn P", class: "48.21.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 112, tctc: 30, totalCredits: 0, gpa: 3.36, ccdr: "", program: "", status: "" },
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
            <Button className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm">
              <Users className="h-4 w-4" />
              Tư vấn học tập
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
        {/* Table */}
        <TuVanHocTapTab students={visibleStudents} />
      </div>
    </AppLayout>
  )
}
