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
import { MultiSelect } from "@/components/ui/multi-select"
import { createUser } from "@/lib/user.api"
import { mapRoleNameToId } from "../page"

const CLASSES = ["48K05", "48K14.1", "48K14.2", "48K21.1", "48K21.2"]

type AddUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddUserDialogProps) {
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
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu"
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return

    try {
      setLoading(true)

      const res = await createUser({
        username: formData.fullName,
        email: formData.email,
        password: formData.password,
        role_id: mapRoleNameToId(formData.role),
        //assignedClasses: formData.assignClasses,
      })

      if (!res.status.toString().startsWith("2")) {
        const text = (res.data as any).detail;
        throw new Error(text)
      }

      // 🔥 QUAN TRỌNG: refresh danh sách ở page cha
      onSuccess?.()
      onOpenChange(false)

      setFormData({
        role: "",
        assignClasses: [],
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
      })
      setErrors({})
    } catch (err: any) {
      setErrors({
        submit: err.message || "Có lỗi xảy ra khi tạo người dùng",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm người dùng</DialogTitle>
        </DialogHeader>

        {errors.submit && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {errors.submit}
          </p>
        )}

        <div className="space-y-4">
          {/* Vai trò */}
          <div className="space-y-2">
            <Label>
              Vai trò<span className="text-red-500">*</span>
            </Label>

            <Select
              value={formData.role}
              onValueChange={(v) => handleInputChange("role", v)}
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
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

            {/* MESSAGE LỖI – giống Gán lớp */}
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
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
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
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="space-y-2">
            <Label>Mật khẩu<span className="text-red-500">*</span></Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                handleInputChange("password", e.target.value)
              }
            />
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
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

