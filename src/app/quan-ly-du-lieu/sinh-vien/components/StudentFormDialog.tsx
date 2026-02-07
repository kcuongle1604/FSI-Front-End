"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Student, UpdateStudentRequest } from "../types"
import { Search, X, Loader2 } from "lucide-react"
import { updateStudent, createStudent, getClasses } from "../student.api"

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null // Nếu null là mode Thêm, có object là mode Sửa
  onSuccess?: () => void // Callback to refresh list after save
}

export default function StudentFormDialog({ open, onOpenChange, student, onSuccess }: StudentFormDialogProps) {
  const isEdit = !!student
  const [formData, setFormData] = useState({
    mssv: "",
    hoTen: "",
    lop: "",
    ngaySinh: "",
    ghiChu: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [classes, setClasses] = useState<any[]>([])

  // Trạng thái hiển thị dropdown lookup cho trường Lớp
  const [showClassLookup, setShowClassLookup] = useState(false)
  // Chuỗi người dùng đang nhập để tìm lớp (khác với lớp đã chọn)
  const [lopSearch, setLopSearch] = useState("")

  const classOptions = classes.map((c: any) => c.class_name || c.name || c)
  const filteredClassOptions = classOptions.filter((lopOption: string) =>
    lopOption.toLowerCase().includes(lopSearch.toLowerCase())
  )

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClasses()
        if (res?.data) {
          setClasses(Array.isArray(res.data) ? res.data : [])
        }
      } catch (err) {
        console.error("Load classes failed", err)
      }
    }

    if (open) {
      fetchClasses()
    }
  }, [open])

  // Convert yyyy-mm-dd to dd/mm/yyyy for display
  const convertISOToDisplay = (isoDate: string): string => {
    if (!isoDate) return ""
    const parts = isoDate.split("-")
    if (parts.length !== 3) return isoDate
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }

  // Reset/Fill form khi props student thay đổi hoặc mở dialog
  useEffect(() => {
    if (student) {
      setFormData({
        mssv: String(student.mssv),
        hoTen: student.hoTen,
        lop: student.lop || "",
        ngaySinh: convertISOToDisplay(student.ngaySinh || ""), // Convert yyyy-mm-dd to dd/mm/yyyy
        ghiChu: student.ghiChu
      })
    } else {
      setFormData({
        mssv: "",
        hoTen: "",
        lop: "",
        ngaySinh: "",
        ghiChu: ""
      })
    }
    // Luôn ẩn dropdown lookup Lớp khi mở/đóng dialog
    setShowClassLookup(false)
    setLopSearch("")
    setError("")
  }, [student, open])

  const handleNgaySinhChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8)
    let formatted = ""
    if (digits.length <= 4) {
      formatted = digits
    } else if (digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}/${digits.slice(4)}`
    } else {
      formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`
    }
    setFormData({ ...formData, ngaySinh: formatted })
  }

  // Convert dd/mm/yyyy to yyyy-mm-dd
  const convertDateToISO = (dateStr: string): string => {
    if (!dateStr) return ""

    // Remove any whitespace
    dateStr = dateStr.trim()

    // Check format dd/mm/yyyy
    if (dateStr.length !== 10 || dateStr[2] !== '/' || dateStr[5] !== '/') {
      console.error('Invalid date format:', dateStr)
      return ""
    }

    const parts = dateStr.split("/")
    if (parts.length !== 3) return ""

    const [day, month, year] = parts

    // Validate parts are numbers
    if (isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
      console.error('Invalid date parts:', { day, month, year })
      return ""
    }

    // Pad with zeros if needed
    const paddedDay = day.padStart(2, '0')
    const paddedMonth = month.padStart(2, '0')

    const isoDate = `${year}-${paddedMonth}-${paddedDay}`
    console.log('Date conversion:', { input: dateStr, output: isoDate })

    return isoDate
  }

  const handleSave = async () => {
    // Validation
    if (!formData.mssv || !formData.hoTen || !formData.lop || !formData.ngaySinh) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc")
      return
    }

    try {
      setLoading(true)
      setError("")

      const isoDate = convertDateToISO(formData.ngaySinh)
      if (!isoDate) {
        setError("Ngày sinh không hợp lệ (dd/mm/yyyy)")
        return
      }

      if (isEdit && student) {
        // Update existing student
        const updateData: UpdateStudentRequest = {
          student_id: student.id, // Must match URL path parameter
          full_name: formData.hoTen,
          dob: isoDate,
          class_name: formData.lop,
          notes: formData.ghiChu || "",
          status: true
        }

        await updateStudent(student.id, updateData)
      } else {
        // Create new student
        const createData = {
          student_id: Number(formData.mssv),
          full_name: formData.hoTen,
          dob: isoDate,
          class_name: formData.lop,
          notes: formData.ghiChu || "",
          status: true
        }

        await createStudent(createData)
      }

      // Success - close dialog and refresh list
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Save student error:", err)
      console.error("Error response data:", err.response?.data)
      console.error("Error response status:", err.response?.status)

      // Format error message
      let errorMsg = "Có lỗi xảy ra khi lưu dữ liệu"

      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // FastAPI validation errors
          errorMsg = err.response.data.detail.map((e: any) =>
            `${e.loc?.join(' → ')}: ${e.msg}`
          ).join(', ')
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail
        }
      }

      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa thông tin Sinh viên" : "Thêm mới Sinh viên"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mssv">MSSV<span className="text-red-500">*</span></Label>
            <Input id="mssv" value={formData.mssv} onChange={(e) => setFormData({ ...formData, mssv: e.target.value })} placeholder="Nhập MSSV" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hoTen">Họ và tên<span className="text-red-500">*</span></Label>
            <Input id="hoTen" value={formData.hoTen} onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })} placeholder="Nhập họ và tên" />
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="lop">Lớp<span className="text-red-500">*</span></Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              {!formData.lop && (
                <Input
                  id="lop"
                  value={lopSearch}
                  onChange={(e) => {
                    const value = e.target.value
                    // Chỉ cập nhật chuỗi tìm kiếm, KHÔNG đổi lớp đã chọn
                    setLopSearch(value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const value = (e.currentTarget.value || "").trim()
                      if (value.length > 0) {
                        setShowClassLookup(true)
                      }
                    }
                  }}
                  onFocus={() => {
                    // Click vào ô là mở danh sách tất cả lớp ngay
                    setShowClassLookup(true)
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      // Nếu chưa chọn lớp nào, blur ra ngoài thì reset lại ô
                      if (!formData.lop) {
                        setLopSearch("")
                      }
                      setShowClassLookup(false)
                    }, 120)
                  }
                  placeholder="Nhập tên lớp"
                  autoComplete="off"
                  className="pr-9"
                />
              )}
              {formData.lop && (
                <div className="w-full pr-9 px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {formData.lop}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, lop: "" })
                        setShowClassLookup(false)
                        setLopSearch("")
                      }}
                      className="hover:text-blue-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>
              )}
            </div>
            {showClassLookup && filteredClassOptions.length > 0 && (
              <div className="absolute top-full left-0 z-30 mt-1 w-full bg-white border border-gray-300 rounded-md shadow max-h-52 overflow-auto">
                {filteredClassOptions.map((lopOption) => (
                  <button
                    type="button"
                    key={lopOption}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      // Chọn xong thì set giá trị, ẩn dropdown và hiển thị chip
                      setFormData({ ...formData, lop: lopOption })
                      setShowClassLookup(false)
                      setLopSearch("")
                    }}
                  >
                    {lopOption}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ngaySinh">Ngày sinh<span className="text-red-500">*</span></Label>
            <Input
              id="ngaySinh"
              value={formData.ngaySinh}
              onChange={(e) => handleNgaySinhChange(e.target.value)}
              placeholder="yyyy/mm/dd"
              inputMode="numeric"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ghiChu">Ghi chú</Label>
            <Input id="ghiChu" value={formData.ghiChu} onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })} placeholder="Nhập ghi chú" />
          </div>
        </div>
        {error && (
          <div className="text-red-600 text-sm px-6">{error}</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Hủy</Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}