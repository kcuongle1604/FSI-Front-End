"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/components/AppLayout"
import { Users, History } from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  Search,
  Upload,
  Download,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Components and APIs
import ScoreFormDialog from "./components/ScoreFormDialog"
import DeleteScoreDialog from "./components/DeleteScoreDialog"
import ScoreImportDialog from "./components/ScoreImportDialog"
import ImportHistoryTab from "../sinh-vien/components/ImportHistoryTab"
import { getScoreMatrix, getClasses } from "./score.api"
import type { ImportHistory } from "../sinh-vien/types"
import type { ScoreImportResponse, StudentScore } from "./types"

function splitHoTen(fullName: string): { hoLot: string; ten: string } {
  const parts = fullName.trim().split(" ")
  if (parts.length <= 1) {
    return { hoLot: fullName, ten: "" }
  }
  return {
    hoLot: parts.slice(0, -1).join(" "),
    ten: parts[parts.length - 1] ?? "",
  }
}

export default function DiemPage() {
  const [activeTab, setActiveTab] = useState("thong-tin-sinh-vien")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  // Score matrix data
  const [scoreData, setScoreData] = useState<StudentScore[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<any[]>([]) // Using any[] to match student API response
  const [selectedClass, setSelectedClass] = useState<string | undefined>()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentScore | null>(null)

  const [importHistory] = useState<ImportHistory[]>([])

  // Fetch available classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClasses()
        setClasses(Array.isArray(res?.data) ? res.data : [])
      } catch (err) {
        console.error("Failed to load classes", err)
      }
    }
    fetchClasses()
  }, [])

  // Fetch score matrix when class is selected
  useEffect(() => {
    if (!selectedClass || selectedClass === "all") {
      setScoreData([])
      setSubjects([])
      return
    }

    const fetchScores = async () => {
      try {
        setLoading(true)
        const res = await getScoreMatrix({ class_name: selectedClass })
        setScoreData(res.data.students)
        setSubjects(res.data.subjects)
      } catch (err) {
        console.error("Failed to load scores", err)
        setScoreData([])
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [selectedClass])

  // Filter score data by search query
  const filteredScoreData = scoreData.filter((student) => {
    const query = searchQuery.toLowerCase()
    if (!query) return true

    return (
      student.full_name.toLowerCase().includes(query) ||
      String(student.student_id).includes(searchQuery)
    )
  })

  const PAGE_SIZE = 30
  const hasData = selectedClass && selectedClass !== "all"
  const visibleStudents = filteredScoreData.slice(0, PAGE_SIZE)

  const totalRecords = filteredScoreData.length
  const displayCount = Math.min(PAGE_SIZE, totalRecords)
  const totalPages = Math.max(1, Math.ceil(Math.max(totalRecords, 1) / PAGE_SIZE))

  const handleEdit = (student: StudentScore) => {
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDelete = (student: StudentScore) => {
    setSelectedStudent(student)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedStudent(null)
    setIsFormOpen(true)
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Điểm
            </span>
          </h1>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger
                value="thong-tin-sinh-vien"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Thông tin sinh viên
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="lich-su-import"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Lịch sử import
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 mt-5 flex flex-col">
            <TabsContent
              value="thong-tin-sinh-vien"
              className="m-0 h-full outline-none flex flex-col"
            >
              {/* Search & Actions */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập MSSV hoặc tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger className="h-9 w-[200px] bg-white">
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="all">Tất cả</SelectItem>
                      {classes
                        .map((c: any) => c.class_name || c.name || c)
                        .map((className: string) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    onClick={handleAdd}
                    className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Mẫu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm"
                    onClick={() => setIsImportOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>

              {/* Score Table */}
              <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="overflow-auto">
                    <Table className="w-full" style={{ borderCollapse: "collapse" }}>
                      <TableHeader>
                        <TableRow
                          className="border-b border-gray-200 bg-blue-50"
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: 0, zIndex: 20, minWidth: "60px", width: "60px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            STT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "60px", zIndex: 20, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            LỚP
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "180px", zIndex: 20, minWidth: "150px", width: "150px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            HỌ LÓT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "330px", zIndex: 20, minWidth: "100px", width: "100px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            TÊN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "430px", zIndex: 20, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            NGÀY SINH
                          </TableHead>
                          {subjects.map((subject) => (
                            <TableHead
                              key={subject}
                              className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 whitespace-nowrap"
                            >
                              {subject.toUpperCase()}
                            </TableHead>
                          ))}
                          <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-12" />
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {visibleStudents.length > 0 ? (
                          visibleStudents.map((student, index) => {
                            const { hoLot, ten } = splitHoTen(student.full_name)
                            return (
                              <TableRow
                                key={student.student_id}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: 0, zIndex: 5, minWidth: "60px", width: "60px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {String(index + 1).padStart(2, "0")}
                                </TableCell>
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "60px", zIndex: 5, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {student.class_name}
                                </TableCell>
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "180px", zIndex: 5, minWidth: "150px", width: "150px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {hoLot}
                                </TableCell>
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "330px", zIndex: 5, minWidth: "100px", width: "100px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {ten}
                                </TableCell>
                                <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "430px", zIndex: 5, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                  {student.dob}
                                </TableCell>
                                {subjects.map((subject) => (
                                  <TableCell
                                    key={subject}
                                    className="h-12 px-4 text-sm text-gray-600 text-center"
                                  >
                                    {student.scores[subject] ?? "-"}
                                  </TableCell>
                                ))}
                                <TableCell className="h-12 px-4 text-right w-12">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" sideOffset={8}>
                                      <DropdownMenuItem onClick={() => handleEdit(student)}>
                                        <Edit className="h-4 w-4 mr-2" /> Sửa
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleDelete(student)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" /> Xóa
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6 + subjects.length}
                              className="h-32 text-center text-gray-500"
                            >
                              {loading
                                ? "Đang tải..."
                                : !hasData
                                  ? "Vui lòng chọn  lớp để xem điểm"
                                  : "Không có dữ liệu"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
                  <div className="text-sm text-gray-600">
                    Hiển thị {displayCount}/{totalRecords} dòng
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300"
                      disabled
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300"
                      disabled
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 px-3 text-sm">
                      <span className="font-medium text-gray-700">1</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300"
                      disabled={totalRecords <= PAGE_SIZE}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300"
                      disabled={totalRecords <= PAGE_SIZE}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="lich-su-import"
              className="m-0 h-full outline-none flex flex-col min-h-0"
            >
              <ImportHistoryTab history={importHistory} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ScoreFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={selectedStudent}
        studentOptions={scoreData}
        courseOptions={subjects}
      />
      <DeleteScoreDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        student={selectedStudent}
      />
      <ScoreImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportSuccess={(result: ScoreImportResponse) => {
          console.log('Score import successful:', result)
          // Refresh scores if a class is selected
          if (selectedClass && selectedClass !== "all") {
            getScoreMatrix({ class_name: selectedClass }).then((res) => {
              setScoreData(res.data.students)
              setSubjects(res.data.subjects)
            })
          }
        }}
      />
    </AppLayout>
  )
}
