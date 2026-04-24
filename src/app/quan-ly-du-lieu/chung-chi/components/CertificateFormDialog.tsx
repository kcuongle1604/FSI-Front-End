"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { api } from "@/lib/api"
import { Certificate, StudentCertificateCreatePayload } from "../types"
import { sampleCertificates } from "../data"

interface CertificateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate?: Certificate | null
  onSubmit: (data: StudentCertificateCreatePayload) => Promise<void>
  studentOptions?: Certificate[]
}

type CertificateOption = {
  id: number
  label: string
}

export default function CertificateFormDialog({
  open,
  onOpenChange,
  certificate,
  onSubmit,
  studentOptions,
}: CertificateFormDialogProps) {
  const isEdit = !!certificate

  const [selectedCertificateId, setSelectedCertificateId] = useState<string>("")
  const [note, setNote] = useState("")
  const [certificateOptions, setCertificateOptions] = useState<CertificateOption[]>([])
  const [loadingCertificateOptions, setLoadingCertificateOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [selectedStudent, setSelectedStudent] = useState<Certificate | null>(
    certificate ?? null
  )
  const [studentSearch, setStudentSearch] = useState("")
  const [showStudentLookup, setShowStudentLookup] = useState(false)

  const studentLookupOptions = studentOptions ?? sampleCertificates

  const filteredStudentOptions = studentLookupOptions.filter((s) => {
    const keyword = studentSearch.trim().toLowerCase()
    if (!keyword) return true
    return `${String(s.mssv)} ${s.hoLot} ${s.ten}`.toLowerCase().includes(keyword)
  })

  useEffect(() => {
    if (!open) return

    const fetchCertificateOptions = async () => {
      try {
        setLoadingCertificateOptions(true)
        const all: CertificateOption[] = []
        const size = 100
        let page = 1

        while (true) {
          const res = await api.get<any>("/api/v1/certificates", { params: { page, size } })
          const payload = res.data
          const list = Array.isArray(payload)
            ? payload
            : payload.items || payload.data || payload.results || []
          const rawPageItems = Array.isArray(list) ? list : []

          const mapped: CertificateOption[] = rawPageItems
            .map((item: any) => {
              const id = Number(item.id ?? item.certificate_id)
              const label = String(item.name ?? item.code ?? item.certificate_name ?? "").trim()
              if (!Number.isFinite(id) || !label) return null
              return { id, label }
            })
            .filter((item: CertificateOption | null): item is CertificateOption => item !== null)

          all.push(...mapped)

          if (rawPageItems.length < size) break
          page += 1
        }

        const uniqueOptions = Array.from(new Map(all.map((item) => [item.id, item])).values())
        setCertificateOptions(uniqueOptions)
      } catch {
        setCertificateOptions([])
      } finally {
        setLoadingCertificateOptions(false)
      }
    }

    fetchCertificateOptions()
  }, [open])

  useEffect(() => {
    if (certificate) {
      setSelectedStudent(certificate)
      setNote(certificate.ghiChu || "")
    } else {
      setSelectedStudent(null)
      setNote("")
    }

    setSelectedCertificateId("")
    setStudentSearch("")
    setShowStudentLookup(false)
    setErrors({})
  }, [certificate, open])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!selectedStudent?.id) {
      newErrors.mssv = "Sinh viên là bắt buộc"
    }
    if (!selectedCertificateId) {
      newErrors.certificate_id = "Chứng chỉ là bắt buộc"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !selectedStudent?.id) return

    const studentId = Number(selectedStudent.id)
    const certificateId = Number(selectedCertificateId)
    if (!Number.isFinite(studentId) || !Number.isFinite(certificateId)) {
      setErrors((prev) => ({
        ...prev,
        mssv: !Number.isFinite(studentId) ? "Sinh viên không hợp lệ" : prev.mssv,
        certificate_id: !Number.isFinite(certificateId) ? "Chứng chỉ không hợp lệ" : prev.certificate_id,
      }))
      return
    }

    try {
      setSubmitting(true)
      await onSubmit({
        student_id: studentId,
        certificate_id: certificateId,
        note: note.trim() || undefined,
      })
      onOpenChange(false)
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        detail: error?.message || "Không thể thêm chứng chỉ cho sinh viên.",
      }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {certificate ? "Thêm chứng chỉ cho sinh viên" : "Thêm mới thông tin chứng chỉ"}
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

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Chứng chỉ <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedCertificateId} onValueChange={(value) => {
              setSelectedCertificateId(value)
              if (errors.certificate_id) {
                setErrors((prev) => {
                  const { certificate_id, ...rest } = prev
                  return rest
                })
              }
            }}>
              <SelectTrigger className={errors.certificate_id ? "border-red-500" : ""}>
                <SelectValue placeholder={loadingCertificateOptions ? "Đang tải danh sách chứng chỉ..." : "Chọn chứng chỉ"} />
              </SelectTrigger>
              <SelectContent>
                {certificateOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.certificate_id && <p className="text-red-500 text-xs mt-1">{errors.certificate_id}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Ghi chú</Label>
            <Input
              placeholder="Ví dụ: TOEIC 650, MOS Word"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {errors.detail && <p className="text-red-500 text-xs mt-1">{errors.detail}</p>}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={handleSubmit} disabled={submitting || loadingCertificateOptions}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { CertificateFormDialogProps }
