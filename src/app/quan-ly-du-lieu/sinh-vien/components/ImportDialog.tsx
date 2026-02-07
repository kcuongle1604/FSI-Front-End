// Popup Import (Chứa toàn bộ logic phức tạp của import)
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, FileText, Upload, CheckCircle2, Loader2 } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { importStudents } from "../student.api"
import type { ImportResponse, ImportError, ColumnMapping } from "../types"

interface ImportTypeOption {
  value: string
  label: string
}

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess?: () => void
  importTypeOptions?: ImportTypeOption[]
  classOptions?: { value: string; label: string }[]
}

export default function ImportDialog({ open, onOpenChange, onImportSuccess, importTypeOptions, classOptions }: ImportDialogProps) {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importError, setImportError] = useState<string>("")
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'result'>('upload')
  const [mappingTab, setMappingTab] = useState<'anh-xa-cot' | 'tong-quan-loi' | 'chi-tiet-loi'>('anh-xa-cot')
  const [selectedSheet, setSelectedSheet] = useState('Sheet1')
  const [importType, setImportType] = useState<string>(
    importTypeOptions && importTypeOptions.length > 0 ? importTypeOptions[0].value : ""
  )
  const [targetClass, setTargetClass] = useState<string>("")

  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({
    mssv: 'MSSV',
    hoTen: '',
    lop: 'Lớp',
    ngaySinh: 'Ngày sinh',
    ghiChu: 'Ghi chú',
    // Fields for other import types
    hoLot: '',
    ten: '',
    ele1: '',
    ele2: '',
    ec1: '',
    ec2: '',
    b1: '',
  })

  // API integration states
  const [loading, setLoading] = useState(false)
  const [dryRunResult, setDryRunResult] = useState<ImportResponse | null>(null)
  const [importResult, setImportResult] = useState<ImportResponse | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])

  const isAggregateScoreImport = importType === 'diem-tong-hop'
  const isEnglishScoreImport = importType === 'diem-tieng-anh'

  // Cấu hình cột hiển thị & bắt buộc theo loại import
  const mappingFields = isEnglishScoreImport
    ? ([
      { key: 'mssv', label: 'MSSV', required: true },
      { key: 'ele1', label: 'ELE1', required: true },
      { key: 'ele2', label: 'ELE2', required: true },
      { key: 'ec1', label: 'EC1', required: true },
      { key: 'ec2', label: 'EC2', required: true },
      { key: 'b1', label: 'B1', required: true },
    ] as const)
    : isAggregateScoreImport
      ? ([
        { key: 'lop', label: 'Lớp', required: true },
        { key: 'hoLot', label: 'Họ lót', required: true },
        { key: 'ten', label: 'Tên', required: true },
        { key: 'ngaySinh', label: 'Ngày sinh', required: true },
      ] as const)
      : ([
        { key: 'mssv', label: 'MSSV', required: true },
        { key: 'hoTen', label: 'Họ và tên', required: true },
        { key: 'lop', label: 'Lớp', required: true },
        { key: 'ngaySinh', label: 'Ngày sinh', required: true },
        { key: 'ghiChu', label: 'Ghi chú', required: false },
      ] as const)

  // Use actual CSV headers instead of hardcoded values
  const systemColumns = csvHeaders.map(header => ({
    value: header,
    label: header
  }))
  const errorSummary = { valid: 0, notFoundInSystem: 1, duplicateScore: 2, dataError: 3 }
  const errorDetails = [
    { row: 3, column: 'Họ và tên', value: 'Nguyễn Văn', error: 'Giá trị không hợp lệ' },
    { row: 5, column: 'MSSV', value: '', error: 'Thiếu giá trị' },
    { row: 10, column: 'Ngày sinh', value: 'Mười hai tháng 3', error: 'Sai kiểu dữ liệu' },
  ]

  const unmappedRequiredFields = mappingFields.filter(
    (field) => field.required && !columnMappings[field.key]
  )
  const hasUnmappedRequired = unmappedRequiredFields.length > 0
  const allMapped = mappingFields.every((field) => !!columnMappings[field.key])

  // Parse CSV headers when file is selected
  const parseCSVHeaders = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split('\n')
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/\r$/, ''))
        setCsvHeaders(headers)

        // Auto-map if column names match - using correct keys from columnMappings
        const autoMapping: Record<string, string> = {}

        // For student import mode
        if (!isAggregateScoreImport && !isEnglishScoreImport) {
          if (headers.includes('Mã sinh viên')) autoMapping.mssv = 'Mã sinh viên'
          if (headers.includes('MSSV')) autoMapping.mssv = 'MSSV'
          if (headers.includes('Họ và tên')) autoMapping.hoTen = 'Họ và tên'
          if (headers.includes('Lớp')) autoMapping.lop = 'Lớp'
          if (headers.includes('Ngày sinh')) autoMapping.ngaySinh = 'Ngày sinh'
          if (headers.includes('Ghi chú')) autoMapping.ghiChu = 'Ghi chú'
        }

        setColumnMappings(prev => ({ ...prev, ...autoMapping }))
      }
    } catch (error) {
      console.error('Error parsing CSV headers:', error)
    }
  }

  const handleFileSelect = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setImportError("File vượt quá dung lượng cho phép. Giới hạn tối đa: 50 MB.")
      setImportFile(null)
      return
    }

    const lowerName = file.name.toLowerCase()
    if (!lowerName.endsWith('.csv')) {
      setImportError("Định dạng file không hợp lệ, chỉ chấp nhận .csv")
      setImportFile(null)
      return
    }

    setImportError("")
    setImportFile(file)

    // Parse CSV headers
    await parseCSVHeaders(file)
  }

  const handleDryRun = async () => {
    if (!importFile) return

    try {
      setLoading(true)
      setImportError("")

      // Transform frontend keys to backend keys
      const keyMapping: Record<string, string> = {
        'mssv': 'student_id',
        'hoTen': 'full_name',
        'lop': 'class_name',
        'ngaySinh': 'dob',
        'ghiChu': 'notes'
      }

      // Build column mapping for API with transformed keys
      const apiColumnMapping: ColumnMapping = {}
      Object.entries(columnMappings).forEach(([frontendKey, csvColumn]) => {
        if (csvColumn) {
          const backendKey = keyMapping[frontendKey] || frontendKey
          apiColumnMapping[backendKey] = csvColumn
        }
      })

      const response = await importStudents(importFile, true, apiColumnMapping)
      setDryRunResult(response.data)

      // Switch to error overview tab if there are errors
      if (response.data.errors && response.data.errors.length > 0) {
        setMappingTab('chi-tiet-loi')
      } else {
        setMappingTab('tong-quan-loi')
      }
    } catch (error: any) {
      setImportError(error.response?.data?.detail || "Lỗi khi kiểm tra file. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleActualImport = async () => {
    if (!importFile) return

    try {
      setLoading(true)
      setImportError("")

      // Transform frontend keys to backend keys
      const keyMapping: Record<string, string> = {
        'mssv': 'student_id',
        'hoTen': 'full_name',
        'lop': 'class_name',
        'ngaySinh': 'dob',
        'ghiChu': 'notes'
      }

      // Build column mapping for API with transformed keys
      const apiColumnMapping: ColumnMapping = {}
      Object.entries(columnMappings).forEach(([frontendKey, csvColumn]) => {
        if (csvColumn) {
          // Convert frontend key to backend key
          const backendKey = keyMapping[frontendKey] || frontendKey
          apiColumnMapping[backendKey] = csvColumn
        }
      })

      console.log('🚀 Import Request:', {
        file: importFile.name,
        dry_run: false,
        column_mapping: apiColumnMapping
      })

      const response = await importStudents(importFile, false, apiColumnMapping)
      setImportResult(response.data)
      setImportStep('result')

      // Call success callback to refresh the student list
      if (onImportSuccess) {
        onImportSuccess()
      }
    } catch (error: any) {
      console.error("❌ Import error:", error)
      console.error("❌ Error response:", error.response?.data)
      setImportError(error.response?.data?.detail || "Lỗi khi import. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset all states
      setImportFile(null);
      setImportError("");
      setImportStep('upload');
      setMappingTab('anh-xa-cot');
      setDryRunResult(null);
      setImportResult(null);
      setColumnMappings({
        student_id: '',
        full_name: '',
        class_name: '',
        dob: ''
      });
      setCsvHeaders([]);
    }
  }

  const uploadStepContent = (
    <>
      <DialogHeader>
        <DialogTitle>Tải tệp lên</DialogTitle>
        <DialogDescription>Chọn file CSV chứa dữ liệu sinh viên</DialogDescription>
      </DialogHeader>
      <div className="pt-0 pb-4">
        {(importTypeOptions && importTypeOptions.length > 0) || (classOptions && classOptions.length > 0) ? (
          <div className="flex items-center justify-end gap-2 mt-2 mb-2">
            {importTypeOptions && importTypeOptions.length > 0 && (
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger className="h-8 w-auto min-w-[130px]">
                  <SelectValue placeholder="Loại import" />
                </SelectTrigger>
                <SelectContent>
                  {importTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {classOptions && classOptions.length > 0 && (
              <Select value={targetClass} onValueChange={setTargetClass}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Lớp" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : null}
        {importError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
            <AlertCircle className="h-4 w-4" /><span>{importError}</span>
          </div>
        )}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${importError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const file = e.dataTransfer.files?.[0]
            if (file) {
              handleFileSelect(file)
            }
          }}
        >
          <div className="flex justify-center mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${importFile ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {importFile ? <FileText className="h-5 w-5 text-blue-600" /> : <Upload className="h-5 w-5 text-gray-500" />}
            </div>
          </div>
          {importFile ? (
            <>
              <p className="text-gray-800 font-medium mb-1">{importFile.name}</p>
              <p className="text-xs text-gray-500 mb-3">Định dạng CSV (.csv), {(importFile.size / 1024).toFixed(2)}KB</p>
            </>
          ) : (
            <>
              <p className="text-gray-800 font-medium mb-1">Chọn một tệp hoặc kéo và thả vào đây</p>
              <p className="text-xs text-gray-500 mb-3">Định dạng CSV (.csv), dung lượng tối đa 50MB</p>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'; input.accept = '.csv'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) {
                handleFileSelect(file)
              }
            }
            input.click()
          }}>Chọn tệp</Button>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => handleOpenChange(false)}>Hủy</Button>
        <Button
          className="bg-[#167FFC] hover:bg-[#1470E3]"
          disabled={!importFile || !!importError}
          onClick={() => { setImportStep('mapping'); setMappingTab('anh-xa-cot') }}
        >
          Tiếp
        </Button>
      </DialogFooter>
    </>
  )

  const mappingStepContent = (
    <>
      <DialogHeader className="pb-1">
        <DialogTitle>Xác minh tệp – Ánh xạ cột</DialogTitle>
      </DialogHeader>
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button className={`pb-1 text-sm font-medium border-b-2 transition-colors ${mappingTab === 'anh-xa-cot' ? 'border-[#167FFC] text-[#167FFC]' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setMappingTab('anh-xa-cot')}>Ánh xạ cột</button>
          <button className={`pb-1 text-sm font-medium border-b-2 transition-colors ${mappingTab === 'tong-quan-loi' ? 'border-[#167FFC] text-[#167FFC]' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setMappingTab('tong-quan-loi')}>Tổng quan</button>
          <button className={`pb-1 text-sm font-medium border-b-2 transition-colors ${mappingTab === 'chi-tiet-loi' ? 'border-[#167FFC] text-[#167FFC]' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setMappingTab('chi-tiet-loi')}>Chi tiết lỗi ({errorDetails.length})</button>
        </div>
      </div>
      {/* Vùng giữa: chiếm phần còn lại, chỉ bảng bên trong được scroll */}
      <div className="py-0 flex-1 flex flex-col min-h-0">
        {mappingTab === 'anh-xa-cot' && (
          <>
            <div className="flex items-center justify-between mt-1 mb-2 shrink-0">
              {hasUnmappedRequired ? (
                <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="h-4 w-4" /><span>Bạn còn {unmappedRequiredFields.length} cột chưa được ghép.</span></div>
              ) : (
                <div className="flex items-center gap-2 text-green-600 text-sm"><CheckCircle2 className="h-4 w-4" /><span>Tất cả các cột bắt buộc đã được ghép.</span></div>
              )}
              <div className="flex items-center gap-2">
                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Sheet1">Sheet1</SelectItem><SelectItem value="Sheet2">Sheet2</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
              {/* Header cố định */}
              <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-3">
                <div className="text-sm font-semibold text-foreground px-4 py-3">Trường hệ thống</div>
                <div className="text-sm font-semibold text-foreground px-4 py-3">Cột trong CSV</div>
                <div className="text-sm font-semibold text-foreground px-4 py-3 text-center">Trạng thái</div>
              </div>
              {/* Body cuộn */}
              <div className="flex-1 overflow-y-auto">
                <Table>
                  <TableBody>
                    {mappingFields.map((field) => (
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
            </div>
          </>
        )}
        {mappingTab === 'tong-quan-loi' && (
          <>
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold pl-4">Mục</TableHead>
                      <TableHead className="text-center font-semibold">Số lượng</TableHead>
                      <TableHead className="font-semibold">Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="pl-4">Hợp lệ</TableCell>
                      <TableCell className="text-center">{errorSummary.valid}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Không tìm thấy Sinh viên trong hệ thống</TableCell>
                      <TableCell className="text-center">0{errorSummary.notFoundInSystem}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Thông tin Điểm trùng nhau trong tệp</TableCell>
                      <TableCell className="text-center">0{errorSummary.duplicateScore}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Lỗi dữ liệu khác</TableCell>
                      <TableCell className="text-center">0{errorSummary.dataError}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
        {mappingTab === 'chi-tiet-loi' && (
          <>
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold pl-4">Số dòng</TableHead>
                      <TableHead className="font-semibold">Tên cột</TableHead>
                      <TableHead className="font-semibold">Giá trị</TableHead>
                      <TableHead className="font-semibold">Loại lỗi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorDetails.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="pl-4">{error.row}</TableCell>
                        <TableCell>{error.column}</TableCell>
                        <TableCell>{error.value || <span className="text-gray-400 italic">Trống</span>}</TableCell>
                        <TableCell className="text-red-600">{error.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
        {mappingTab === 'tong-quan-loi' && (
          <>
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 mt-2">
              <div className="flex-1 overflow-y-auto">
                {dryRunResult ? (
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold pl-4">Mục</TableHead>
                        <TableHead className="text-center font-semibold">Số lượng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="pl-4">Trạng thái</TableCell>
                        <TableCell className="text-center font-medium">{dryRunResult.status}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-4">Số bản ghi hợp lệ</TableCell>
                        <TableCell className="text-center text-green-600 font-medium">{dryRunResult.success_count}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-4">Số bản ghi lỗi</TableCell>
                        <TableCell className="text-center text-red-600 font-medium">{dryRunResult.failure_count}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-4" colSpan={2}>
                          <div className="text-sm text-gray-600">{dryRunResult.message}</div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p>Nhấn "Kiểm tra" để xem tổng quan kết quả</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {mappingTab === 'chi-tiet-loi' && (
          <>
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 mt-2">
              <div className="flex-1 overflow-y-auto">
                {errorDetails.length > 0 ? (
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold pl-4">Dòng</TableHead>
                        <TableHead className="font-semibold">Cột</TableHead>
                        <TableHead className="font-semibold">Giá trị</TableHead>
                        <TableHead className="font-semibold">Lỗi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errorDetails.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell className="pl-4">{error.row}</TableCell>
                          <TableCell>{error.column}</TableCell>
                          <TableCell>{error.value || <span className="text-gray-400 italic">Trống</span>}</TableCell>
                          <TableCell className="text-red-600">{error.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {dryRunResult ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <p>Không có lỗi. Dữ liệu hợp lệ!</p>
                      </div>
                    ) : (
                      <p>Nhấn "Kiểm tra" để xem chi tiết lỗi (nếu có)</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {importError && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <AlertCircle className="h-4 w-4" /><span>{importError}</span>
        </div>
      )}
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => { setImportStep('upload'); handleOpenChange(false); }}>Hủy</Button>
        <Button variant="outline" onClick={() => setImportStep('upload')}>Trở lại</Button>
        <Button
          className="bg-[#167FFC] hover:bg-[#1470E3]"
          disabled={hasUnmappedRequired || loading}
          onClick={handleActualImport}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang import...
            </>
          ) : (
            'Import'
          )}
        </Button>
      </DialogFooter>
    </>
  )

  const resultStepContent = (
    <>
      <DialogHeader>
        <DialogTitle>Kết quả Import</DialogTitle>
      </DialogHeader>
      <div className="py-6">
        {importResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {importResult.failure_count === 0 ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <AlertCircle className="h-16 w-16 text-amber-500" />
              )}
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">{importResult.message}</p>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Thành công</p>
                  <p className="text-2xl font-bold text-green-600">{importResult.success_count}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Thất bại</p>
                  <p className="text-2xl font-bold text-red-600">{importResult.failure_count}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={() => handleOpenChange(false)}>Đóng</Button>
      </DialogFooter>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={importStep === 'mapping' ? "sm:max-w-[700px] max-h-[90vh] h-[560px] flex flex-col" : "sm:max-w-[425px]"}>
        {importStep === 'upload' && uploadStepContent}
        {importStep === 'mapping' && mappingStepContent}
        {importStep === 'result' && resultStepContent}
      </DialogContent>
    </Dialog>
  )
}