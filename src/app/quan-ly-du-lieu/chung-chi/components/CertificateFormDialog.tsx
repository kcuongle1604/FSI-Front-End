"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
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
import { Certificate, CertificateFormData } from "../types"

interface CertificateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate?: Certificate | null
  onSubmit: (data: CertificateFormData) => void
}

export default function CertificateFormDialog({
  open,
  onOpenChange,
  certificate,
  onSubmit,
}: CertificateFormDialogProps) {
  const [formData, setFormData] = useState<CertificateFormData>({
    hoLot: certificate?.hoLot || "",
    ten: certificate?.ten || "",
    lop: certificate?.lop || "",
    ngaySinh: certificate?.ngaySinh || "",
    donTN: certificate?.donTN || false,
    kiemDiem: certificate?.kiemDiem || false,
    quanSu: certificate?.quanSu || false,
    theDuc: certificate?.theDuc || false,
    ngoaiNgu: certificate?.ngoaiNgu || false,
    tinhHoc: certificate?.tinhHoc || false,
    ghiChu: certificate?.ghiChu || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.hoLot.trim()) newErrors.hoLot = "Họ lót là bắt buộc"
    if (!formData.ten.trim()) newErrors.ten = "Tên là bắt buộc"
    if (!formData.lop.trim()) newErrors.lop = "Lớp là bắt buộc"
    if (!formData.ngaySinh.trim()) newErrors.ngaySinh = "Ngày sinh là bắt buộc"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {certificate ? "Chỉnh sửa thông tin chứng chỉ" : "Thêm mới thông tin chứng chỉ"}
          </DialogTitle>
          <DialogDescription>
            {certificate ? "Cập nhật thông tin chứng chỉ của sinh viên" : "Nhập thông tin chứng chỉ mới"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lớp */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Lớp <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.lop} onValueChange={(value) => setFormData({ ...formData, lop: value })}>
              <SelectTrigger className={`h-9 ${errors.lop ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="48K05">48K05</SelectItem>
                <SelectItem value="48K14.1">48K14.1</SelectItem>
                <SelectItem value="48K14.2">48K14.2</SelectItem>
                <SelectItem value="48K21.2">48K21.2</SelectItem>
              </SelectContent>
            </Select>
            {errors.lop && <p className="text-red-500 text-xs mt-1">{errors.lop}</p>}
          </div>

          {/* Họ lót */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Họ lót <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập họ lót"
              value={formData.hoLot}
              onChange={(e) => setFormData({ ...formData, hoLot: e.target.value })}
              className={`h-9 ${errors.hoLot ? "border-red-500" : ""}`}
            />
            {errors.hoLot && <p className="text-red-500 text-xs mt-1">{errors.hoLot}</p>}
          </div>

          {/* Tên */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Tên <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập tên"
              value={formData.ten}
              onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
              className={`h-9 ${errors.ten ? "border-red-500" : ""}`}
            />
            {errors.ten && <p className="text-red-500 text-xs mt-1">{errors.ten}</p>}
          </div>

          {/* Ngày sinh */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Ngày sinh <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="DD/MM/YYYY"
              value={formData.ngaySinh}
              onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
              className={`h-9 ${errors.ngaySinh ? "border-red-500" : ""}`}
            />
            {errors.ngaySinh && <p className="text-red-500 text-xs mt-1">{errors.ngaySinh}</p>}
          </div>

          {/* Các loại chứng chỉ */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Các loại chứng chỉ</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="donTN"
                  checked={formData.donTN}
                  onCheckedChange={(checked) => setFormData({ ...formData, donTN: checked as boolean })}
                />
                <label htmlFor="donTN" className="text-sm text-gray-700 cursor-pointer">
                  Đơn xin công nhân TN
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="kiemDiem"
                  checked={formData.kiemDiem}
                  onCheckedChange={(checked) => setFormData({ ...formData, kiemDiem: checked as boolean })}
                />
                <label htmlFor="kiemDiem" className="text-sm text-gray-700 cursor-pointer">
                  Bản kiểm điểm
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="quanSu"
                  checked={formData.quanSu}
                  onCheckedChange={(checked) => setFormData({ ...formData, quanSu: checked as boolean })}
                />
                <label htmlFor="quanSu" className="text-sm text-gray-700 cursor-pointer">
                  Cc Quân sự
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="theDuc"
                  checked={formData.theDuc}
                  onCheckedChange={(checked) => setFormData({ ...formData, theDuc: checked as boolean })}
                />
                <label htmlFor="theDuc" className="text-sm text-gray-700 cursor-pointer">
                  Cc Thể dục
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ngoaiNgu"
                  checked={formData.ngoaiNgu}
                  onCheckedChange={(checked) => setFormData({ ...formData, ngoaiNgu: checked as boolean })}
                />
                <label htmlFor="ngoaiNgu" className="text-sm text-gray-700 cursor-pointer">
                  Cc Ngoại ngữ
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tinhHoc"
                  checked={formData.tinhHoc}
                  onCheckedChange={(checked) => setFormData({ ...formData, tinhHoc: checked as boolean })}
                />
                <label htmlFor="tinhHoc" className="text-sm text-gray-700 cursor-pointer">
                  Cc Tin học
                </label>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Ghi chú</Label>
            <Input
              placeholder="Nhập ghi chú"
              value={formData.ghiChu}
              onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
              className="h-9"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={handleSubmit}>
            {certificate ? "Cập nhật" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { CertificateFormDialogProps }
