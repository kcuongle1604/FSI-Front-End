"use client"

import { useState, useMemo } from "react"
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Upload, Download, Search, MoreVertical } from "lucide-react"
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Student } from "../types"
import { classesByCourse } from "../data"

interface StudentTabProps {
  data: Student[]
  onAdd: () => void
  onImport: () => void
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
}

export default function StudentTab({ data, onAdd, onImport, onEdit, onDelete }: StudentTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Get available classes based on selected course
  const availableClasses = useMemo(() => {
    if (!selectedCourse) return []
    return classesByCourse[selectedCourse] || []
  }, [selectedCourse])

  // Reset class selection when course changes
  const handleCourseChange = (value: string) => {
    setSelectedCourse(value)
    setSelectedClass("")
  }

  // Filter logic
  const filteredStudents = useMemo(() => {
    if (!selectedCourse && !selectedClass) return []
    return data.filter(student => {
      const matchesSearch = searchQuery === "" || student.mssv.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCourse = !selectedCourse || student.lop.startsWith(selectedCourse)
      const matchesClass = !selectedClass || student.lop === selectedClass
      return matchesSearch && matchesCourse && matchesClass
    })
  }, [searchQuery, selectedCourse, selectedClass, data])

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const hasFilter = selectedCourse || selectedClass

  // Template download
  const handleDownloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/templates/sinh-vien-template.xlsx'
    link.download = 'Mau_Sinh_Vien.xlsx'
    link.click()
  }

  return (
    <div className="mt-0 flex-1 flex flex-col min-h-0 h-full">
      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3 mb-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo Mã số sinh viên"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Khóa filter */}
          <Select value={selectedCourse} onValueChange={handleCourseChange}>
            <SelectTrigger className="h-9 w-[120px] bg-white">
              <SelectValue placeholder="Khóa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="48K">48K</SelectItem>
              <SelectItem value="49K">49K</SelectItem>
              <SelectItem value="50K">50K</SelectItem>
            </SelectContent>
          </Select>

          {/* Lớp filter */}
          <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!selectedCourse}>
            <SelectTrigger className="h-9 w-[120px] bg-white">
              <SelectValue placeholder="Lớp" />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map(cls => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            Thêm
          </Button>

          <Button 
            variant="outline"
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm border-0"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-4 w-4" />
            Mẫu
          </Button>

          <Button 
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
            onClick={onImport}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Table or Empty State */}
      <div className="flex flex-col flex-1 min-h-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {!hasFilter ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Không có dữ liệu hiển thị.
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="overflow-auto">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-[#F3F8FF]">
                    <TableHead className="px-4 text-center text-sm font-medium text-gray-700" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#F3F8FF', borderBottom: '1px solid #E5E7EB', paddingTop: '10px', paddingBottom: '10px' }}>STT</TableHead>
                    <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#F3F8FF', borderBottom: '1px solid #E5E7EB', paddingTop: '10px', paddingBottom: '10px' }}>MSSV</TableHead>
                    <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#F3F8FF', borderBottom: '1px solid #E5E7EB', paddingTop: '10px', paddingBottom: '10px' }}>Họ và tên</TableHead>
                    <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#F3F8FF', borderBottom: '1px solid #E5E7EB', paddingTop: '10px', paddingBottom: '10px' }}>Lớp</TableHead>
                    <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#F3F8FF', borderBottom: '1px solid #E5E7EB', paddingTop: '10px', paddingBottom: '10px' }}>Ngày sinh</TableHead>
                    <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#F3F8FF', borderBottom: '1px solid #E5E7EB', paddingTop: '10px', paddingBottom: '10px' }}>Ghi chú</TableHead>
                    <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700 w-10" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#F3F8FF', borderBottom: '1px solid #E5E7EB', paddingTop: '10px', paddingBottom: '10px' }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student, idx) => (
                    <TableRow key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-2 text-center text-sm text-gray-600">{String((currentPage - 1) * pageSize + idx + 1).padStart(2, "0")}</TableCell>
                      <TableCell className="py-2 text-sm text-gray-900">{student.mssv}</TableCell>
                      <TableCell className="py-2 text-sm text-gray-900">{student.hoTen}</TableCell>
                      <TableCell className="py-2 text-sm text-gray-600">{student.lop}</TableCell>
                      <TableCell className="py-2 text-sm text-gray-600">{student.ngaySinh}</TableCell>
                      <TableCell className="py-2 text-sm text-gray-600">{student.ghiChu}</TableCell>
                      <TableCell className="py-2 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(student)}>Sửa</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(student)} className="text-red-600">Xóa</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-2 border-t border-gray-200 bg-gray-50 mt-auto">
              <div className="text-sm text-gray-600">Hiển thị {paginatedStudents.length}/{filteredStudents.length} bản ghi</div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <div className="flex items-center gap-1 px-3">
                  <span className="text-sm font-medium text-gray-700">{currentPage}</span>
                  <span className="text-sm text-gray-400">/</span>
                  <span className="text-sm text-gray-600">{totalPages}</span>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}