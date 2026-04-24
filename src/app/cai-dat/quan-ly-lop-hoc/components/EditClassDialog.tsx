"use client"

import { useEffect, useState, type ChangeEvent } from "react"
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
import { api } from "@/lib/api"

type SchoolClass = {
  id: number
  name: string
  cohortId?: number | string
  majorId?: number | string
  userId?: number
  specialization: string
  advisor: string
  studentCount: number | string
}

interface EditClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolClass?: SchoolClass
  onUpdate: (data: { name: string; cohortId: number; majorId: string; userId: number }) => Promise<boolean> | boolean
}

type FormData = {
  cohort: string
  specialization: string
  name: string
  advisor: string
}

const SPECIALIZATIONS = [
  "Chuyên ngành #0",
  "Quản trị hệ thống thông tin",
  "Kỹ thuật phần mềm",
  "Khoa học dữ liệu",
  "An ninh mạng",
]

const ADVISORS = [
  "Uyên Nhi",
  "Cao Thị Nhâm",
  "Nguyễn Văn A",
  "Trần Thị B",
  "Phạm Văn C",
]
type SelectOption = {
  value: string
  label: string
}

type UserApiItem = {
  id?: number
  user_id?: number
  username?: string
  full_name?: string
  name?: string
}

type MajorApiItem = {
  majorId?: string | number
  major_id?: string | number
  name?: string
  major_name?: string
}

type MajorApiResponse =
  | MajorApiItem[]
  | {
      data?: MajorApiItem[]
      items?: MajorApiItem[]
      results?: MajorApiItem[]
    }

type CohortApiItem = {
  cohort_id?: number
}

const initialFormData: FormData = {
  cohort: "",
  specialization: "",
  name: "",
  advisor: "",
}

export function EditClassDialog({ open, onOpenChange, schoolClass, onUpdate }: EditClassDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [specializations, setSpecializations] = useState<SelectOption[]>([])
  const [specializationsLoading, setSpecializationsLoading] = useState(false)
  const [specializationsError, setSpecializationsError] = useState("")
  const [cohorts, setCohorts] = useState<SelectOption[]>([])
  const [cohortsLoading, setCohortsLoading] = useState(false)
  const [cohortsError, setCohortsError] = useState("")
  const [advisors, setAdvisors] = useState<SelectOption[]>([])
  const [advisorsLoading, setAdvisorsLoading] = useState(false)
  const [advisorsError, setAdvisorsError] = useState("")

  const resolveSpecializationValue = (spec?: SchoolClass) => {
    if (!spec) return ""

    if (spec.majorId != null) {
      return String(spec.majorId)
    }

    const byName = specializations.find((option) => option.label.includes(spec.specialization))
    return byName?.value || ""
  }

  const resolveAdvisorValue = (spec?: SchoolClass) => {
    if (!spec) return ""

    if (spec.userId != null) {
      return String(spec.userId)
    }

    const byName = advisors.find((option) => option.label === spec.advisor)
    return byName?.value || ""
  }

  const resolveCohortValue = (spec?: SchoolClass) => {
    if (!spec) return ""

    if (spec.cohortId != null) {
      return String(spec.cohortId)
    }

    return ""
  }

  useEffect(() => {
    if (!open) {
      return
    }

    const fetchMajors = async () => {
      try {
        setSpecializationsLoading(true)
        setSpecializationsError("")

        const res = await api.get<MajorApiResponse>("/api/v1/majors")
        const raw = res.data
        const majors = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.items)
              ? raw.items
              : Array.isArray(raw?.results)
                ? raw.results
                : []

        const majorOptions = majors
          .map((major) => {
            const majorIdText = String(major.majorId ?? major.major_id ?? "").trim()
            const majorName = String(major.name || major.major_name || "").trim()

            if (!majorIdText) {
              return null
            }

            return {
              value: majorIdText,
              label: majorName ? `${majorIdText} - ${majorName}` : majorIdText,
            }
          })
          .filter((option): option is SelectOption => Boolean(option))

        setSpecializations(
          majorOptions.filter((option, index, array) =>
            array.findIndex((item) => item.value === option.value && item.label === option.label) === index
          )
        )
      } catch (error: any) {
        const detail = error?.response?.data?.detail
        const message =
          typeof detail === "string" && detail.trim()
            ? detail
            : "Không tải được danh sách chuyên ngành"

        setSpecializations([])
        setSpecializationsError(message)
      } finally {
        setSpecializationsLoading(false)
      }
    }

    const fetchUsers = async () => {
      try {
        setAdvisorsLoading(true)
        setAdvisorsError("")

        const res = await api.get<UserApiItem[]>("/api/v1/users/")
        const users = Array.isArray(res.data) ? res.data : []
        const userOptions = users
          .map((user) => {
            const userId = Number(user.user_id ?? user.id)
            const displayName = String(user.full_name || user.name || user.username || "").trim()

            if (!displayName || !Number.isFinite(userId)) {
              return null
            }

            return {
              value: String(userId),
              label: displayName,
            }
          })
          .filter((option): option is SelectOption => Boolean(option))

        setAdvisors(
          userOptions.filter((option, index, array) => array.findIndex((item) => item.value === option.value) === index)
        )
      } catch (error: any) {
        const detail = error?.response?.data?.detail
        const message =
          typeof detail === "string" && detail.trim()
            ? detail
            : "Không tải được danh sách giáo viên"

        setAdvisors([])
        setAdvisorsError(message)
      } finally {
        setAdvisorsLoading(false)
      }
    }

    const fetchCohorts = async () => {
      try {
        setCohortsLoading(true)
        setCohortsError("")

        const res = await api.get<CohortApiItem[]>("/api/v1/cohorts")
        const cohortRows = Array.isArray(res.data) ? res.data : []
        const cohortOptions = cohortRows
          .map((cohort) => {
            const cohortId = Number(cohort.cohort_id)
            if (!Number.isFinite(cohortId)) {
              return null
            }

            return {
              value: String(cohortId),
              label: String(cohortId),
            }
          })
          .filter((option): option is SelectOption => Boolean(option))

        setCohorts(
          cohortOptions.filter((option, index, array) => array.findIndex((item) => item.value === option.value) === index)
        )
      } catch (error: any) {
        const detail = error?.response?.data?.detail
        const message =
          typeof detail === "string" && detail.trim()
            ? detail
            : "Không tải được danh sách khóa"

        setCohorts([])
        setCohortsError(message)
      } finally {
        setCohortsLoading(false)
      }
    }

    if (schoolClass) {
      setFormData({
        cohort: resolveCohortValue(schoolClass),
        specialization: resolveSpecializationValue(schoolClass),
        name: schoolClass.name,
        advisor: resolveAdvisorValue(schoolClass),
      })
      setErrors({})
    }

    void fetchMajors()
    void fetchCohorts()
    void fetchUsers()
  }, [schoolClass, open])

  useEffect(() => {
    if (!open || !schoolClass) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      cohort: prev.cohort || resolveCohortValue(schoolClass),
      specialization: prev.specialization || resolveSpecializationValue(schoolClass),
      advisor: prev.advisor || resolveAdvisorValue(schoolClass),
    }))
  }, [open, schoolClass, cohorts, specializations, advisors])

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Tên lớp không được để trống"
    }
    if (!formData.cohort) {
      newErrors.cohort = "Khóa không được để trống"
    }
    if (!formData.specialization) {
      newErrors.specialization = "Chuyên ngành không được để trống"
    }
    if (!formData.advisor) {
      newErrors.advisor = "Giáo viên phụ trách không được để trống"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    setFormData(prev => {
      const nextFormData = {
        ...prev,
        [name]: value,
      }

      if (nextFormData.cohort && nextFormData.specialization) {
        nextFormData.name = `${nextFormData.cohort}${nextFormData.specialization}`
      }

      return nextFormData
    })
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      const cohortId = Number(formData.cohort)
      const majorId = formData.specialization.trim()
      const userId = Number(formData.advisor)

      if (!Number.isFinite(cohortId)) {
        setErrors(prev => ({ ...prev, cohort: "Khóa không hợp lệ" }))
        return
      }

      if (!majorId) {
        setErrors(prev => ({ ...prev, specialization: "Chuyên ngành không hợp lệ" }))
        return
      }

      if (!Number.isFinite(userId)) {
        setErrors(prev => ({ ...prev, advisor: "Giáo viên phụ trách không hợp lệ" }))
        return
      }

      const updated = await onUpdate({
        name: formData.name.trim(),
        cohortId,
        majorId,
        userId,
      })

      if (!updated) {
        return
      }

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
          <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Khóa <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.cohort} onValueChange={(value) => handleSelectChange("cohort", value)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Khóa" />
              </SelectTrigger>
              <SelectContent>
                {cohorts.map((cohort, index) => (
                  <SelectItem key={`${cohort.value}-${index}`} value={cohort.value}>{cohort.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cohortsLoading && (
              <p className="text-xs text-gray-500">Đang tải danh sách khóa...</p>
            )}
            {!cohortsLoading && cohortsError && (
              <p className="text-xs text-red-500">{cohortsError}</p>
            )}
            {!cohortsLoading && !cohortsError && cohorts.length === 0 && (
              <p className="text-xs text-gray-500">Không có khóa để lựa chọn</p>
            )}
            {errors.cohort && (
              <p className="text-sm text-red-500">{errors.cohort}</p>
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
                {specializations.map((spec, index) => (
                  <SelectItem key={`${spec.value}-${index}`} value={spec.value}>{spec.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {specializationsLoading && (
              <p className="text-xs text-gray-500">Đang tải danh sách chuyên ngành...</p>
            )}
            {!specializationsLoading && specializationsError && (
              <p className="text-xs text-red-500">{specializationsError}</p>
            )}
            {!specializationsLoading && !specializationsError && specializations.length === 0 && (
              <p className="text-xs text-gray-500">Không có chuyên ngành để lựa chọn</p>
            )}
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
                {advisors.map((advisor, index) => (
                  <SelectItem key={`${advisor.value}-${index}`} value={advisor.value}>{advisor.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {advisorsLoading && (
              <p className="text-xs text-gray-500">Đang tải danh sách giáo viên...</p>
            )}
            {!advisorsLoading && advisorsError && (
              <p className="text-xs text-red-500">{advisorsError}</p>
            )}
            {!advisorsLoading && !advisorsError && advisors.length === 0 && (
              <p className="text-xs text-gray-500">Không có người dùng để lựa chọn</p>
            )}
            {errors.advisor && (
              <p className="text-sm text-red-500">{errors.advisor}</p>
            )}
          </div>

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

export type { EditClassDialogProps };
