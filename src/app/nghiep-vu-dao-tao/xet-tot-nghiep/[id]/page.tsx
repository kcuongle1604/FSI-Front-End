"use client"

import { useState } from "react"
import { ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import AppLayout from "@/components/AppLayout"

type StudentDetail = {
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
  major: string
}

type CourseData = {
  id: number
  code: string
  name: string
  credits: number
  type: string
  status: string
}

type CertificateData = {
  id: number
  name: string
  status: boolean
  note: string
}

// Sample data - in real app this would come from API
const students: Record<string, StudentDetail> = {
  "221121521260": {
    id: 1,
    mssv: "221121521260",
    name: "Nguyễn Văn A",
    class: "48K21.2",
    year: "Kỳ 2 - 2024 - 2025",
    course: "48K",
    tcbb: 120,
    tctc: 14,
    totalCredits: 134,
    gpa: 3.6,
    ccdr: "5/5",
    program: "Hoàn thành",
    status: "Đạt",
    major: "Quản trị hệ thống thông tin"
  }
}

const courseData: CourseData[] = [
  { id: 1, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 2, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Tự chọn", status: "Đã học (Đạt)" },
  { id: 3, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Tự chọn", status: "Chưa học" },
  { id: 4, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Chưa học" },
  { id: 5, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 6, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 7, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 8, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 9, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Đã học (Chưa đạt)" },
  { id: 10, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Đã học (Chưa đạt)" },
]

const certificateData: CertificateData[] = [
  { id: 1, name: "Chứng chỉ tin học", status: true, note: "Được miễn" },
  { id: 2, name: "Chứng chỉ tiếng anh", status: false, note: "" },
  { id: 3, name: "Chứng chỉ quốc phòng", status: true, note: "" },
  { id: 4, name: "Chứng chỉ tin học", status: true, note: "" },
  { id: 5, name: "Chứng chỉ tin học", status: true, note: "" },
]

export default function XetTotNghiepDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const student = students["221121521260"] // In real app, fetch by params.id
  const [activeTab, setActiveTab] = useState("chuong-trinh")

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header with Back Button */}
        <div className="mb-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Xét tốt nghiệp
          </h1>
        </div>

        {/* Detail Card */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
          
          {/* Student Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700 min-w-fit">Họ và Tên:</span>
                  <span className="text-gray-900">{student.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700 min-w-fit">MSSV:</span>
                  <span className="text-gray-900">{student.mssv}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700 min-w-fit">Lớp:</span>
                  <span className="text-gray-900">{student.class}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700 min-w-fit">Chuyên ngành:</span>
                  <span className="text-gray-900">{student.major}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700 min-w-fit">GPA:</span>
                  <span className="text-gray-900">{student.gpa}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700 min-w-fit">Tổng số tín chỉ đã học:</span>
                  <span className="text-gray-900">{student.totalCredits}</span>
                </div>
                <div className="flex gap-4">
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <span className="font-medium text-gray-700">Tín chỉ bắt buộc:</span>
                      <span className="text-gray-900">{student.tcbb}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-medium text-gray-700">Tín chỉ tự chọn:</span>
                      <span className="text-gray-900">{student.tctc}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 border-b border-gray-200">
              <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start border-b-2 border-gray-200">
                <TabsTrigger 
                  value="chuong-trinh"
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 font-semibold"
                >
                  Chương trình học
                </TabsTrigger>
                <TabsTrigger 
                  value="chung-chi"
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 font-semibold"
                >
                  Chứng chỉ đầu ra
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Chương trình học Tab */}
            <TabsContent value="chuong-trinh" className="flex-1 overflow-auto px-6 py-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100 border-b border-gray-200">
                      <TableHead className="h-10 px-4 text-center text-sm font-semibold">STT</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-semibold">MÃ HỌC PHẦN</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-semibold">TÊN HỌC PHẦN</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-semibold">SỐ TC</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-semibold">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                              PHÂN LOẠI
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuCheckboxItem checked>Tất cả</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Bắt buộc</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Tự chọn</DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-semibold">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                              TRẠNG THÁI
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuCheckboxItem checked>Tất cả</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Đã học (Đạt)</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Chưa học</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Đã học (Chưa đạt)</DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseData.map((course, index) => (
                      <TableRow key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="h-12 px-4 text-center text-sm text-gray-600">
                          {String(index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{course.code}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{course.name}</TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{course.credits}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">
                          <span className={course.type === "Tự chọn" ? "text-blue-600" : "text-gray-700"}>
                            {course.type}
                          </span>
                        </TableCell>
                        <TableCell className="h-12 px-4 text-sm">
                          <span className={course.status.includes("Đạt") ? "text-green-600 font-medium" : course.status === "Chưa học" ? "text-gray-600" : "text-red-600 font-medium"}>
                            {course.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">Hiển thị 10/40 dòng</div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 text-sm font-medium">1 / 4</div>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Chứng chỉ đầu ra Tab */}
            <TabsContent value="chung-chi" className="flex-1 overflow-auto px-6 py-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100 border-b border-gray-200">
                      <TableHead className="h-10 px-4 text-center text-sm font-semibold">STT</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-semibold">LOẠI CHỨNG CHỈ</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-semibold">TRẠNG THÁI</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-semibold">GHI CHÚ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificateData.map((cert, index) => (
                      <TableRow key={cert.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="h-12 px-4 text-center text-sm text-gray-600">
                          {String(index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{cert.name}</TableCell>
                        <TableCell className="h-12 px-4 text-center">
                          <Checkbox checked={cert.status} disabled />
                        </TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{cert.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">Hiển thị 05/05 dòng</div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 text-sm font-medium">1 / 1</div>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}
