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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"

const CLASSES = ["48K05", "48K14.1", "48K14.2", "48K21.1", "48K21.2"]

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: any
  onUpdate: (data: any) => void
}

export function EditUserDialog({
  open,
  onOpenChange,
  account,
  onUpdate,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    role: "",
    assignClasses: [] as string[],
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // ✅ ĐỔ DATA CŨ VÀO FORM
  useEffect(() => {
    if (!account) return

    setFormData({
      role: account.role?.name || "",
      assignClasses: account.classes?.map((c: any) => c.code) || [],
      email: account.email || "",
      fullName: account.username || "",
      password: "",
      confirmPassword: "",
    })
  }, [account])

  const handleInputChange = (field: string, value: string) => {
    if (field === "role" && value !== "Giáo viên chủ nhiệm") {
      setFormData(prev => ({ ...prev, role: value, assignClasses: [] }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.role) newErrors.role = "Vui lòng chọn vai trò"

    if (
      formData.role === "Giáo viên chủ nhiệm" &&
      formData.assignClasses.length === 0
    ) {
      newErrors.assignClasses = "Vui lòng chọn ít nhất một lớp"
    }

    if (!formData.email) newErrors.email = "Vui lòng nhập email"
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập họ và tên"

    if (!formData.password) {
    newErrors.password = "Vui lòng nhập mật khẩu"}
    
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdate = async () => {
    if (!validate()) return

    try {
      setLoading(true)

      await onUpdate({
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        classes:
          formData.role === "Giáo viên chủ nhiệm"
            ? formData.assignClasses
            : [],
        password: formData.password || undefined,
      })

      onOpenChange(false)
      setErrors({})
    } catch (err: any) {
      setErrors({
        submit: err.message || "Cập nhật người dùng thất bại",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa thông tin người dùng</DialogTitle>
        </DialogHeader>

        {errors.submit && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {errors.submit}
          </p>
        )}

        <div className="space-y-4">
          {/* Vai trò */}
          <div className="space-y-2">
            <Label>Vai trò<span className="text-red-500">*</span></Label>
            <Select
              value={formData.role}
              onValueChange={(v) => handleInputChange("role", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Giáo vụ khoa">Giáo vụ khoa</SelectItem>
                <SelectItem value="Ban chủ nhiệm khoa">
                  Ban chủ nhiệm khoa
                </SelectItem>
                <SelectItem value="Giáo viên chủ nhiệm">
                  Giáo viên chủ nhiệm
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Gán lớp */}
          <div className="space-y-2">
            <Label>Gán lớp<span className="text-red-500">*</span></Label>
            <MultiSelect
              options={CLASSES}
              value={formData.assignClasses}
              onChange={(v) =>
                setFormData(p => ({ ...p, assignClasses: v }))
              }
              disabled={formData.role !== "Giáo viên chủ nhiệm"}
              placeholder="Chọn lớp"
            />
            {errors.assignClasses && (
              <p className="text-xs text-red-500">{errors.assignClasses}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email<span className="text-red-500">*</span></Label>
            <Input
              value={formData.email}
              onChange={(e) =>
                handleInputChange("email", e.target.value)
              }
            />
          </div>

          {/* Họ tên */}
          <div className="space-y-2">
            <Label>Họ và tên<span className="text-red-500">*</span></Label>
            <Input
              value={formData.fullName}
              onChange={(e) =>
                handleInputChange("fullName", e.target.value)
              }
            />
          </div>

          {/* Mật khẩu */}
          <div className="space-y-2">
            <Label>
              Mật khẩu<span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                handleInputChange("password", e.target.value)
              }
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>


          {/* Xác nhận mật khẩu */}
          <div className="space-y-2">
            <Label>Xác nhận lại mật khẩu<span className="text-red-500">*</span></Label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
