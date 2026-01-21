"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

type XetTotNghiep = {
  id: number
  mssv: string
  name: string
  class: string
  year: string
  course: string
  tcbb: number
  tctc: number
  totalCredits: number
  gpa: number
  ccdr: string
  program: string
  status: string
}

const students: XetTotNghiep[] = [
  { id: 1, mssv: "221121521260", name: "Nguyễn Văn A", class: "48K05", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 120, tctc: 14, totalCredits: 134, gpa: 3.6, ccdr: "5/5", program: "Hoàn thành", status: "Đạt" },
  { id: 2, mssv: "221121521261", name: "Trần Thị B", class: "48K14.1", year: "Kỳ 2 - 2024 - 2025", course: "49K", tcbb: 120, tctc: 10, totalCredits: 130, gpa: 3.6, ccdr: "5/5", program: "Chưa hoàn thành", status: "Không đạt" },
  { id: 3, mssv: "221121521262", name: "Lê Văn C", class: "48K14.2", year: "Kỳ 1 - 2024 - 2025", course: "50K", tcbb: 120, tctc: 14, totalCredits: 134, gpa: 3.6, ccdr: "5/5", program: "Chưa hoàn thành", status: "Không đạt" },
  { id: 4, mssv: "221121521263", name: "Phạm Thị D", class: "48K05", year: "Kỳ 2 - 2023 - 2024", course: "48K", tcbb: 120, tctc: 14, totalCredits: 134, gpa: 3.6, ccdr: "5/5", program: "Hoàn thành", status: "Đạt" },
  { id: 5, mssv: "221121521264", name: "Ngô Văn E", class: "48K14.1", year: "Kỳ 1 - 2023 - 2024", course: "48K", tcbb: 120, tctc: 14, totalCredits: 134, gpa: 3.6, ccdr: "4/5", program: "Hoàn thành", status: "Không đạt" },
  { id: 6, mssv: "221121521265", name: "Đỗ Thị F", class: "48K05", year: "Kỳ 2 - 2024 - 2025", course: "49K", tcbb: 120, tctc: 14, totalCredits: 134, gpa: 3.6, ccdr: "5/5", program: "Hoàn thành", status: "Đạt" },
  { id: 7, mssv: "221121521266", name: "Vũ Văn G", class: "48K05", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 120, tctc: 14, totalCredits: 134, gpa: 3.6, ccdr: "5/5", program: "Hoàn thành", status: "Đạt" },
  { id: 8, mssv: "221121521267", name: "Bùi Thị H", class: "48K14.2", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 120, tctc: 14, totalCredits: 134, gpa: 3.6, ccdr: "5/5", program: "Hoàn thành", status: "Đạt" },
  { id: 9, mssv: "221121521268", name: "Nguyễn Văn I", class: "48K05", year: "Kỳ 2 - 2024 - 2025", course: "48K", tcbb: 120, tctc: 14, totalCredits: 134, gpa: 3.6, ccdr: "5/5", program: "Hoàn thành", status: "Đạt" },
  { id: 10, mssv: "221121521269", name: "Trần Thị K", class: "48K05", year: "Kỳ 1 - 2024 - 2025", course: "48K", tcbb: 120, tctc: 10, totalCredits: 120, gpa: 3.6, ccdr: "5/5", program: "Chưa hoàn thành", status: "Đạt" },
]

export default function XetTotNghiepPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedClass, setSelectedClass] = useState("all")

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.mssv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesYear = selectedYear === "all" || student.year === selectedYear
    const matchesCourse = selectedCourse === "all" || student.course === selectedCourse
    const matchesClass = selectedClass === "all" || student.class === selectedClass
    
    return matchesSearch && matchesYear && matchesCourse && matchesClass
  })

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Xét tốt nghiệp
          </h1>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập MSSV"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Kỳ filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-9 w-[160px] bg-white">
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kỳ 2/24-25</SelectItem>
                <SelectItem value="Kỳ 2 - 2024 - 2025">Kỳ 2 - 2024 - 2025</SelectItem>
                <SelectItem value="Kỳ 1 - 2024 - 2025">Kỳ 1 - 2024 - 2025</SelectItem>
                <SelectItem value="Kỳ 2 - 2023 - 2024">Kỳ 2 - 2023 - 2024</SelectItem>
              </SelectContent>
            </Select>

            {/* Khóa filter */}
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="h-9 w-[120px] bg-white">
                <SelectValue placeholder="Khóa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Khóa</SelectItem>
                <SelectItem value="48K">48K</SelectItem>
                <SelectItem value="49K">49K</SelectItem>
                <SelectItem value="50K">50K</SelectItem>
              </SelectContent>
            </Select>

            {/* Lớp filter */}
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-9 w-[120px] bg-white">
                <SelectValue placeholder="Lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Lớp</SelectItem>
                <SelectItem value="48K05">48K05</SelectItem>
                <SelectItem value="48K14.1">48K14.1</SelectItem>
                <SelectItem value="48K14.2">48K14.2</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm">
              <Download className="h-4 w-4" />
              Mẫu
            </Button>
          </div>
        </div>

        {/* Table */}
        <XetTotNghiepTab students={filteredStudents} />
      </div>
    </AppLayout>
  )
}
