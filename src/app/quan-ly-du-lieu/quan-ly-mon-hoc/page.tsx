"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  BookOpen,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
} from "lucide-react"
import {
  deleteSubject,
  getAllSubjects,
  getSubjectTrainingPrograms,
  updateSubject,
  type SubjectListItem,
  type SubjectTrainingProgramItem,
} from "../chuong-trinh-dao-tao/program.api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type SubjectRow = {
  id: string
  code: string
  name: string
  credits: number
  isRequired: boolean
}

type SubjectApiRow = SubjectListItem | {
  id?: string | number
  subject_id?: string | number
  code?: string
  name?: string
  course_display_name?: string
  credits?: number
  is_required?: boolean
}

export default function QuanLyMonHocPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("quan-ly-mon-hoc")
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [selectedSubject, setSelectedSubject] = useState<SubjectRow | null>(null)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editCode, setEditCode] = useState("")
  const [editName, setEditName] = useState("")
  const [editCredits, setEditCredits] = useState("")
  const [editError, setEditError] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [deleteUsedMajors, setDeleteUsedMajors] = useState<string[]>([])

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true)
        const allRows: SubjectApiRow[] = []
        let page = 1
        const size = 100

        while (true) {
          const response = await getAllSubjects(page, size)
          const payload = response?.data
          const pageRows = Array.isArray(payload)
            ? payload
            : payload?.data || payload?.items || payload?.results || []

          if (!Array.isArray(pageRows) || pageRows.length === 0) break
          allRows.push(...(pageRows as SubjectApiRow[]))

          if (pageRows.length < size) break
          page += 1
        }

        const mappedSubjects: SubjectRow[] = allRows.map((item, index) => {
          const code = String(item?.subject_id ?? item?.code ?? item?.id ?? "").trim()
          const name = String(item?.name ?? item?.course_display_name ?? "-").trim() || "-"
          return {
            id: `${code || "SUBJECT"}-${index}`,
            code: code || "-",
            name,
            credits: Number(item?.credits ?? 0),
            isRequired: Boolean(item?.is_required),
          }
        })

        setSubjects(mappedSubjects)
      } catch {
        setSubjects([])
      } finally {
        setLoadingSubjects(false)
      }
    }

    fetchSubjects()
  }, [])

  const filteredSubjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return subjects

    return subjects.filter((subject) => {
      return (
        subject.code.toLowerCase().includes(query) ||
        subject.name.toLowerCase().includes(query)
      )
    })
  }, [subjects, searchQuery])

  const PAGE_SIZE = 10
  const totalRecords = filteredSubjects.length
  const displayCount = totalRecords

  const openEditSubjectDialog = (subject: SubjectRow) => {
    setSelectedSubject(subject)
    setEditCode(subject.code)
    setEditName(subject.name)
    setEditCredits(String(subject.credits))
    setEditError("")
    setOpenEditDialog(true)
  }

  const handleSaveEditSubject = async () => {
    const trimmedCode = editCode.trim()
    const trimmedName = editName.trim()
    const creditsNum = Number(editCredits)

    if (!trimmedCode) {
      setEditError("Vui lòng nhập mã học phần")
      return
    }

    if (!trimmedName) {
      setEditError("Vui lòng nhập tên học phần")
      return
    }

    if (!editCredits.trim() || Number.isNaN(creditsNum) || creditsNum <= 0) {
      setEditError("Vui lòng nhập số tín chỉ hợp lệ")
      return
    }

    if (!selectedSubject) return

    if (trimmedCode === "-") {
      setEditError("Mã học phần không hợp lệ")
      return
    }

    try {
      setEditSaving(true)
      setEditError("")

      await updateSubject(trimmedCode, {
        name: trimmedName,
        credits: creditsNum,
      })

      setSubjects((prev) =>
        prev.map((item) =>
          item.id === selectedSubject.id
            ? {
              ...item,
              name: trimmedName,
              credits: creditsNum,
            }
            : item
        )
      )

      setOpenEditDialog(false)
      setSelectedSubject(null)
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Không thể cập nhật học phần. Vui lòng thử lại."
      setEditError(String(message))
    } finally {
      setEditSaving(false)
    }
  }

  const openDeleteSubjectDialog = async (subject: SubjectRow) => {
    setSelectedSubject(subject)
    setDeleteError("")
    setDeleteUsedMajors([])
    setOpenDeleteDialog(true)

    if (!subject.code || subject.code === "-") return

    try {
      const response = await getSubjectTrainingPrograms(subject.code)
      const rows = Array.isArray(response?.data) ? response.data : []
      const majors = rows
        .map((item: SubjectTrainingProgramItem) => String(item?.major_name || "").trim())
        .filter(Boolean)
      const uniqueMajors = Array.from(new Set(majors))
      setDeleteUsedMajors(uniqueMajors)
    } catch {
      // Keep dialog usable even if dependency lookup fails.
    }
  }

  const handleConfirmDeleteSubject = async () => {
    if (!selectedSubject) return

    if (!selectedSubject.code || selectedSubject.code === "-") {
      setDeleteError("Mã học phần không hợp lệ")
      return
    }

    try {
      setDeleteLoading(true)
      setDeleteError("")
      await deleteSubject(selectedSubject.code)
      setSubjects((prev) => prev.filter((item) => item.id !== selectedSubject.id))
      setOpenDeleteDialog(false)
      setSelectedSubject(null)
      setDeleteUsedMajors([])
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Không thể xóa học phần. Vui lòng thử lại."
      setDeleteError(String(message))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              {"> Quản lý môn học"}
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
                value="quan-ly-mon-hoc"
                className="relative min-w-[180px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <BookOpen className="w-4 h-4" />
                  Quản lý môn học
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 mt-5 flex flex-col">
            <TabsContent
              value="quan-ly-mon-hoc"
              className="m-0 h-full outline-none flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập mã hoặc tên học phần..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                  {/* Table */}
                  <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <div className="overflow-x-auto" style={{ height: '530px' }}>
                      <Table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <TableHeader>
                          <TableRow className="border-b border-gray-200 bg-blue-50">
                            <TableHead className="h-10 px-4 w-[64px] text-left text-sm font-semibold text-gray-700">
                              STT
                            </TableHead>
                            <TableHead className="h-10 px-4 w-[140px] text-left text-sm font-semibold text-gray-700">
                              MÃ HỌC PHẦN
                            </TableHead>
                            <TableHead className="h-10 px-4 w-[420px] text-left text-sm font-semibold text-gray-700">
                              TÊN HỌC PHẦN
                            </TableHead>
                            <TableHead className="h-10 px-4 w-[120px] text-center text-sm font-semibold text-gray-700">
                              SỐ TÍN CHỈ
                            </TableHead>
                            <TableHead className="h-10 px-4 min-w-[96px] text-right text-sm font-semibold text-gray-700">
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingSubjects ? (
                            <TableRow key="loading">
                              <TableCell colSpan={5} className="p-0">
                                <div className="h-120 w-full flex items-center justify-center text-gray-500 text-sm">
                                  <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang tải dữ liệu...
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : filteredSubjects.length === 0 ? (
                            <TableRow key="empty">
                              <TableCell colSpan={5} className="p-0">
                                <div className="h-120 w-full flex items-center justify-center text-gray-500 text-sm">
                                  Chưa có học phần nào
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredSubjects.map((subject, index) => (
                              <TableRow
                                key={subject.id}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <TableCell className="h-12 px-4 w-[64px] text-sm text-gray-600 whitespace-nowrap">
                                  {String(index + 1).padStart(2, "0")}
                                </TableCell>
                                <TableCell className="h-12 px-4 w-[140px] text-sm text-gray-600 whitespace-nowrap">
                                  <div className="truncate">{subject.code}</div>
                                </TableCell>
                                <TableCell className="h-12 px-4 w-[420px] text-sm text-gray-600">
                                  <div className="truncate">{subject.name}</div>
                                </TableCell>
                                <TableCell className="h-12 px-4 w-[120px] text-sm text-gray-600 text-center whitespace-nowrap">
                                  {subject.credits}
                                </TableCell>
                                <TableCell className="h-12 px-4 min-w-[96px] text-sm text-gray-600 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                      <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => openEditSubjectDialog(subject)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Sửa
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer text-sm text-red-600 focus:text-red-600" onClick={() => openDeleteSubjectDialog(subject)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
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
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
                  <div className="text-sm text-gray-600">
                    Hiển thị {displayCount}/{displayCount} dòng
                  </div>
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>

        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sửa học phần</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-800">Mã học phần</Label>
                <Input
                  value={editCode}
                  readOnly
                  disabled
                  placeholder="Nhập mã học phần"
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-800">Tên học phần</Label>
                <Input
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value)
                    if (editError) setEditError("")
                  }}
                  placeholder="Nhập tên học phần"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-800">Số tín chỉ</Label>
                <Input
                  value={editCredits}
                  onChange={(e) => {
                    setEditCredits(e.target.value)
                    if (editError) setEditError("")
                  }}
                  placeholder="Nhập số tín chỉ"
                />
              </div>

              {editError && <p className="text-xs text-red-500">{editError}</p>}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (editSaving) return
                  setOpenEditDialog(false)
                  setSelectedSubject(null)
                }}
                disabled={editSaving}
              >
                Hủy
              </Button>
              <Button className="bg-[#167FFC] hover:bg-[#1470E3] text-white" onClick={handleSaveEditSubject} disabled={editSaving}>
                {editSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Xóa học phần?</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">Bạn có chắc muốn xóa môn học này?</p>
              {deleteUsedMajors.length > 0 && (
                <p className="text-sm text-gray-700">
                  Môn học đang được dùng ở chương trình đào tạo {deleteUsedMajors.join(", ")}
                </p>
              )}
              {deleteError && (
                <p className="text-xs text-red-500">{deleteError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (deleteLoading) return
                  setOpenDeleteDialog(false)
                  setSelectedSubject(null)
                  setDeleteUsedMajors([])
                  setDeleteError("")
                }}
                disabled={deleteLoading}
              >
                Hủy
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDeleteSubject} disabled={deleteLoading}>
                {deleteLoading ? "Đang xóa..." : "Xóa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
