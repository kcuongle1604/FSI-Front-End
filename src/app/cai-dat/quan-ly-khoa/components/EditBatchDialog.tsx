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
}

interface EditBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batch?: Batch
  onUpdate: (data: { code: string }) => void
}

type FormData = {
  code: string
}

const initialFormData: FormData = {
  code: "",
}

export function EditBatchDialog({ open, onOpenChange, batch, onUpdate }: EditBatchDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    if (open && batch) {
      setFormData({
        code: batch.code,
      })
    }
  }, [batch, open])

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Mã khoá không được để trống"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
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
