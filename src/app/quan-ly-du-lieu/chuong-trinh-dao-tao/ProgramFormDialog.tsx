"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"

const SPECIALIZATIONS = [
  "Quản trị hệ thống thông tin",
  "Tin học quản lý",
  "Thống kê",
]

const COURSES = ["48K", "49K", "50K", "51K", "52K"]

export type ProgramFormValues = {
  id?: number
  specialization: string
  appliedCourses: string[]
}

type ProgramFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: ProgramFormValues) => void
  existingProgramNames?: string[]
  initialData?: ProgramFormValues | null
}

export default function ProgramFormDialog({
  open,
  onOpenChange,
  onSave,
  existingProgramNames = [],
  initialData,
}: ProgramFormDialogProps) {
  const [specialization, setSpecialization] = useState("")
  const [appliedCourses, setAppliedCourses] = useState<string[]>([])
  const [errors, setErrors] = useState<{ specialization?: string; appliedCourses?: string }>({})

  useEffect(() => {
    if (open && initialData) {
      setSpecialization(initialData.specialization)
      setAppliedCourses(initialData.appliedCourses)
      setErrors({})
    }
    if (open && !initialData) {
      setSpecialization("")
      setAppliedCourses([])
      setErrors({})
    }
  }, [open, initialData])

  const resetForm = () => {
    setSpecialization("")
    setAppliedCourses([])
    setErrors({})
  }

  const handleSave = () => {
    const newErrors: { specialization?: string; appliedCourses?: string } = {}
    if (!specialization) {
      newErrors.specialization = "Vui lòng chọn chuyên ngành"
    }

    if (appliedCourses.length === 0) {
      newErrors.appliedCourses = "Vui lòng chọn ít nhất một khóa áp dụng"
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSave({ id: initialData?.id, specialization, appliedCourses })
    resetForm()
    onOpenChange(false)
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
              value={specialization}
              disabled={!!initialData}
              onValueChange={(value) => {
                setSpecialization(value)
                if (errors.specialization) {
                  setErrors((prev) => ({ ...prev, specialization: undefined }))
                }
              }}
            >
              <SelectTrigger
                className={`w-full ${errors.specialization ? "border-red-500" : "border-gray-300"} ${initialData ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <SelectValue placeholder="Chọn chuyên ngành" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialization && (
              <p className="text-xs text-red-500">{errors.specialization}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Khóa áp dụng<span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={COURSES}
              value={appliedCourses}
              onChange={(vals) => {
                setAppliedCourses(vals)
                if (errors.appliedCourses) {
                  setErrors((prev) => ({ ...prev, appliedCourses: undefined }))
                }
              }}
              placeholder="Chọn khoá áp dụng"
            />
            {errors.appliedCourses && (
              <p className="text-xs text-red-500">{errors.appliedCourses}</p>
            )}
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
            className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white"
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
