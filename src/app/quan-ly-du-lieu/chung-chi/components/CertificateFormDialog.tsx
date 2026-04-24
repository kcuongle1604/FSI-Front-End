"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import { api } from "@/lib/api"
import { Certificate, StudentCertificateCreatePayload } from "../types"
import { sampleCertificates } from "../data"
import { MultiSelect } from "@/components/ui/multi-select"

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

  const [selectedCertificateValues, setSelectedCertificateValues] = useState<string[]>([])
  const [existingCertificateIds, setExistingCertificateIds] = useState<number[]>([])
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
    if (!open) return
    if (!certificate?.id) {
      setExistingCertificateIds([])
      return
    }

    const studentId = Number(certificate.id)
    if (!Number.isFinite(studentId)) {
      setExistingCertificateIds([])
      return
    }

    const getListFromPayload = (payload: any): any[] => {
      if (Array.isArray(payload)) return payload
      if (!payload || typeof payload !== "object") return []
      const candidates = [payload.items, payload.data, payload.results, payload.rows]
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate
      }
      return []
    }

    const readCertificateId = (row: any): number | null => {
      const direct = row?.certificate_id ?? row?.certificateId ?? row?.certificateID ?? row?.id
      const nested = row?.certificate?.certificate_id ?? row?.certificate?.id
      const value = direct ?? nested
      const numeric = Number(value)
      return Number.isFinite(numeric) ? numeric : null
    }

    const fetchExistingStudentCertificates = async () => {
      const candidates: Array<() => Promise<any>> = [
        () => api.get(`/api/v1/student-certificates`, { params: { student_id: studentId } }),
        () => api.get(`/api/v1/student-certificates`, { params: { studentId } }),
        () => api.get(`/api/v1/student-certificates/by-student/${studentId}`),
        () => api.get(`/api/v1/student-certificates/student/${studentId}`),
        () => api.get(`/api/v1/students/${studentId}/certificates`),
      ]

      for (const run of candidates) {
        try {
          const res = await run()
          const list = getListFromPayload(res?.data)
          const ids = Array.from(
            new Set(
              list
                .map(readCertificateId)
                .filter((id): id is number => typeof id === "number")
            )
          )
          setExistingCertificateIds(ids)
          return
        } catch (error: any) {
          const status = Number(error?.response?.status)
          if ([404, 405].includes(status)) continue
          // If backend doesn't support this endpoint, keep silent and don't block dialog
          setExistingCertificateIds([])
          return
        }
      }

      setExistingCertificateIds([])
    }

    void fetchExistingStudentCertificates()
  }, [open, certificate?.id])

  useEffect(() => {
    if (certificate) {
      setSelectedStudent(certificate)
      setNote(certificate.ghiChu || "")
    } else {
      setSelectedStudent(null)
      setNote("")
    }

    setSelectedCertificateValues([])
    setExistingCertificateIds([])
    setStudentSearch("")
    setShowStudentLookup(false)
    setErrors({})
  }, [certificate, open])

  useEffect(() => {
    if (!open) return
    if (!isEdit) return
    if (!Array.isArray(existingCertificateIds) || existingCertificateIds.length === 0) {
      setSelectedCertificateValues([])
      return
    }

    const byId = new Map(certificateOptions.map((item) => [item.id, item]))
    const existingValues = existingCertificateIds
      .map((id) => byId.get(id))
      .filter((item): item is CertificateOption => Boolean(item))
      .map((item) => `${item.id} - ${item.label}`)

    setSelectedCertificateValues(existingValues)
  }, [open, isEdit, existingCertificateIds, certificateOptions])

  useEffect(() => {
    if (!open) return
    if (!isEdit || !certificate) return
    if (existingCertificateIds.length > 0) return
    if (selectedCertificateValues.length > 0) return
    if (certificateOptions.length === 0) return

    const normalizeText = (value: string): string =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")

    const matchesAny = (normalized: string, tokens: string[]) =>
      tokens.some((token) => normalized.includes(normalizeText(token)))

    const pickByPredicate = (predicate: (normalizedLabel: string) => boolean) => {
      const found = certificateOptions.find((option) => predicate(normalizeText(option.label)))
      return found ? `${found.id} - ${found.label}` : null
    }

    const fallbackValues: string[] = []

    if (certificate.quanSu) {
      const picked = pickByPredicate((label) => matchesAny(label, ["quansu", "military"]))
      if (picked) fallbackValues.push(picked)
    }
    if (certificate.theDuc) {
      const picked = pickByPredicate((label) => matchesAny(label, ["theduc", "physical", "pe"]))
      if (picked) fallbackValues.push(picked)
    }
    if (certificate.ngoaiNgu) {
      const picked = pickByPredicate((label) => matchesAny(label, ["ngoaingu", "foreign", "english", "language", "toeic", "ielts"]))
      if (picked) fallbackValues.push(picked)
    }
    if (certificate.tinhHoc) {
      const picked = pickByPredicate((label) => matchesAny(label, ["tinhoc", "tinhhoc", "it", "computer", "mos"]))
      if (picked) fallbackValues.push(picked)
    }

    if (fallbackValues.length > 0) {
      setSelectedCertificateValues(Array.from(new Set(fallbackValues)))
    }
  }, [
    open,
    isEdit,
    certificate,
    existingCertificateIds.length,
    selectedCertificateValues.length,
    certificateOptions,
  ])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!selectedStudent?.id) {
      newErrors.mssv = "Sinh viên là bắt buộc"
    }
    if (selectedCertificateValues.length === 0) {
      newErrors.certificate_id = "Chứng chỉ là bắt buộc"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !selectedStudent?.id) return

    const studentId = Number(selectedStudent.id)
    if (!Number.isFinite(studentId)) {
      setErrors((prev) => ({
        ...prev,
        mssv: "Sinh viên không hợp lệ",
      }))
      return
    }

    const parseCertificateId = (value: string) => {
      // MultiSelect stores strings; we keep a user-friendly value like "<id> - <name>"
      const idPart = String(value).split(" - ")[0]
      const numeric = Number(idPart)
      return Number.isFinite(numeric) ? numeric : null
    }

    const certificateIds = Array.from(
      new Set(
        selectedCertificateValues
          .map(parseCertificateId)
          .filter((id): id is number => typeof id === "number")
      )
    )

    if (certificateIds.length === 0) {
      setErrors((prev) => ({
        ...prev,
        certificate_id: "Chứng chỉ không hợp lệ",
      }))
      return
    }

    try {
      setSubmitting(true)
      const existingSet = new Set(existingCertificateIds)
      const toAdd = isEdit ? certificateIds.filter((id) => !existingSet.has(id)) : certificateIds

      if (toAdd.length === 0) {
        onOpenChange(false)
        return
      }

      for (const certificateId of toAdd) {
        try {
          await onSubmit({
            student_id: studentId,
            certificate_id: certificateId,
            note: note.trim() || undefined,
          })
        } catch (error: any) {
          const message = String(error?.message || "")
          // Only in edit mode: backend may reject duplicates (409); treat as a no-op and continue.
          if (isEdit && (message.toLowerCase().includes("da co chung chi") || message.includes("đã có chứng chỉ"))) {
            continue
          }
          throw error
        }
      }
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
            {certificate ? "Chỉnh sửa chứng chỉ cho sinh viên" : "Thêm mới thông tin chứng chỉ"}
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
            <div className={errors.certificate_id ? "rounded-md border border-red-500" : ""}>
              <MultiSelect
                options={certificateOptions.map((item) => `${item.id} - ${item.label}`)}
                value={selectedCertificateValues}
                onChange={(values) => {
                  if (isEdit && existingCertificateIds.length > 0) {
                    const existingValueSet = new Set(
                      existingCertificateIds
                        .map((id) => {
                          const option = certificateOptions.find((item) => item.id === id)
                          return option ? `${option.id} - ${option.label}` : null
                        })
                        .filter((value): value is string => Boolean(value))
                    )
                    const next = Array.from(new Set([...values, ...existingValueSet]))
                    setSelectedCertificateValues(next)
                  } else {
                    setSelectedCertificateValues(values)
                  }
                  if (errors.certificate_id) {
                    setErrors((prev) => {
                      const { certificate_id, ...rest } = prev
                      return rest
                    })
                  }
                }}
                placeholder={
                  loadingCertificateOptions
                    ? "Đang tải danh sách chứng chỉ..."
                    : "Chọn chứng chỉ"
                }
                disabled={loadingCertificateOptions || submitting}
              />
            </div>
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
