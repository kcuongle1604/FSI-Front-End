"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { api } from "@/lib/api"

export type ProgramFormValues = {
  name: string
  major_id?: number
  description?: string
  cohort_ids: number[]
}

type ProgramFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: ProgramFormValues) => void
  existingProgramNames?: string[]
}

export default function ProgramFormDialog({
  open,
  onOpenChange,
  onSave,
  existingProgramNames = [],
}: ProgramFormDialogProps) {
  const [majorId, setMajorId] = useState<number | undefined>()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [cohortIds, setCohortIds] = useState<number[]>([])
  const [errors, setErrors] = useState<{ 
    majorId?: string
    name?: string
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
    setName("")
    setDescription("")
    setCohortIds([])
    setErrors({})
  }

  const handleSave = async () => {
    const newErrors: { 
      majorId?: string
      name?: string
      cohortIds?: string 
    } = {}
    
    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập tên chương trình đào tạo"
    } else if (existingProgramNames.includes(name.trim())) {
      newErrors.name = "Tên chương trình đào tạo đã tồn tại. Vui lòng chọn tên khác."
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      setLoading(true)
      const payload: any = {
        name: name.trim(),
      }
      
      if (majorId) payload.major_id = majorId
      if (description.trim()) payload.description = description.trim()
      if (cohortIds.length > 0) payload.cohort_ids = cohortIds
      
      const response = await api.post("/api/v1/training-programs", payload)
      
      onSave(payload)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setErrors({ name: "Không thể tạo chương trình đào tạo. Vui lòng thử lại." })
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm mới chương trình đào tạo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Chuyên ngành
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
              Tên chương trình đào tạo<span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }
              }}
              placeholder="Nhập tên chương trình đào tạo"
              className={`w-full ${errors.name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Mô tả
            </Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả"
              className="w-full border-gray-300"
            />
          </div>
        </div>

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
