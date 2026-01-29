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

interface AddClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { name: string; specialization: string; advisor: string }) => void
}

type FormData = {
  name: string
  specialization: string
  advisor: string
}

const SPECIALIZATIONS = [
  "Quản trị hệ thống thông tin",
  "Kỹ thuật phần mềm",
  "Khoa học dữ liệu",
  "An ninh mạng",
]

const ADVISORS = [
  "Cao Thị Nhâm",
  "Nguyễn Văn A",
  "Trần Thị B",
  "Phạm Văn C",
]

const initialFormData: FormData = {
  name: "",
  specialization: "",
  advisor: "",
}

export function AddClassDialog({ open, onOpenChange, onAdd }: AddClassDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Tên lớp không được để trống"
    }
    if (!formData.specialization) {
      newErrors.specialization = "Chuyên ngành không được để trống"
    }
    if (!formData.advisor) {
      newErrors.advisor = "Giáo viên phụ trách không được để trống"
    }
    if (formData.studentCount === "") {
      newErrors.studentCount = "Số lượng không được để trống"
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

  const handleSelectChange = (name: string, value: string) => {
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
      onAdd(formData)
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
          <DialogTitle>Thêm mới lớp học</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Tên lớp <span className="text-red-500">*</span>
            </Label>
            <Input
              name="name"
              placeholder="Tên lớp"
              value={formData.name}
              onChange={handleInputChange}
              className="h-9 w-full"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Chuyên ngành <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.specialization} onValueChange={(value) => handleSelectChange("specialization", value)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Chuyên ngành" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialization && (
              <p className="text-sm text-red-500">{errors.specialization}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Giáo viên phụ trách <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.advisor} onValueChange={(value) => handleSelectChange("advisor", value)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Giáo viên phụ trách" />
              </SelectTrigger>
              <SelectContent>
                {ADVISORS.map(advisor => (
                  <SelectItem key={advisor} value={advisor}>{advisor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.advisor && (
              <p className="text-sm text-red-500">{errors.advisor}</p>
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

export type { AddClassDialogProps };
