import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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

interface XetTotNghiepTabProps {
  students: XetTotNghiep[]
}

export default function XetTotNghiepTab({ students }: XetTotNghiepTabProps) {
  const router = useRouter()
  const totalRecords = students.length
  const displayCount = Math.min(15, totalRecords)

  const handleStudentClick = (mssv: string) => {
    router.push(`/nghiep-vu-dao-tao/xet-tot-nghiep/${mssv}`)
  }

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-blue-50">
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">STT</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">MSSV</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">HỌ & TÊN</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">LỚP</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">TCBB</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">TCTC</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">TỔNG TC</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">GPA</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">CCDR</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                      CHƯƠNG TRÌNH HỌC
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuCheckboxItem checked>
                      Tất cả
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Hoàn thành
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Chưa hoàn thành
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                      ĐIỀU KIỆN TN
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuCheckboxItem checked>
                      Tất cả
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Đạt
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Không đạt
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.slice(0, 15).map((student, index) => (
              <TableRow key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">
                  {String(index + 1).padStart(2, '0')}
                </TableCell>
                <TableCell 
                  className="h-12 px-4 text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                  onClick={() => handleStudentClick(student.mssv)}
                >
                  {student.mssv}
                </TableCell>
                <TableCell className="h-12 px-4 text-sm text-gray-600">{student.name}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.class}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.tcbb}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.tctc}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.totalCredits}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.gpa}</TableCell>
                <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{student.ccdr}</TableCell>
                <TableCell className="h-12 px-4 text-sm text-gray-600">{student.program}</TableCell>
                <TableCell className="h-12 px-4 text-sm">
                  <span className={student.status === "Đạt" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {student.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Hiển thị {displayCount}/{totalRecords} dòng
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={true}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={true}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-gray-700">1</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-600">4</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={totalRecords <= 15}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={totalRecords <= 15}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
