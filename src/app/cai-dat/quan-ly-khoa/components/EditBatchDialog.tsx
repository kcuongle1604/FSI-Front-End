"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Batch = {
  id: number
  code: string
  startYear: string
  endYear: string
}

interface EditBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batch?: Batch
  onUpdate: (data: { code: string; startYear: string; endYear: string }) => void
}

type FormData = {
  code: string
  startYear: string
  endYear: string
}

const initialFormData: FormData = {
  code: "",
  startYear: "",
  endYear: "",
}

export function EditBatchDialog({ open, onOpenChange, batch, onUpdate }: EditBatchDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    if (open && batch) {
      setFormData({
        code: batch.code,
        startYear: batch.startYear,
        endYear: batch.endYear,
      })
    }
  }, [batch, open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const processedValue = name === "startYear" || name === "endYear"
      ? value.replace(/\D/g, "").slice(0, 4)
      : value
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Mã khoá không được để trống"
    }

    if (!formData.startYear.trim()) {
      newErrors.startYear = "Năm bắt đầu không được để trống"
    }

    if (!formData.endYear.trim()) {
      newErrors.endYear = "Năm kết thúc không được để trống"
    }

    if (formData.startYear && formData.startYear.length !== 4) {
      newErrors.startYear = "Năm bắt đầu phải gồm 4 chữ số"
    }

    if (formData.endYear && formData.endYear.length !== 4) {
      newErrors.endYear = "Năm kết thúc phải gồm 4 chữ số"
    }

    if (!newErrors.startYear && !newErrors.endYear) {
      const start = parseInt(formData.startYear, 10)
      const end = parseInt(formData.endYear, 10)
      if (!Number.isNaN(start) && !Number.isNaN(end) && start > end) {
        newErrors.endYear = "Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onUpdate(formData)
      setFormData(initialFormData)
      setErrors({})
      onOpenChange(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData(initialFormData)
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khoá</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Mã khoá <span className="text-red-500">*</span>
            </Label>
            <Input
              name="code"
              placeholder="Nhập mã khoá"
              value={formData.code}
              onChange={handleInputChange}
              className="h-9"
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Năm bắt đầu <span className="text-red-500">*</span>
            </Label>
            <Input
              name="startYear"
              placeholder="Nhập năm bắt đầu"
              value={formData.startYear}
              onChange={handleInputChange}
              className="h-9"
            />
            {errors.startYear && (
              <p className="text-sm text-red-500">{errors.startYear}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Năm kết thúc <span className="text-red-500">*</span>
            </Label>
            <Input
              name="endYear"
              placeholder="Nhập năm kết thúc"
              value={formData.endYear}
              onChange={handleInputChange}
              className="h-9"
            />
            {errors.endYear && (
              <p className="text-sm text-red-500">{errors.endYear}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="h-9"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9"
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type { EditBatchDialogProps };
