"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/components/AppLayout"
import { BookOpen, History } from "lucide-react"
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  Search,
  Download,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"

// Dùng lại toàn bộ component & dữ liệu của Sinh viên
import DeleteDialog from "../sinh-vien/components/DeleteDialog"
import ImportHistoryTab from "../sinh-vien/components/ImportHistoryTab"
import { getStudents } from "../sinh-vien/student.api"
import type { Student, ImportHistory } from "../sinh-vien/types"
import { sampleStudents, classesByCourse } from "../sinh-vien/data"
import ProgramFormDialog, { ProgramFormValues } from "./ProgramFormDialog"
import { deleteTrainingProgram, getTrainingPrograms, getProgramCohorts, type Cohort } from "./program.api"

export type Program = {
  id: number
  name: string
  majorId?: number
  majorName?: string
  specialization?: string
  applicableCourses?: string[]
  appliedCourses?: string[]
}

export const INITIAL_PROGRAMS: Program[] = [
  { id: 1, name: "Quản trị hệ thống thông tin", applicableCourses: ["48K"] },
  { id: 2, name: "Tin học quản lý", applicableCourses: ["49K"] },
  { id: 3, name: "Thống kê", applicableCourses: ["50K"] },
]

export default function ChuongTrinhDaoTaoPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("chuong-trinh-dao-tao")
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedKhoa, setSelectedKhoa] = useState<string | undefined>()
  const [selectedLop, setSelectedLop] = useState<string | undefined>()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const [importHistory] = useState<ImportHistory[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [programCohorts, setProgramCohorts] = useState<Map<number, string[]>>(new Map())
  const [openDeleteProgramDialog, setOpenDeleteProgramDialog] = useState(false)
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null)
  const [deletingProgramLoading, setDeletingProgramLoading] = useState(false)
  const [deleteProgramError, setDeleteProgramError] = useState("")

  const refreshPrograms = async () => {
    try {
      setLoadingPrograms(true)
      const response = await getTrainingPrograms()
      if (response?.data && Array.isArray(response.data)) {
        const programsList = response.data.map((p: any) => {
          const programId = p.training_program_id || p.program_id || p.id
          const normalizedName = String(p.program_name ?? p.name ?? p.major_name ?? "").trim()
          return {
            id: programId,
            name: normalizedName,
            majorId: p.major_id,
            majorName: p.major_name,
            specialization: p.specialization,
            applicableCourses: p.applicable_courses || p.applicableCourses || [],
          }
        })
        setPrograms(programsList)

        const cohortsMap = new Map<number, string[]>()
        await Promise.all(
          programsList.map(async (program) => {
            try {
              const cohortsResponse = await getProgramCohorts(program.id)
              if (cohortsResponse?.data && Array.isArray(cohortsResponse.data)) {
                const cohortIds = cohortsResponse.data.map((c: Cohort) => String(c.cohort_id))
                cohortsMap.set(program.id, cohortIds)
              }
            } catch {
              cohortsMap.set(program.id, [])
            }
          })
        )
        setProgramCohorts(cohortsMap)
      }
    } catch {
      setPrograms(INITIAL_PROGRAMS)
    } finally {
      setLoadingPrograms(false)
    }
  }

  // Fetch training programs from API
  useEffect(() => {
    refreshPrograms()
  }, [])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const res = await getStudents()
        const apiStudents = Array.isArray(res?.data?.students) ? res.data.students : []

        if (apiStudents.length > 0) {
          const mapped: Student[] = apiStudents.map((s: any) => ({
            id: s.student_id,
            mssv: s.mssv,
            hoTen: s.ho_ten,
            lop: s.lop,
            ngaySinh: s.ngay_sinh,
            ghiChu: s.ghi_chu ?? "",
          }))
          setStudents(mapped)
        } else {
          setStudents(sampleStudents.slice(0, 5))
        }
      } catch {
        setStudents(sampleStudents.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const filteredPrograms = programs.filter((p) => {
    const query = searchQuery.toLowerCase()
    if (!query) return true

    const programName = String(p.name ?? "").toLowerCase()
    const courses = (p.applicableCourses ?? p.appliedCourses ?? []).map((c) => String(c).toLowerCase())

    return (
      programName.includes(query) ||
      courses.some((c) => c.includes(query))
    )
  })

  const PAGE_SIZE = 30
  const totalRecords = filteredPrograms.length
  const displayCount = Math.min(PAGE_SIZE, totalRecords)
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDelete = (student: Student) => {
    setSelectedStudent(student)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedStudent(null)
    setEditingProgram(null)
    setIsFormOpen(true)
  }

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program)
    setIsFormOpen(true)
  }

  const handleSaveProgram = async (data: ProgramFormValues) => {
    await refreshPrograms()
  }

  const handleDeleteProgram = async (program: Program) => {
    setDeletingProgram(program)
    setDeleteProgramError("")
    setOpenDeleteProgramDialog(true)
  }

  const handleConfirmDeleteProgram = async () => {
    if (!deletingProgram) return

    try {
      setDeletingProgramLoading(true)
      setDeleteProgramError("")
      await deleteTrainingProgram(deletingProgram.id)
      await refreshPrograms()
      setOpenDeleteProgramDialog(false)
      setDeletingProgram(null)
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Không thể xóa chương trình đào tạo. Vui lòng thử lại."
      setDeleteProgramError(String(message))
    } finally {
      setDeletingProgramLoading(false)
    }
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Chương trình đào tạo
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
                value="chuong-trinh-dao-tao"
                className="relative min-w-[180px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <BookOpen className="w-4 h-4" />
                  Chương trình đào tạo
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
              value="chuong-trinh-dao-tao"
              className="m-0 h-full outline-none flex flex-col"
            >
              {/* Search & Actions – giống Quản lý người dùng */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập tên CTĐT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    onClick={handleAdd}
                    className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                </div>
              </div>

              {/* Card bảng – giống UserManagementTable & Sinh viên */}
              <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="overflow-auto">
                    <Table className="w-full min-w-[500px]">
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-blue-50">
                          <TableHead className="h-10 px-4 w-[80px] text-left text-sm font-semibold text-gray-700">
                            STT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                            CHUYÊN NGÀNH
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                            KHÓA ÁP DỤNG
                          </TableHead>
                          <TableHead className="h-10 px-4 w-[60px] text-right text-sm font-semibold text-gray-700">
                            THAO TÁC
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {loadingPrograms ? (
                          <TableRow key="loading">
                            <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                              Đang tải...
                            </TableCell>
                          </TableRow>
                        ) : filteredPrograms.length === 0 ? (
                          <TableRow key="empty">
                            <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                              Chưa có chương trình đào tạo nào
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPrograms.map((program, index) => (
                            <TableRow
                              key={`program-${program.id}-${index}`}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <TableCell className="h-12 px-4 w-[80px] text-sm text-gray-600">
                                {String(index + 1).padStart(2, "0")}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600">
                                <button
                                  type="button"
                                  className="text-blue-700 hover:underline font-medium outline-none"
                                  onClick={() => {
                                    router.push(`/quan-ly-du-lieu/chuong-trinh-dao-tao/${program.id}?name=${encodeURIComponent(program.name)}`)
                                  }}
                                >
                                  {program.majorName || "-"}
                                </button>
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600">
                                {(() => {
                                  const cohorts = programCohorts.get(program.id)
                                  return cohorts?.join(", ") || "-"
                                })()}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 text-right">
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
                                  <DropdownMenuContent align="end" className="w-24">
                                    <DropdownMenuItem
                                      className="text-sm"
                                      onClick={() => handleEditProgram(program)}
                                    >
                                      Sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-sm text-red-600 focus:text-red-600"
                                      onClick={() => handleDeleteProgram(program)}
                                    >
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
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

      <ProgramFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveProgram}
        programId={editingProgram?.id}
        initialData={
          editingProgram
            ? {
                major_id: editingProgram.majorId ?? 0,
                description: undefined,
                cohort_ids: programCohorts.get(editingProgram.id)?.map((value) => Number(value)).filter((value) => Number.isFinite(value)) || [],
              }
            : null
        }
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        student={selectedStudent}
      />

      <Dialog open={openDeleteProgramDialog} onOpenChange={setOpenDeleteProgramDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Xóa chương trình đào tạo?</DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <p className="text-sm text-gray-700">
              Bạn có chắc chắn muốn xóa chương trình đào tạo này?
            </p>
            {deleteProgramError && (
              <p className="text-sm text-red-600">{deleteProgramError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (deletingProgramLoading) return
                setOpenDeleteProgramDialog(false)
                setDeletingProgram(null)
                setDeleteProgramError("")
              }}
              disabled={deletingProgramLoading}
            >
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDeleteProgram}
              disabled={deletingProgramLoading}
            >
              {deletingProgramLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
