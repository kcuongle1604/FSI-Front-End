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
import { Account } from "../page"
import { User, UserUpdateRequest } from "@/lib/user.api"

const CLASSES = ["48K05", "48K14.1", "48K14.2", "48K21.1", "48K21.2"]

type EditUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account
  onUpdate?: (userData: any) => void
}

export function EditUserDialog({ open, onOpenChange, account, onUpdate }: EditUserDialogProps) {
  const [formData, setFormData] = useState<UserUpdateRequest>({
    role_id: "",
    email: "",
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (account && open) {
      setFormData({
        role_id: account.role?.role_id.toString() || "",
        email: account.email,
        username: account.username,
      })
      setErrors({})
    }
  }, [account, open])

  const handleInputChange = (field: string, value: string) => {
    if (field === "role") {
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

  const handleUpdate = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.role_id) newErrors.role = "Vui lòng chọn vai trò"
    // if (formData.role_id === "Giáo viên chủ nhiệm" && formData.assignClasses.length === 0) {
    //   newErrors.assignClasses = "Vui lòng chọn ít nhất một lớp"
    // }
    if (!formData.email) newErrors.email = "Vui lòng nhập email"
    if (!formData.username) newErrors.username = "Vui lòng nhập họ và tên"

    // Only validate password if provided
    if (formData.password) {
      // if (!formData.confirmPassword) {
      //   newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
      // } else if (formData.password !== formData.confirmPassword) {
      //   newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
      // }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      setLoading(true)
      if (onUpdate) {
        await onUpdate(formData)
      }

      setFormData({
        role_id: "",
        //assignClasses: [],
        email: "",
        username: "",
        password: "",
        //confirmPassword: "",
      })
      setErrors({})

      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user"
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      role_id: "",
      //assignClasses: [],
      email: "",
      username: "",
      password: "",
      //confirmPassword: "",
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa thông tin người dùng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Vai trò<span className="text-red-500">*</span>
            </Label>
            <Select value={formData.role_id} onValueChange={(value) => handleInputChange("role", value)}>
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
          {/*<div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Gán lớp<span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={CLASSES}
              value={formData.assignClasses}
              onChange={(classes) => setFormData(prev => ({ ...prev, assignClasses: classes }))}
              disabled={formData.role_id !== "Giáo viên chủ nhiệm"}
              placeholder="Chọn lớp"
            />
            {errors.assignClasses && <p className="text-xs text-red-500">{errors.assignClasses}</p>}
          </div>
          */}

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
              value={formData.username}
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
          {/*formData.password && (
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
          )*/}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdate}
            className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white"
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
