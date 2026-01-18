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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CLASSES = ["48K05", "48K14.1", "48K14.2", "48K21.1", "48K21.2"]

type AddUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (userData: any) => void
}

export function AddUserDialog({ open, onOpenChange, onAdd }: AddUserDialogProps) {
  const [formData, setFormData] = useState({
    role: "",
    assignClasses: [] as string[],
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    if (field === "role") {
      // Reset assignClasses when role changes and it's not "Giáo viên chủ nhiệm"
      if (value !== "Giáo viên chủ nhiệm") {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          assignClasses: []
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleClassToggle = (classValue: string) => {
    setFormData(prev => ({
      ...prev,
      assignClasses: prev.assignClasses.includes(classValue)
        ? prev.assignClasses.filter(c => c !== classValue)
        : [...prev.assignClasses, classValue]
    }))
  }

  const handleAdd = () => {
    const newErrors: Record<string, string> = {}

    // Validate required fields
    if (!formData.role) newErrors.role = "Vui lòng chọn vai trò"
    // Only validate assignClasses if role is "Giáo viên chủ nhiệm"
    if (formData.role === "Giáo viên chủ nhiệm" && formData.assignClasses.length === 0) {
      newErrors.assignClasses = "Vui lòng chọn ít nhất một lớp"
    }
    if (!formData.email) newErrors.email = "Vui lòng nhập email"
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập họ và tên"
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"

    // Validate password match
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    setErrors(newErrors)

    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      return
    }

    // Call callback if provided
    if (onAdd) {
      onAdd(formData)
    }

    // Reset form
    setFormData({
      role: "",
      assignClasses: [],
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    })
    setErrors({})

    // Close dialog
    onOpenChange(false)
  }

  const handleCancel = () => {
    setFormData({
      role: "",
      assignClasses: [],
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm người dùng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Role */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Vai trò<span className="text-red-500">*</span>
            </Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Giáo vụ khoa">Giáo vụ khoa</SelectItem>
                <SelectItem value="Ban chủ nhiệm khoa">Ban chủ nhiệm khoa</SelectItem>
                <SelectItem value="Giáo viên chủ nhiệm">Giáo viên chủ nhiệm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assign Class */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Gán lớp<span className="text-red-500">*</span>
            </Label>
            <div className={`border border-gray-300 rounded-lg p-3 space-y-2 bg-white ${
              formData.role !== "Giáo viên chủ nhiệm" ? "opacity-50 cursor-not-allowed" : ""
            }`}>
              {CLASSES.map((classItem) => (
                <div key={classItem} className="flex items-center gap-2">
                  <Checkbox
                    id={classItem}
                    checked={formData.assignClasses.includes(classItem)}
                    onCheckedChange={() => handleClassToggle(classItem)}
                    disabled={formData.role !== "Giáo viên chủ nhiệm"}
                  />
                  <Label 
                    htmlFor={classItem} 
                    className={`text-sm font-normal cursor-pointer ${
                      formData.role !== "Giáo viên chủ nhiệm" 
                        ? "text-gray-400" 
                        : "text-gray-700"
                    }`}
                  >
                    {classItem}
                  </Label>
                </div>
              ))}
            </div>
            {formData.role !== "Giáo viên chủ nhiệm" && (
              <p className="text-xs text-gray-500">Chỉ có thể gán lớp cho Giáo viên chủ nhiệm</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-800">
              Email<span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={(e) => {
                handleInputChange("email", e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: "" }))
              }}
              className={`w-full border-gray-300 ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-800">
              Họ và tên<span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChange={(e) => {
                handleInputChange("fullName", e.target.value)
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }))
              }}
              className={`w-full border-gray-300 ${errors.fullName ? "border-red-500" : ""}`}
            />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-800">
              Mật khẩu<span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={(e) => {
                handleInputChange("password", e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: "" }))
              }}
              className={`w-full border-gray-300 ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-800">
              Xác nhận lại mật khẩu<span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={(e) => {
                handleInputChange("confirmPassword", e.target.value)
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }))
              }}
              className={`w-full border-gray-300 ${errors.confirmPassword ? "border-red-500" : ""}`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
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
