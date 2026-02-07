"use client"

import { useState } from "react"
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

const SPECIALIZATIONS = [
  "Quản trị hệ thống thông tin",
  "Tin học quản lý",
  "Thống kê",
]

export type ProgramFormValues = {
  specialization: string
  name: string
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
  const [specialization, setSpecialization] = useState("")
  const [errors, setErrors] = useState<{ specialization?: string }>({})

  const resetForm = () => {
    setSpecialization("")
    setErrors({})
  }

  const handleSave = () => {
    const newErrors: { specialization?: string } = {}
    if (!specialization) {
      newErrors.specialization = "Vui lòng chọn chuyên ngành"
    } else if (existingProgramNames.includes(specialization)) {
      newErrors.specialization =
        "Đã tồn tại chương trình đào tạo cho chuyên ngành này. Vui lòng chọn chuyên ngành khác."
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSave({ specialization, name: specialization })
    resetForm()
    onOpenChange(false)
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
              Chuyên ngành<span className="text-red-500">*</span>
            </Label>
            <Select
              value={specialization}
              onValueChange={(value) => {
                setSpecialization(value)
                if (errors.specialization) {
                  setErrors((prev) => ({ ...prev, specialization: undefined }))
                }
              }}
            >
              <SelectTrigger className={`w-full ${errors.specialization ? "border-red-500" : "border-gray-300"}`}>
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
              Tên chương trình đào tạo<span className="text-red-500">*</span>
            </Label>
            <Input
              value={specialization}
              readOnly
              className="w-full border-gray-300 bg-gray-100 text-gray-700"
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
            className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white"
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
