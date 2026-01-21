"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, FileText, Upload, CheckCircle2 } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "@/components/ui/select"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importError, setImportError] = useState<string>("")
  const [importStep, setImportStep] = useState<'upload' | 'mapping'>('upload')
  const [mappingTab, setMappingTab] = useState<'anh-xa-cot' | 'tong-quan-loi' | 'chi-tiet-loi'>('anh-xa-cot')
  const [selectedSheet, setSelectedSheet] = useState('Sheet1')

  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({
    mssv: 'MSSV', hoTen: 'Họ và tên', lop: 'Lớp', donTN: '', kiemDiem: '', quanSu: '', theDuc: '', ngoaiNgu: '', tinhHoc: '', ghiChu: ''
  })

  // Constants
  const requiredFields = ['mssv', 'hoTen', 'lop']
  const systemColumns = [
    { value: 'MSSV', label: 'MSSV' },
    { value: 'Họ và tên', label: 'Họ và tên' },
    { value: 'Lớp', label: 'Lớp' },
    { value: 'Đơn TN', label: 'Đơn TN' },
    { value: 'Kiểm điểm', label: 'Kiểm điểm' },
    { value: 'Quân sự', label: 'Quân sự' },
    { value: 'Thể dục', label: 'Thể dục' },
    { value: 'Ngoại ngữ', label: 'Ngoại ngữ' },
    { value: 'Tin học', label: 'Tin học' },
    { value: 'Ghi chú', label: 'Ghi chú' },
  ]
  const errorSummary = { valid: 20, duplicateSystem: 1, duplicateFile: 2, dataError: 3 }
  const errorDetails = [
    { row: 3, column: 'Họ và tên', value: 'Nguyễn Văn', error: 'Giá trị không hợp lệ' },
    { row: 5, column: 'MSSV', value: '', error: 'Thiếu giá trị' },
    { row: 10, column: 'Lớp', value: 'Lớp không tồn tại', error: 'Sai kiểu dữ liệu' },
  ]

  const unmappedRequiredFields = requiredFields.filter(field => !columnMappings[field])
  const hasUnmappedRequired = unmappedRequiredFields.length > 0
  const allMapped = Object.values(columnMappings).every(v => v !== '')

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setImportFile(null);
      setImportError("");
      setImportStep('upload');
      setMappingTab('anh-xa-cot');
    }
  }

  const uploadStepContent = (
    <>
      <DialogHeader>
        <DialogTitle>Tải tệp lên</DialogTitle>
        <DialogDescription>Chọn và tải lên các tệp bạn muốn</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        {importError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
            <AlertCircle className="h-4 w-4" /><span>{importError}</span>
          </div>
        )}
        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${importError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
          <div className="flex justify-center mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${importFile ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {importFile ? <FileText className="h-5 w-5 text-blue-600" /> : <Upload className="h-5 w-5 text-gray-500" />}
            </div>
          </div>
          {importFile ? (
            <>
              <p className="text-gray-800 font-medium mb-1">{importFile.name}</p>
              <p className="text-xs text-gray-500 mb-3">Định dạng Excel (.xlsx), {(importFile.size / (1024 * 1024)).toFixed(2)}MB</p>
            </>
          ) : (
            <>
              <p className="text-gray-800 font-medium mb-1">Chọn một tệp hoặc kéo và thả vào đây</p>
              <p className="text-xs text-gray-500 mb-3">Định dạng Excel (.xlsx), dung lượng tối đa 50MB</p>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'; input.accept = '.xlsx,.xls'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) {
                if (file.size > 50 * 1024 * 1024) { setImportError("File vượt quá dung lượng cho phép. Giới hạn tối đa: 50 MB."); setImportFile(null); return }
                if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) { setImportError("Định dạng file không hợp lệ, chỉ chấp nhận .xlsx"); setImportFile(null); return }
                setImportError(""); setImportFile(file)
              }
            }
            input.click()
          }}>Chọn tệp</Button>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => handleOpenChange(false)}>Hủy</Button>
        <Button className="bg-[#167FFC] hover:bg-[#1470E3]" disabled={!importFile || !!importError} onClick={() => { setImportStep('mapping'); setMappingTab('anh-xa-cot') }}>Tiếp</Button>
      </DialogFooter>
    </>
  )

  const mappingStepContent = (
    <>
      <DialogHeader>
        <DialogTitle>Xác minh tệp – Ánh xạ cột</DialogTitle>
        <DialogDescription>Chọn cách bạn muốn nhập từng cột dữ liệu chứng chỉ.</DialogDescription>
      </DialogHeader>
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button className={`pb-2 text-sm font-medium border-b-2 transition-colors ${mappingTab === 'anh-xa-cot' ? 'border-[#167FFC] text-[#167FFC]' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setMappingTab('anh-xa-cot')}>Ánh xạ cột</button>
          <button className={`pb-2 text-sm font-medium border-b-2 transition-colors ${mappingTab === 'tong-quan-loi' ? 'border-[#167FFC] text-[#167FFC]' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setMappingTab('tong-quan-loi')}>Tổng quan lỗi</button>
          <button className={`pb-2 text-sm font-medium border-b-2 transition-colors ${mappingTab === 'chi-tiet-loi' ? 'border-[#167FFC] text-[#167FFC]' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setMappingTab('chi-tiet-loi')}>Chi tiết lỗi ({errorDetails.length})</button>
        </div>
      </div>
      <div className="py-4">
        {mappingTab === 'anh-xa-cot' && (
          <>
            <div className="flex items-center justify-between mb-4">
              {hasUnmappedRequired ? (
                <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="h-4 w-4" /><span>Bạn còn {unmappedRequiredFields.length} cột chưa được ghép.</span></div>
              ) : allMapped ? (
                <div className="flex items-center gap-2 text-green-600 text-sm"><CheckCircle2 className="h-4 w-4" /><span>Tất cả các cột đã được ghép thành công.</span></div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 text-sm"><AlertCircle className="h-4 w-4" /><span>Một số cột chưa được ghép (không bắt buộc).</span></div>
              )}
              <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sheet1">Sheet1</SelectItem><SelectItem value="Sheet2">Sheet2</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="text-xs font-semibold text-gray-700 px-4 py-3 w-1/3">Tên cột trong tệp</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 px-4 py-3 w-1/3">Thuộc tính</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 px-4 py-3 w-1/3 text-center">Trạng thái ghép</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { key: 'mssv', label: 'MSSV', required: true },
                    { key: 'hoTen', label: 'Họ và tên', required: true },
                    { key: 'lop', label: 'Lớp', required: true },
                    { key: 'donTN', label: 'Đơn TN', required: false },
                    { key: 'kiemDiem', label: 'Kiểm điểm', required: false },
                    { key: 'quanSu', label: 'Quân sự', required: false },
                    { key: 'theDuc', label: 'Thể dục', required: false },
                    { key: 'ngoaiNgu', label: 'Ngoại ngữ', required: false },
                    { key: 'tinhHoc', label: 'Tin học', required: false },
                    { key: 'ghiChu', label: 'Ghi chú', required: false },
                  ].map((field) => (
                    <TableRow key={field.key} className={`border-b border-gray-200 hover:bg-gray-50 ${!columnMappings[field.key] && field.required ? 'bg-red-50' : ''}`}>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 w-1/3">
                        <span>{field.label}</span>
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </TableCell>
                      <TableCell className="px-4 py-3 w-1/3">
                        <Select value={columnMappings[field.key] || "none"} onValueChange={(value) => setColumnMappings(prev => ({ ...prev, [field.key]: value === "none" ? "" : value }))}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="---" /></SelectTrigger>
                          <SelectContent><SelectItem value="none">---</SelectItem>{systemColumns.map(col => (<SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>))}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center w-1/3">
                        {columnMappings[field.key] ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                        ) : field.required ? (
                          <AlertCircle className="h-5 w-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        {mappingTab === 'tong-quan-loi' && (
          <>
            {errorSummary.valid === 0 && <div className="flex items-center gap-2 text-red-600 text-sm mb-4"><AlertCircle className="h-4 w-4" /><span>Không có bản ghi hợp lệ để import.</span></div>}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader><TableRow className="bg-gray-50"><TableHead>Mục</TableHead><TableHead className="text-center">Số lượng</TableHead><TableHead>Ghi chú</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow><TableCell>Hợp lệ</TableCell><TableCell className="text-center">{errorSummary.valid}</TableCell><TableCell></TableCell></TableRow>
                  <TableRow><TableCell>MSSV trùng với hệ thống</TableCell><TableCell className="text-center">0{errorSummary.duplicateSystem}</TableCell><TableCell className="text-gray-500">Dòng 9</TableCell></TableRow>
                  <TableRow><TableCell>MSSV trùng nhau trong tệp</TableCell><TableCell className="text-center">0{errorSummary.duplicateFile}</TableCell><TableCell className="text-gray-500">Dòng 3,12</TableCell></TableRow>
                  <TableRow><TableCell>Lỗi dữ liệu khác</TableCell><TableCell className="text-center">0{errorSummary.dataError}</TableCell><TableCell></TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </>
        )}
        {mappingTab === 'chi-tiet-loi' && (
          <>
            <div className="mb-4"><h4 className="font-medium text-gray-900">Cập nhật tệp của bạn</h4><p className="text-sm text-gray-500">Kiểm tra và chỉnh sửa dữ liệu bên dưới trước khi tải lại tệp.</p></div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader><TableRow className="bg-gray-50"><TableHead>Số dòng</TableHead><TableHead>Tên cột</TableHead><TableHead>Giá trị</TableHead><TableHead>Loại lỗi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {errorDetails.map((error, index) => (<TableRow key={index}><TableCell>{error.row}</TableCell><TableCell>{error.column}</TableCell><TableCell>{error.value || <span className="text-gray-400 italic">Trống</span>}</TableCell><TableCell className="text-red-600">{error.error}</TableCell></TableRow>))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => { setImportStep('upload'); handleOpenChange(false); }}>Hủy</Button>
        <Button variant="outline" onClick={() => setImportStep('upload')}>Trở lại</Button>
        <Button className="bg-[#167FFC] hover:bg-[#1470E3]" disabled={hasUnmappedRequired} onClick={() => { console.log("Importing..."); handleOpenChange(false); }}>Import</Button>
      </DialogFooter>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {importStep === 'upload' ? uploadStepContent : mappingStepContent}
      </DialogContent>
    </Dialog>
  )
}

export type { ImportDialogProps }
