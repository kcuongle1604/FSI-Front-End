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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  ChevronsRight
} from "lucide-react"
import ImportDialog from "./components/ImportDialog"
import CertificateFormDialog from "./components/CertificateFormDialog"
import DeleteCertificateDialog from "./components/DeleteCertificateDialog"
import { sampleCertificates, certificateImportHistory, batchesAndClasses } from "./data"
import { Certificate, CertificateFormData } from "./types"

export default function ChungChiPage() {
  const [activeTab, setActiveTab] = useState("thong-tin-chung-chi")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)
  const [deletingCertificate, setDeleteCertificate] = useState<Certificate | null>(null)

  const filteredCertificates = sampleCertificates.filter(cert => {
    const matchesSearch = searchQuery === "" || 
      (cert.hoLot + " " + cert.ten).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBatch = selectedBatch === "" || cert.lop.startsWith(selectedBatch)
    const matchesClass = selectedClass === "" || cert.lop === selectedClass
    return matchesSearch && matchesBatch && matchesClass
  })

  const handleAddCertificate = () => {
    setEditingCertificate(null)
    setIsFormOpen(true)
  }

  const handleEditCertificate = (cert: Certificate) => {
    setEditingCertificate(cert)
    setIsFormOpen(true)
  }

  const handleDeleteCertificate = (cert: Certificate) => {
    setDeleteCertificate(cert)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = (data: CertificateFormData) => {
    console.log("Submitting certificate:", data)
    setIsFormOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deletingCertificate) {
      console.log("Deleting certificate:", deletingCertificate.id)
      setDeleteCertificate(null)
    }
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý chứng chỉ
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* TabsList */}
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger 
                value="thong-tin-chung-chi" 
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Thông tin chứng chỉ
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

          {/* Table Container */}
          <div className="flex-1 min-h-0 bg-white rounded-lg border border-slate-200 overflow-hidden mt-5">
            <TabsContent value="thong-tin-chung-chi" className="m-0 h-full outline-none flex flex-col">
              {/* Search and Actions Bar */}
              <div className="flex flex-col gap-3 p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Nhập MSSV hoặc tên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedBatch || "all"} onValueChange={(v) => setSelectedBatch(v === "all" ? "" : v)}>
                      <SelectTrigger className="w-32 h-9">
                        <SelectValue placeholder="Khoá" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả khoá</SelectItem>
                        {Object.keys(batchesAndClasses).map((batch) => (
                          <SelectItem key={batch} value={batch}>
                            {batch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedClass || "all"} onValueChange={(v) => setSelectedClass(v === "all" ? "" : v)}>
                      <SelectTrigger className="w-32 h-9">
                        <SelectValue placeholder="Lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả lớp</SelectItem>
                        {selectedBatch ? (
                          batchesAndClasses[selectedBatch]?.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              {cls}
                            </SelectItem>
                          ))
                        ) : (
                          Object.values(batchesAndClasses).flat().map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              {cls}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button 
                      className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
                      onClick={handleAddCertificate}
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
                      Tải
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
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto px-6 pb-6">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-10 px-0 text-left text-sm font-medium text-gray-700">STT</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">LỚP</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">HỌ LÓT</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">TÊN</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">NGÀY SINH</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">ĐƠN TN</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">KIỂM ĐIỂM</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">QUÂN SỰ</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">THỂ DỤC</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">NGOẠI NGỮ</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">TIN HỌC</TableHead>
                      <TableHead className="h-10 px-4 text-right text-sm font-medium text-gray-700">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.slice(0, 30).map((cert, index) => (
                      <TableRow key={cert.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="h-12 px-0 text-sm text-gray-600">
                          {String(index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{cert.lop}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{cert.hoLot}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{cert.ten}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{cert.ngaySinh}</TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm">
                          {cert.donTN ? <span className="text-green-600">✓</span> : <span className="text-gray-300">-</span>}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm">
                          {cert.kiemDiem ? <span className="text-green-600">✓</span> : <span className="text-gray-300">-</span>}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm">
                          {cert.quanSu ? <span className="text-green-600">✓</span> : <span className="text-gray-300">-</span>}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm">
                          {cert.theDuc ? <span className="text-green-600">✓</span> : <span className="text-gray-300">-</span>}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm">
                          {cert.ngoaiNgu ? <span className="text-green-600">✓</span> : <span className="text-gray-300">-</span>}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm">
                          {cert.tinhHoc ? <span className="text-green-600">✓</span> : <span className="text-gray-300">-</span>}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-right">
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
                            <DropdownMenuContent align="start" className="w-40" side="bottom" sideOffset={8}>
                              <DropdownMenuItem 
                                className="cursor-pointer text-sm"
                                onClick={() => handleEditCertificate(cert)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-sm text-red-600"
                                onClick={() => handleDeleteCertificate(cert)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Hiển thị {Math.min(30, filteredCertificates.length)}/{filteredCertificates.length} bản ghi
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
                    <span className="text-sm text-gray-600">2</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={filteredCertificates.length <= 30}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={filteredCertificates.length <= 30}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lich-su-import" className="m-0 h-full outline-none flex flex-col">
              {/* Search Bar */}
              <div className="flex items-center gap-3 p-6 pb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nhập tên file..."
                    className="pl-9 h-9 bg-white"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto px-6 pb-6">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-10 px-0 text-left text-sm font-medium text-gray-700">STT</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">TÊN FILE</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">TRẠNG THÁI</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">THÀNH CÔNG</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">THẤT BẠI</TableHead>
                      <TableHead className="h-10 px-4 text-center text-sm font-medium text-gray-700">TỔNG</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">NGÀY TẠO</TableHead>
                      <TableHead className="h-10 px-4 text-left text-sm font-medium text-gray-700">NGƯỜI TẠO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificateImportHistory.map((doc, index) => (
                      <TableRow key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="h-12 px-0 text-sm text-gray-600">
                          {String(index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="h-12 px-4 text-sm font-medium text-gray-900">{doc.fileName}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{doc.status}</TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{doc.success}</TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{doc.failed}</TableCell>
                        <TableCell className="h-12 px-4 text-center text-sm text-gray-600">{doc.total}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{doc.createdAt}</TableCell>
                        <TableCell className="h-12 px-4 text-sm text-gray-600">{doc.createdBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Hiển thị {Math.min(30, certificateImportHistory.length)}/{certificateImportHistory.length} bản ghi
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
                    <span className="text-sm text-gray-600">2</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={certificateImportHistory.length <= 30}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={certificateImportHistory.length <= 30}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <ImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
        <CertificateFormDialog 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen}
          certificate={editingCertificate}
          onSubmit={handleFormSubmit}
        />
        <DeleteCertificateDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          certificateName={deletingCertificate ? `${deletingCertificate.hoLot} ${deletingCertificate.ten} - ${deletingCertificate.lop}` : ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </AppLayout>
  )
}