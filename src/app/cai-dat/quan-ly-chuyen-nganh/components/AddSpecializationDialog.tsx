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

type AddSpecializationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (data: { code: string; name: string }) => Promise<boolean> | boolean
}

export function AddSpecializationDialog({ open, onOpenChange, onAdd }: AddSpecializationDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const handleAdd = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Vui lòng nhập mã chuyên ngành"
    } else if (!/^\d+$/.test(formData.code.trim())) {
      newErrors.code = "Vui lòng chỉ nhập số"
    }
    if (!formData.name) newErrors.name = "Vui lòng nhập tên chuyên ngành"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    let created = true
    if (onAdd) {
      created = await onAdd(formData)
    }

    if (!created) {
      return
    }

    setFormData({
      code: "",
      name: "",
    })
    setErrors({})

    onOpenChange(false)
  }

  const handleCancel = () => {
    setFormData({
      code: "",
      name: "",
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm mới chuyên ngành</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-gray-800">
              Mã chuyên ngành<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">K</span>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Nhập số mã chuyên ngành"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.replace(/\D/g, ""))}
                className={`w-full pl-8 border-gray-300 ${errors.code ? "border-red-500" : ""}`}
              />
            </div>
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
            onClick={handleAdd}
            className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white"
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
