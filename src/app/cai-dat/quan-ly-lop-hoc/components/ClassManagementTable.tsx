import { useEffect, useState } from "react"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, MoreVertical, Edit, Trash2 } from "lucide-react"
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SchoolClass = {
  id: number
  name: string
  specialization: string
  advisor: string
  studentCount: number | string
}

interface ClassManagementTableProps {
  classes: SchoolClass[]
  onEditClick: (schoolClass: SchoolClass) => void
  onDeleteClick: (schoolClass: SchoolClass) => void
}

export default function ClassManagementTable({
  classes,
  onEditClick,
  onDeleteClick
}: ClassManagementTableProps) {
  const PAGE_SIZE = 10
  const [currentPage, setCurrentPage] = useState(1)

  const totalRecords = classes.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const visibleClasses = classes.slice(startIndex, startIndex + PAGE_SIZE)
  const displayCount = visibleClasses.length

  useEffect(() => {
    setCurrentPage(1)
  }, [totalRecords])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="overflow-x-auto">
          <Table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <TableHeader style={{ position: 'sticky', top: 0, zIndex: 10, display: 'table-header-group' }}>
              <TableRow className="border-b border-gray-200 bg-blue-50">
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">STT</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">TÊN LỚP</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">CHUYÊN NGÀNH</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">GIÁO VIÊN PHỤ TRÁCH</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">SỐ LƯỢNG</TableHead>
                <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleClasses.map((schoolClass, index) => (
                <TableRow key={schoolClass.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="h-12 px-4 text-sm text-gray-600">
                    {String(startIndex + index + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="h-12 px-4 text-sm text-gray-600">{schoolClass.name}</TableCell>
                  <TableCell className="h-12 px-4 text-sm text-gray-600">{schoolClass.specialization}</TableCell>
                  <TableCell className="h-12 px-4 text-sm text-gray-600">{schoolClass.advisor}</TableCell>
                  <TableCell className="h-12 px-4 text-sm text-gray-600">{schoolClass.studentCount}</TableCell>
                  <TableCell className="h-12 px-4 min-w-[96px] text-sm text-gray-600 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => onEditClick(schoolClass)}>
                          <Edit className="h-4 w-4 mr-2" />Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-sm text-red-600 focus:text-red-600" onClick={() => onDeleteClick(schoolClass)}>
                          <Trash2 className="h-4 w-4 mr-2" />Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
        <div className="text-sm text-gray-600">
          Hiển thị {displayCount}/{totalRecords} dòng
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-gray-700">{safeCurrentPage}</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-600">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
