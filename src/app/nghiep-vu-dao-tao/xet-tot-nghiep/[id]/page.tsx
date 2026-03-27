"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import AppLayout from "@/components/AppLayout"
import { api } from "@/lib/api"

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

type AcademicSummaryResponse = {
  student_id: number
  full_name: string
  class_name: string
  major_name: string
  gpa: number
  total_credits: number
  required_credits: number
  elective_credits: number
}

const courseData: CourseData[] = [
  { id: 1, code: "MIS1600340", name: "Hệ thống thông tin quản lý", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 2, code: "MIS1600341", name: "Cơ sở dữ liệu", credits: 3, type: "Tự chọn", status: "Đã học (Đạt)" },
  { id: 3, code: "MIS1600342", name: "Lập trình nâng cao", credits: 3, type: "Tự chọn", status: "Chưa học" },
  { id: 4, code: "MIS1600343", name: "Mạng máy tính", credits: 3, type: "Bắt buộc", status: "Chưa học" },
  { id: 5, code: "MIS1600344", name: "Phân tích thiết kế Hệ thống", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 6, code: "MIS1600345", name: "Kiến trúc máy tính", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 7, code: "MIS1600346", name: "Hệ điều hành", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 8, code: "MIS1600347", name: "Kỹ thuật phần mềm", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 9, code: "MIS1600348", name: "Thiết kế web", credits: 3, type: "Tự chọn", status: "Đã học (Chưa đạt)" },
  { id: 10, code: "MIS1600349", name: "Trí tuệ nhân tạo cơ bản", credits: 3, type: "Tự chọn", status: "Đã học (Chưa đạt)" },
  { id: 11, code: "MIS1600350", name: "Thiết kế giao diện người dùng", credits: 2, type: "Tự chọn", status: "Đã học (Đạt)" },
  { id: 12, code: "MIS1600351", name: "Bảo mật thông tin", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 13, code: "MIS1600352", name: "Toán rời rạc", credits: 3, type: "Bắt buộc", status: "Chưa học" },
  { id: 14, code: "MIS1600353", name: "Phân tích dữ liệu", credits: 3, type: "Tự chọn", status: "Đã học (Đạt)" },
  { id: 15, code: "MIS1600354", name: "Công nghệ đám mây", credits: 3, type: "Tự chọn", status: "Đã học (Đạt)" },
  { id: 16, code: "MIS1600355", name: "Quản trị hệ thống cơ sở dữ liệu", credits: 3, type: "Bắt buộc", status: "Đã học (Đạt)" },
  { id: 17, code: "MIS1600356", name: "Kiểm thử phần mềm", credits: 2, type: "Tự chọn", status: "Chưa học" },
  { id: 18, code: "MIS1600357", name: "Phát triển ứng dụng di động", credits: 3, type: "Tự chọn", status: "Đã học (Đạt)" },
  { id: 19, code: "MIS1600358", name: "Khung pháp lý CNTT", credits: 2, type: "Tự chọn", status: "Đã học (Chưa đạt)" },
  { id: 20, code: "MIS1600359", name: "Luận văn/Đồ án tốt nghiệp", credits: 6, type: "Bắt buộc", status: "Chưa học" },
]

const certificateData: CertificateData[] = [
  { id: 1, name: "Chứng chỉ tin học", status: true, note: "Được miễn" },
  { id: 2, name: "Chứng chỉ tiếng anh", status: false, note: "" },
  { id: 3, name: "Chứng chỉ quốc phòng", status: true, note: "" },
  { id: 4, name: "Chứng chỉ tin học", status: true, note: "" },
  { id: 5, name: "Chứng chỉ tin học", status: true, note: "" },
]

export default function XetTotNghiepDetailPage() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const studentIdParam = useMemo(() => {
    if (typeof params?.id === "string") return params.id
    if (Array.isArray(params?.id) && typeof params.id[0] === "string") return params.id[0]
    return ""
  }, [params])
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(true)
  const [studentError, setStudentError] = useState("")
  const [activeTab, setActiveTab] = useState("chuong-trinh")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchAcademicSummary = async () => {
      if (!studentIdParam) {
        setStudentError("Thiếu student_id trên đường dẫn")
        setLoadingStudent(false)
        return
      }

      try {
        setLoadingStudent(true)
        setStudentError("")

        const res = await api.get<AcademicSummaryResponse>(`/api/v1/students/${studentIdParam}/academic-summary`)
        const data = res.data

        setStudent({
          id: Number(data.student_id || 0),
          mssv: String(data.student_id || studentIdParam),
          name: data.full_name || "",
          class: data.class_name || "",
          year: "",
          course: "",
          tcbb: Number(data.required_credits || 0),
          tctc: Number(data.elective_credits || 0),
          totalCredits: Number(data.total_credits || 0),
          gpa: Number(data.gpa || 0),
          ccdr: "",
          program: "",
          status: "",
          major: data.major_name || "",
        })
      } catch (error: any) {
        const detail = error?.response?.data?.detail
        const message = typeof detail === "string" && detail.trim()
          ? detail
          : "Không tải được thông tin học tập của sinh viên"
        setStudentError(message)
      } finally {
        setLoadingStudent(false)
      }
    }

    fetchAcademicSummary()
  }, [studentIdParam])

  const displayStudent: StudentDetail = student || {
    id: 0,
    mssv: studentIdParam,
    name: loadingStudent ? "Đang tải..." : "",
    class: "",
    year: "",
    course: "",
    tcbb: 0,
    tctc: 0,
    totalCredits: 0,
    gpa: 0,
    ccdr: "",
    program: "",
    status: "",
    major: "",
  }

  const goToList = () => {
    const qs = searchParams?.toString() ?? ""
    const path = "/nghiep-vu-dao-tao/xet-tot-nghiep" + (qs ? "?" + qs : "")
    router.push(path)
  }

  return (
    <AppLayout showSearch={false}>
          <div className="px-8 py-6 bg-[var(--background)] min-h-screen flex flex-col">

        {/* Header breadcrumb */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            <button
              type="button"
              onClick={goToList}
              className="text-blue-700 hover:underline font-semibold mr-2"
            >
              Xét tốt nghiệp
            </button>
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; <span className="ml-1">{displayStudent.name}</span>
            </span>
          </h1>
          {studentError && <p className="text-sm text-red-600 mt-2">{studentError}</p>}
        </div>

            <div className="flex-1 flex flex-col gap-4">

          {/* Student Info Card - sticky */}
          <div className="bg-gradient-to-r from-white via-blue-50 to-white rounded-2xl border border-blue-200 p-8 shadow-xl sticky top-0 z-20 transition-all hover:shadow-blue-300 hover:scale-[1.01]">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex gap-4">
                  <span className="font-semibold text-blue-700 min-w-fit">Họ và Tên:</span>
                  <span className="text-lg font-bold text-gray-900">{displayStudent.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-semibold text-blue-700 min-w-fit">MSSV:</span>
                  <span className="text-base font-semibold text-gray-900">{displayStudent.mssv}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-semibold text-blue-700 min-w-fit">Lớp:</span>
                  <span className="text-base font-semibold text-gray-900">{displayStudent.class}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-semibold text-blue-700 min-w-fit">Chuyên ngành:</span>
                  <span className="text-base font-semibold text-gray-900">{displayStudent.major}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <span className="font-semibold text-blue-700 min-w-fit">GPA:</span>
                  <span className="text-lg font-bold text-green-600">{displayStudent.gpa}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-semibold text-blue-700 min-w-fit">Tổng số tín chỉ đã học:</span>
                  <span className="text-base font-semibold text-gray-900">{displayStudent.totalCredits}</span>
                </div>
                <div className="flex gap-4">
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <span className="font-semibold text-blue-700">Tín chỉ bắt buộc:</span>
                      <span className="text-base font-semibold text-gray-900">{displayStudent.tcbb}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold text-blue-700">Tín chỉ tự chọn:</span>
                      <span className="text-base font-semibold text-gray-900">{displayStudent.tctc}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Card */}
              <div className="flex-1 flex flex-col bg-white rounded-xl border border-[var(--border)] overflow-hidden min-h-0 shadow-sm mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4 border-b border-[var(--border)]">
                <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
                  <TabsTrigger value="chuong-trinh" className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 font-semibold">
                    Chương trình học
                  </TabsTrigger>
                  <TabsTrigger value="chung-chi" className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 font-semibold">
                    Chứng chỉ đầu ra
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chuong-trinh" className="flex-1 flex flex-col px-6 py-4">
                     <div className="border border-[var(--border)] rounded-lg overflow-hidden flex flex-col flex-1">
                       <div className="overflow-auto flex-1 max-h-[400px]">
                         <Table className="min-w-max w-full">
                           <TableHeader>
                             <TableRow style={{ position: 'sticky', top: 0, zIndex: 10 }} className="border-b border-gray-200 bg-blue-50">
                               <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">STT</TableHead>
                               <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">MÃ HỌC PHẦN</TableHead>
                               <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">TÊN HỌC PHẦN</TableHead>
                               <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">SỐ TC</TableHead>
                               <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                                 <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                     <span className="cursor-pointer select-none flex items-center gap-1">
                                       PHÂN LOẠI
                                       <ChevronDown className="w-4 h-4 text-gray-500" />
                                     </span>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="start" className="w-32">
                                     <DropdownMenuItem onClick={() => setFilterType(null)} className="cursor-pointer text-sm">Tất cả</DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => setFilterType("Bắt buộc")} className="cursor-pointer text-sm">Bắt buộc</DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => setFilterType("Tự chọn")} className="cursor-pointer text-sm">Tự chọn</DropdownMenuItem>
                                   </DropdownMenuContent>
                                 </DropdownMenu>
                               </TableHead>
                               <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                                 <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                     <span className="cursor-pointer select-none flex items-center gap-1">
                                       TRẠNG THÁI
                                       <ChevronDown className="w-4 h-4 text-gray-500" />
                                     </span>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="start" className="w-40">
                                     <DropdownMenuItem onClick={() => setFilterStatus(null)} className="cursor-pointer text-sm">Tất cả</DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => setFilterStatus("Đã học (Đạt)")} className="cursor-pointer text-sm">Đã học (Đạt)</DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => setFilterStatus("Đã học (Chưa đạt)")} className="cursor-pointer text-sm">Đã học (Chưa đạt)</DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => setFilterStatus("Chưa học")} className="cursor-pointer text-sm">Chưa học</DropdownMenuItem>
                                   </DropdownMenuContent>
                                 </DropdownMenu>
                               </TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {(filterType || filterStatus
                               ? courseData.filter(c => {
                                   let typeMatch = filterType ? c.type === filterType : true;
                                   let statusMatch = filterStatus ? c.status === filterStatus : true;
                                   return typeMatch && statusMatch;
                                 })
                               : courseData
                             ).map((course, index) => (
                               <TableRow key={course.id} className="border-b border-transparent odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                                 <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{String(index + 1).padStart(2, '0')}</TableCell>
                                 <TableCell className="h-12 px-4 text-sm text-gray-600">{course.code}</TableCell>
                                 <TableCell className="h-12 px-4 text-sm text-gray-600">{course.name}</TableCell>
                                 <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{course.credits}</TableCell>
                                 <TableCell className="h-12 px-4 text-sm text-gray-600"><span className={course.type === "Tự chọn" ? "text-blue-600" : "text-gray-700"}>{course.type}</span></TableCell>
                                 <TableCell className="h-12 px-4 text-sm"><span className={course.status.includes("Đạt") ? "text-green-600 font-medium" : course.status === "Chưa học" ? "text-gray-600" : "text-red-600 font-medium"}>{course.status}</span></TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                       </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 sticky bottom-0 z-10 bg-white">
                    <div className="flex items-center justify-between px-6 py-3">
                      <div className="text-sm text-gray-600">Hiển thị 10/40 dòng</div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronsLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                        <div className="px-3 text-sm font-medium">1 / 4</div>
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronsRight className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chung-chi" className="flex-1 flex flex-col px-6 py-4">
                <div className="border border-[var(--border)] rounded-lg overflow-hidden flex flex-col flex-1">
                  <div className="overflow-auto flex-1">
                    <Table className="w-full table-fixed">
                      <colgroup>
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '100px' }} />
                        <col style={{ width: '100px' }} />
                        <col style={{ width: '120px' }} />
                      </colgroup>
                      <TableHeader>
                        <TableRow style={{ position: 'sticky', top: 0, zIndex: 10 }} className="border-b border-gray-200 bg-blue-50">
                          <TableHead className="h-10 px-2 text-center text-sm font-semibold text-gray-700">STT</TableHead>
                          <TableHead className="h-10 px-2 text-left text-sm font-semibold text-gray-700">LOẠI CHỨNG CHỈ</TableHead>
                          <TableHead className="h-10 px-2 text-center text-sm font-semibold text-gray-700">TRẠNG THÁI</TableHead>
                          <TableHead className="h-10 px-2 text-left text-sm font-semibold text-gray-700">GHI CHÚ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {certificateData.map((cert, index) => (
                          <TableRow key={cert.id} className="border-b border-transparent odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                            <TableCell className="h-12 px-2 text-center text-sm text-gray-600">{String(index + 1).padStart(2, '0')}</TableCell>
                            <TableCell className="h-12 px-2 text-sm text-gray-600">{cert.name}</TableCell>
                            <TableCell className="h-12 px-2 text-center"><Checkbox checked={cert.status} disabled /></TableCell>
                            <TableCell className="h-12 px-2 text-sm text-gray-600">{cert.note}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 sticky bottom-0 z-10 bg-white">
                    <div className="flex items-center justify-between px-6 py-3">
                      <div className="text-sm text-gray-600">Hiển thị 05/05 dòng</div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronsLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                        <div className="px-3 text-sm font-medium">1 / 1</div>
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronsRight className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
