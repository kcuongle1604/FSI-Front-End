"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { AxiosError } from "axios"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { api } from "@/lib/api"
import { createTrainingProgram, updateTrainingProgram } from "./program.api"

export type ProgramFormValues = {
  major_id: number
  description?: string
  cohort_ids: number[]
}

type ProgramFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: ProgramFormValues) => void
  initialData?: ProgramFormValues | null
  programId?: number
}

export default function ProgramFormDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  programId,
}: ProgramFormDialogProps) {
  const [majorId, setMajorId] = useState<number | undefined>()
  const [description, setDescription] = useState("")
  const [cohortIds, setCohortIds] = useState<number[]>([])
  const [errors, setErrors] = useState<{ 
    majorId?: string
    submit?: string
    cohortIds?: string 
  }>({})
  
  // API data states
  const [majors, setMajors] = useState<{id: number, name: string}[]>([])
  const [cohorts, setCohorts] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch specializations and cohorts from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch majors (chuyên ngành)
        const majorsRes = await api.get("/api/v1/majors")
        if (majorsRes?.data && Array.isArray(majorsRes.data)) {
          const majorsList = majorsRes.data.map((m: any) => ({
            id: m.major_id,
            name: m.name
          }))
          setMajors(majorsList)
        }
        
        // Fetch cohorts (khóa)
        const cohortsRes = await api.get("/api/v1/cohorts")
        if (cohortsRes?.data && Array.isArray(cohortsRes.data)) {
          const cohortsList = cohortsRes.data.map((c: any) => ({
            id: c.cohort_id,
            name: c.name
          }))
          setCohorts(cohortsList)
        }
      } catch (err) {
        // Fallback to hardcoded data if API fails
        setMajors([
          {id: 1, name: "Quản trị hệ thống thông tin"},
          {id: 2, name: "Tin học quản lý"},
          {id: 3, name: "Thống kê"},
        ])
        setCohorts([
          {id: 40, name: "K40"},
          {id: 41, name: "K41"},
          {id: 42, name: "K42"},
        ])
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const resetForm = () => {
    setMajorId(undefined)
    setDescription("")
    setCohortIds([])
    setErrors({})
  }

  useEffect(() => {
    if (!open) return

    if (initialData) {
      setMajorId(initialData.major_id)
      setDescription(initialData.description || "")
      setCohortIds(Array.isArray(initialData.cohort_ids) ? initialData.cohort_ids : [])
      setErrors({})
      return
    }

    resetForm()
  }, [open, initialData])

  const formatDomainErrorMessage = (message: string): string => {
    if (!message) return message

    let formatted = message

    // Replace major id with major name when backend returns: "chuyên ngành 14"
    formatted = formatted.replace(/chuyên ngành\s+(\d+)/gi, (_, majorIdRaw: string) => {
      const majorIdNum = Number(majorIdRaw)
      const major = majors.find((m) => m.id === majorIdNum)
      if (!major?.name) return `chuyên ngành ${majorIdRaw}`
      return `chuyên ngành ${major.name}`
    })

    // Replace cohort ids with cohort names when backend returns: "khóa 1, 48"
    formatted = formatted.replace(/khóa\s+([\d\s,]+)/gi, (_, cohortsRaw: string) => {
      const ids = cohortsRaw
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item))

      if (ids.length === 0) return `khóa ${cohortsRaw}`

      const mappedNames = ids.map((id) => {
        const cohort = cohorts.find((c) => c.id === id)
        return cohort?.name || String(id)
      })

      return `khóa ${mappedNames.join(", ")}`
    })

    return formatted
  }

  const getBackendErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<any>
    const data = axiosError?.response?.data

    if (Array.isArray(data?.detail)) {
      const lines = data.detail
        .map((item: any) => {
          if (typeof item === "string") return item
          const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : "field"
          const message = item?.msg || "Invalid value"
          return `${String(field)}: ${String(message)}`
        })
        .filter(Boolean)
      if (lines.length > 0) return lines.join("; ")
    }

    if (typeof data?.detail === "string" && data.detail.trim()) {
      return formatDomainErrorMessage(data.detail.trim())
    }
    if (typeof data?.message === "string" && data.message.trim()) {
      return formatDomainErrorMessage(data.message.trim())
    }

    if (typeof axiosError?.message === "string" && axiosError.message.trim()) {
      return axiosError.message.trim()
    }

    return "Không thể lưu chương trình đào tạo. Vui lòng thử lại."
  }

  const handleSave = async () => {
    const newErrors: { 
      majorId?: string
      submit?: string
      cohortIds?: string 
    } = {}
    
    if (!majorId) {
      newErrors.majorId = "Vui lòng chọn chuyên ngành"
    }
    if (cohortIds.length === 0) {
      newErrors.cohortIds = "Vui lòng chọn ít nhất 1 khóa áp dụng"
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      setLoading(true)
      const payload: ProgramFormValues = {
        major_id: majorId!,
        description: description.trim(),
        cohort_ids: cohortIds,
      }
      
      if (programId) {
        await updateTrainingProgram(programId, payload)
      } else {
        await createTrainingProgram(payload)
      }
      
      onSave(payload)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setErrors({ submit: getBackendErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Sửa chương trình đào tạo" : "Thêm mới chương trình đào tạo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Chuyên ngành<span className="text-red-500">*</span>
            </Label>
            <Select
              value={majorId ? String(majorId) : ""}
              onValueChange={(value) => {
                setMajorId(Number(value))
                if (errors.majorId) {
                  setErrors((prev) => ({ ...prev, majorId: undefined }))
                }
              }}
              disabled={loading}
            >
              <SelectTrigger className={`w-full ${errors.majorId ? "border-red-500" : "border-gray-300"}`}>
                <SelectValue placeholder={loading ? "Đang tải..." : "Chọn chuyên ngành"} />
              </SelectTrigger>
              <SelectContent>
                {majors.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.majorId && (
              <p className="text-xs text-red-500">{errors.majorId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Khóa áp dụng
              <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={cohorts.map(c => String(c.id))}
              value={cohortIds.map(id => String(id))}
              onChange={(selectedIdStrings) => {
                const selectedIds = selectedIdStrings.map(idStr => Number(idStr))
                setCohortIds(selectedIds)
                if (errors.cohortIds) {
                  setErrors((prev) => ({ ...prev, cohortIds: undefined }))
                }
              }}
              placeholder={loading ? "Đang tải..." : "Chọn các khóa áp dụng"}
              disabled={loading}
            />
            {errors.cohortIds && (
              <p className="text-xs text-red-500">{errors.cohortIds}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Mô tả
            </Label>
            <Input
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              placeholder="Nhập mô tả"
              className="w-full border-gray-300"
            />
          </div>
        </div>

        {errors.submit && (
          <p className="text-xs text-red-500">{errors.submit}</p>
        )}

        <div className="flex gap-3 pt-6 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
