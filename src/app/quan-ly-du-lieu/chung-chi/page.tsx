"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/components/AppLayout"
import { Award, History } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

import CertificateFormDialog from "./components/CertificateFormDialog"
import DeleteCertificateDialog from "./components/DeleteCertificateDialog"
import ImportDialog from "../sinh-vien/components/ImportDialog"
import ImportHistoryTab from "../sinh-vien/components/ImportHistoryTab"
import type { Certificate, CertificateFormData } from "./types"
import { sampleCertificates, batchesAndClasses } from "./data"
import type { ImportHistory } from "../sinh-vien/types"

export default function ChungChiPage() {
  const [activeTab, setActiveTab] = useState("chung-chi")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKhoa, setSelectedKhoa] = useState<string | undefined>()
  const [selectedLop, setSelectedLop] = useState<string | undefined>()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>(sampleCertificates)
  const [importHistory] = useState<ImportHistory[]>([])

  const allClasses = Object.values(batchesAndClasses).flat()

  const availableClasses =
    !selectedKhoa || selectedKhoa === "all"
      ? allClasses
      : batchesAndClasses[selectedKhoa] || []

  const filteredCertificates = certificates.filter((certificate) => {
    if (!selectedLop || selectedLop === "all") {
      return false
    }

    if (
      selectedKhoa &&
      selectedKhoa !== "all" &&
      !String(certificate.lop).startsWith(selectedKhoa)
    ) {
      return false
    }

    if (selectedLop && selectedLop !== "all" && certificate.lop !== selectedLop) {
      return false
    }

    const query = searchQuery.toLowerCase()
    if (!query) return true

    return (
      `${certificate.hoLot} ${certificate.ten}`.toLowerCase().includes(query)
    )
  })

  const PAGE_SIZE = 30
  const totalRecords = filteredCertificates.length
  const displayCount = Math.min(PAGE_SIZE, totalRecords)
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))

  const handleEdit = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsFormOpen(true)
  }

  const handleDelete = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedCertificate(null)
    setIsFormOpen(true)
  }

  const handleSubmitCertificate = (data: CertificateFormData) => {
    setCertificates((prev) => {
      if (selectedCertificate) {
        return prev.map((item) =>
          item.id === selectedCertificate.id ? { ...item, ...data } : item
        )
      }

      const newId = prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 1
      return [...prev, { id: newId, ...data }]
    })
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Chứng chỉ
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
                value="chung-chi"
                className="relative min-w-[180px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <Award className="w-4 h-4" />
                  Chứng chỉ
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
              value="chung-chi"
              className="m-0 h-full outline-none flex flex-col"
            >
              {/* Search & Actions – giống Quản lý người dùng */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập tên sinh viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedKhoa}
                    onValueChange={(value) => {
                      setSelectedKhoa(value)
                      setSelectedLop(undefined)
                    }}
                  >
                    <SelectTrigger className="h-9 w-[120px] bg-white">
                      <SelectValue placeholder="Khóa" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="48K">48K</SelectItem>
                      <SelectItem value="49K">49K</SelectItem>
                      <SelectItem value="50K">50K</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedLop} onValueChange={setSelectedLop}>
                    <SelectTrigger className="h-9 w-[140px] bg-white">
                      <SelectValue placeholder="Lớp" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      {availableClasses.map((lop) => (
                        <SelectItem key={lop} value={lop}>
                          {lop}
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

              {/* Card bảng – giống UserManagementTable & Sinh viên */}
              <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="overflow-auto">
                    <Table className="w-full min-w-[1000px]">
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-blue-50">
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                            STT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                            LỚP
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                            HỌ LÓT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                            TÊN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700">
                            NGÀY SINH
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">
                            ĐƠN XIN CÔNG NHẬN TN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">
                            BẢN KIỂM ĐIỂM CÁ NHÂN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">
                            CC QUÂN SỰ
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">
                            CC THỂ DỤC
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">
                            CC NGOẠI NGỮ
                          </TableHead>
                          <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700">
                            CC TIN HỌC
                          </TableHead>
                          <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 w-12" />
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredCertificates.map((certificate, index) => {
                          return (
                            <TableRow
                              key={certificate.id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <TableCell className="h-12 px-4 text-sm text-gray-600">
                                {String(index + 1).padStart(2, "0")}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600">
                                {certificate.lop}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600">
                                {certificate.hoLot}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600">
                                {certificate.ten}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600">
                                {certificate.ngaySinh}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={certificate.donTN}
                                    disabled
                                    className="pointer-events-none data-[state=unchecked]:bg-transparent"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={certificate.kiemDiem}
                                    disabled
                                    className="pointer-events-none data-[state=unchecked]:bg-transparent"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={certificate.quanSu}
                                    disabled
                                    className="pointer-events-none data-[state=unchecked]:bg-transparent"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={certificate.theDuc}
                                    disabled
                                    className="pointer-events-none data-[state=unchecked]:bg-transparent"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={certificate.ngoaiNgu}
                                    disabled
                                    className="pointer-events-none data-[state=unchecked]:bg-transparent"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={certificate.tinhHoc}
                                    disabled
                                    className="pointer-events-none data-[state=unchecked]:bg-transparent"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="h-12 px-4 text-right w-12">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" sideOffset={8}>
                                    <DropdownMenuItem onClick={() => handleEdit(certificate)}>
                                      <Edit className="h-4 w-4 mr-2" /> Sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDelete(certificate)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" /> Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
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

      <CertificateFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setSelectedCertificate(null)
          }
        }}
        certificate={selectedCertificate ?? undefined}
        onSubmit={handleSubmitCertificate}
      />
      <DeleteCertificateDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open)
          if (!open) {
            setSelectedCertificate(null)
          }
        }}
        certificateName={selectedCertificate ? `${selectedCertificate.hoLot} ${selectedCertificate.ten}` : ""}
        onConfirm={() => {
          if (!selectedCertificate) return
          setCertificates((prev) => prev.filter((item) => item.id !== selectedCertificate.id))
          setSelectedCertificate(null)
        }}
      />
      <ImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        isCertificateImport
        classOptions={allClasses.map((lop) => ({ value: lop, label: lop }))}
      />
    </AppLayout>
  )
}