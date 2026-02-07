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

const SPECIALIZATIONS = [
  "Quản trị hệ thống thông tin",
  "Tin học quản lý",
  "Thống kê",
]

const COURSE_TYPES = [
  { value: "bat-buoc", label: "Bắt buộc" },
  { value: "tu-chon", label: "Tự chọn" },
] as const

export type CourseFormValues = {
  specialization: string
  code: string
  name: string
  credits: number
  type: (typeof COURSE_TYPES)[number]["value"]
}

type CourseFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CourseFormValues) => void
  initialValues?: Partial<CourseFormValues>
  mode?: "create" | "edit"
}

export default function CourseFormDialog({
  open,
  onOpenChange,
  onSave,
  initialValues,
  mode = "create",
}: CourseFormDialogProps) {
  const [specialization, setSpecialization] = useState("")
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [credits, setCredits] = useState("")
  const [courseType, setCourseType] = useState<string>("")

  const [errors, setErrors] = useState<{
    specialization?: string
    code?: string
    name?: string
    credits?: string
    courseType?: string
  }>({})

  const resetForm = () => {
    setSpecialization("")
    setCode("")
    setName("")
    setCredits("")
    setCourseType("")
    setErrors({})
  }

  // Khi mở dialog, fill dữ liệu từ initialValues (dùng cho màn Sửa)
  useEffect(() => {
    if (open) {
      setSpecialization(initialValues?.specialization ?? "")
      setCode(initialValues?.code ?? "")
      setName(initialValues?.name ?? "")
      setCredits(
        typeof initialValues?.credits === "number"
          ? String(initialValues.credits)
          : initialValues?.credits
          ? String(initialValues.credits)
          : ""
      )
      setCourseType(initialValues?.type ?? "")
      setErrors({})
    }
  }, [open, initialValues])

  const handleSave = () => {
    const newErrors: typeof errors = {}

    if (!specialization) newErrors.specialization = "Vui lòng chọn chuyên ngành"
    if (!code.trim()) newErrors.code = "Vui lòng nhập mã học phần"
    if (!name.trim()) newErrors.name = "Vui lòng nhập tên học phần"

    const parsedCredits = Number(credits)
    if (!credits.trim() || Number.isNaN(parsedCredits) || parsedCredits <= 0) {
      newErrors.credits = "Vui lòng nhập số tín chỉ hợp lệ"
    }

    if (!courseType) newErrors.courseType = "Vui lòng chọn loại học phần"

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSave({
      specialization,
      code: code.trim(),
      name: name.trim(),
      credits: parsedCredits,
      type: courseType as CourseFormValues["type"],
    })

    resetForm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  const dialogTitle = mode === "edit" ? "Sửa học phần" : "Thêm mới học phần"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Chuyên ngành<span className="text-red-500">*</span>
            </Label>
            <div
              className="w-full h-9 px-3 flex items-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm"
            >
              {specialization}
            </div>
            {errors.specialization && specialization === "" && (
              <p className="text-xs text-red-500">{errors.specialization}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Mã học phần<span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập mã học phần"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                if (errors.code) {
                  setErrors((prev) => ({ ...prev, code: undefined }))
                }
              }}
              className={`w-full ${errors.code ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.code && (
              <p className="text-xs text-red-500">{errors.code}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Tên học phần<span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập tên học phần"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }
              }}
              className={`w-full ${errors.name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Số tín chỉ<span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập số tín chỉ"
              value={credits}
              onChange={(e) => {
                setCredits(e.target.value)
                if (errors.credits) {
                  setErrors((prev) => ({ ...prev, credits: undefined }))
                }
              }}
              className={`w-full ${errors.credits ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.credits && (
              <p className="text-xs text-red-500">{errors.credits}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Loại học phần<span className="text-red-500">*</span>
            </Label>
            <Select
              value={courseType}
              onValueChange={(value) => {
                setCourseType(value)
                if (errors.courseType) {
                  setErrors((prev) => ({ ...prev, courseType: undefined }))
                }
              }}
            >
              <SelectTrigger className={`w-full ${errors.courseType ? "border-red-500" : "border-gray-300"}`}>
                <SelectValue placeholder="Chọn loại học phần" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseType && (
              <p className="text-xs text-red-500">{errors.courseType}</p>
            )}
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
