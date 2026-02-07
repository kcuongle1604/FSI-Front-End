"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import { Search, X } from "lucide-react"
import { Certificate, CertificateFormData } from "../types"
import { sampleCertificates } from "../data"

interface CertificateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate?: Certificate | null
  onSubmit: (data: CertificateFormData) => void
}

export default function CertificateFormDialog({
  open,
  onOpenChange,
  certificate,
  onSubmit,
}: CertificateFormDialogProps) {
  const isEdit = !!certificate

  const [formData, setFormData] = useState<CertificateFormData>({
    mssv: certificate?.mssv || "",
    hoLot: certificate?.hoLot || "",
    ten: certificate?.ten || "",
    lop: certificate?.lop || "",
    ngaySinh: certificate?.ngaySinh || "",
    donTN: certificate?.donTN || false,
    kiemDiem: certificate?.kiemDiem || false,
    quanSu: certificate?.quanSu || false,
    theDuc: certificate?.theDuc || false,
    ngoaiNgu: certificate?.ngoaiNgu || false,
    tinhHoc: certificate?.tinhHoc || false,
    ghiChu: certificate?.ghiChu || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [selectedStudent, setSelectedStudent] = useState<Certificate | null>(
    certificate ?? null
  )
  const [studentSearch, setStudentSearch] = useState("")
  const [showStudentLookup, setShowStudentLookup] = useState(false)

  const studentOptions = sampleCertificates

  const filteredStudentOptions = studentOptions.filter((s) => {
    const keyword = studentSearch.trim().toLowerCase()
    if (!keyword) return true
    return `${String(s.mssv)} ${s.hoLot} ${s.ten}`.toLowerCase().includes(keyword)
  })

  useEffect(() => {
    if (certificate) {
      setSelectedStudent(certificate)
      setFormData({
        mssv: certificate.mssv || "",
        hoLot: certificate.hoLot,
        ten: certificate.ten,
        lop: certificate.lop,
        ngaySinh: certificate.ngaySinh,
        donTN: certificate.donTN || false,
        kiemDiem: certificate.kiemDiem || false,
        quanSu: certificate.quanSu || false,
        theDuc: certificate.theDuc || false,
        ngoaiNgu: certificate.ngoaiNgu || false,
        tinhHoc: certificate.tinhHoc || false,
        ghiChu: certificate.ghiChu || "",
      })
    } else {
      setSelectedStudent(null)
      setFormData({
        mssv: "",
        hoLot: "",
        ten: "",
        lop: "",
        ngaySinh: "",
        donTN: false,
        kiemDiem: false,
        quanSu: false,
        theDuc: false,
        ngoaiNgu: false,
        tinhHoc: false,
        ghiChu: "",
      })
    }

    setStudentSearch("")
    setShowStudentLookup(false)
  }, [certificate, open])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!selectedStudent && !String(formData.mssv).trim()) {
      newErrors.mssv = "Sinh viên là bắt buộc"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {certificate ? "Chỉnh sửa thông tin chứng chỉ" : "Thêm mới thông tin chứng chỉ"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Sinh viên */}
          <div className="grid gap-2 relative">
            <Label>
              Sinh viên <span className="text-red-500">*</span>
            </Label>
            {isEdit ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 cursor-default">
                {selectedStudent
                  ? `${selectedStudent.mssv} - ${selectedStudent.hoLot} ${selectedStudent.ten}`
                  : ""}
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  {!selectedStudent && (
                    <Input
                      placeholder="Nhập MSSV/Họ và tên"
                      value={studentSearch}
                      onChange={(e) => {
                        const value = e.target.value
                        setStudentSearch(value)
                        setShowStudentLookup(value.trim().length > 0)
                      }}
                      onClick={() => {
                        if (
                          studentSearch.trim().length > 0 ||
                          filteredStudentOptions.length > 0
                        ) {
                          setShowStudentLookup(true)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          if ((e.currentTarget.value || "").trim().length > 0) {
                            setShowStudentLookup(true)
                          }
                        }
                      }}
                      onBlur={() =>
                        setTimeout(() => {
                          if (!selectedStudent) {
                            setStudentSearch("")
                          }
                          setShowStudentLookup(false)
                        }, 120)
                      }
                      autoComplete="off"
                      className={`pr-9 ${errors.mssv ? "border-red-500" : ""}`}
                    />
                  )}
                  {selectedStudent && (
                    <div className="w-full pr-9 px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {`${selectedStudent.mssv} - ${selectedStudent.hoLot} ${selectedStudent.ten}`}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(null)
                            setStudentSearch("")
                            setShowStudentLookup(false)
                            setFormData({ ...formData, mssv: "" })
                          }}
                          className="hover:text-blue-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    </div>
                  )}
                </div>
                {showStudentLookup && filteredStudentOptions.length > 0 && (
                  <div className="absolute top-full left-0 z-30 mt-1 w-full bg-white border border-gray-300 rounded-md shadow max-h-52 overflow-auto">
                    {filteredStudentOptions.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedStudent(s)
                          setShowStudentLookup(false)
                          setStudentSearch("")
                          setFormData({
                            ...formData,
                            mssv: s.mssv,
                            hoLot: s.hoLot,
                            ten: s.ten,
                            lop: s.lop,
                            ngaySinh: s.ngaySinh,
                          })
                          setErrors((prev) => {
                            const { mssv, ...rest } = prev
                            return rest
                          })
                        }}
                      >
                        {`${s.mssv} - ${s.hoLot} ${s.ten}`}
                      </button>
                    ))}
                  </div>
                )}
                {errors.mssv && !selectedStudent && (
                  <p className="text-red-500 text-xs mt-1">{errors.mssv}</p>
                )}
              </>
            )}
          </div>

          {/* Các loại chứng chỉ */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Các loại chứng chỉ
            </Label>
            <MultiSelect
              options={[
                "Đơn xin công nhận TN",
                "Bản kiểm điểm cá nhân",
                "Cc Quân sự",
                "Cc Thể dục",
                "Cc Ngoại ngữ",
                "Cc Tin học",
              ]}
              value={[
                formData.donTN ? "Đơn xin công nhận TN" : "",
                formData.kiemDiem ? "Bản kiểm điểm cá nhân" : "",
                formData.quanSu ? "Cc Quân sự" : "",
                formData.theDuc ? "Cc Thể dục" : "",
                formData.ngoaiNgu ? "Cc Ngoại ngữ" : "",
                formData.tinhHoc ? "Cc Tin học" : "",
              ].filter(Boolean) as string[]}
              onChange={(selected) => {
                setFormData({
                  ...formData,
                  donTN: selected.includes("Đơn xin công nhận TN"),
                  kiemDiem: selected.includes("Bản kiểm điểm cá nhân"),
                  quanSu: selected.includes("Cc Quân sự"),
                  theDuc: selected.includes("Cc Thể dục"),
                  ngoaiNgu: selected.includes("Cc Ngoại ngữ"),
                  tinhHoc: selected.includes("Cc Tin học"),
                })
              }}
              placeholder="Chọn loại chứng chỉ"
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={handleSubmit}>
            {certificate ? "Cập nhật" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { CertificateFormDialogProps }
