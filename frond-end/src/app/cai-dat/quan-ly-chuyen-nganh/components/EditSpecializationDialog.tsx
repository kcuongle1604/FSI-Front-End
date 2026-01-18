"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const BATCHES = ["48K", "49K", "50K", "51K", "52K"]

type FormData = {
  code: string
  name: string
  batches: string[]
}

type Specialization = {
  id: number
  code: string
  name: string
  batches: string[]
}

type EditSpecializationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  specialization?: Specialization
  onUpdate?: (data: FormData) => void
}

export function EditSpecializationDialog({ open, onOpenChange, specialization, onUpdate }: EditSpecializationDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    batches: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (specialization && open) {
      const newFormData = {
        code: specialization.code,
        name: specialization.name,
        batches: specialization.batches,
      }
      setFormData(newFormData)
      setErrors({})
    }
  }, [specialization, open])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const handleBatchToggle = (batch: string) => {
    setFormData(prev => ({
      ...prev,
      batches: prev.batches.includes(batch)
        ? prev.batches.filter(b => b !== batch)
        : [...prev.batches, batch]
    }))
  }

  const handleUpdate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code) newErrors.code = "Vui lòng nhập mã chuyên ngành"
    if (!formData.name) newErrors.name = "Vui lòng nhập tên chuyên ngành"
    if (formData.batches.length === 0) newErrors.batches = "Vui lòng chọn ít nhất một khóa"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    if (onUpdate) {
      onUpdate(formData)
    }

    setFormData({
      code: "",
      name: "",
      batches: [],
    })
    setErrors({})

    onOpenChange(false)
  }

  const handleCancel = () => {
    setFormData({
      code: "",
      name: "",
      batches: [],
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chuyên ngành</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-gray-800">
              Mã chuyên ngành<span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              type="text"
              placeholder="Nhập mã chuyên ngành"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              className={`w-full border-gray-300 ${errors.code ? "border-red-500" : ""}`}
            />
            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-800">
              Tên chuyên ngành<span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nhập tên chuyên ngành"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full border-gray-300 ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Batches */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Khóa áp dụng<span className="text-red-500">*</span>
            </Label>
            <div className={`border border-gray-300 rounded-lg p-3 space-y-2 bg-white`}>
              {BATCHES.map((batch) => (
                <div key={batch} className="flex items-center gap-2">
                  <Checkbox
                    id={batch}
                    checked={formData.batches.includes(batch)}
                    onCheckedChange={() => handleBatchToggle(batch)}
                  />
                  <Label htmlFor={batch} className="text-sm font-normal text-gray-700 cursor-pointer">
                    {batch}
                  </Label>
                </div>
              ))}
            </div>
            {errors.batches && <p className="text-xs text-red-500">{errors.batches}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdate}
            className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white"
          >
            Cập nhật
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
