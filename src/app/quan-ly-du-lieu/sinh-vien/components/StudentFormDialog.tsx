"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Student } from "../types"

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null // Nếu null là mode Thêm, có object là mode Sửa
}

export default function StudentFormDialog({ open, onOpenChange, student }: StudentFormDialogProps) {
  const isEdit = !!student
  const [formData, setFormData] = useState({
    mssv: "",
    hoTen: "",
    lop: "",
    ngaySinh: "",
    ghiChu: "",
    chuyenNganh: ""
  })

  // Reset/Fill form khi props student thay đổi hoặc mở dialog
  useEffect(() => {
    if (student) {
      setFormData({
        mssv: student.mssv,
        hoTen: student.hoTen,
        lop: student.lop,
        ngaySinh: student.ngaySinh,
        ghiChu: student.ghiChu,
        chuyenNganh: student.chuyenNganh || "qthttt"
      })
    } else {
      setFormData({
        mssv: "",
        hoTen: "",
        lop: "",
        ngaySinh: "",
        ghiChu: "",
        chuyenNganh: ""
      })
    }
  }, [student, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa thông tin Sinh viên" : "Thêm mới Sinh viên"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mssv">MSSV<span className="text-red-500">*</span></Label>
            <Input id="mssv" value={formData.mssv} onChange={(e) => setFormData({ ...formData, mssv: e.target.value })} placeholder="Nhập MSSV" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hoTen">Họ và tên<span className="text-red-500">*</span></Label>
            <Input id="hoTen" value={formData.hoTen} onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })} placeholder="Nhập họ và tên" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="chuyenNganh">Chuyên ngành</Label>
            <Select value={formData.chuyenNganh || undefined} onValueChange={(val) => setFormData({...formData, chuyenNganh: val})}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Chọn chuyên ngành" /></SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width] min-w-[200px]">
                <SelectItem value="qthttt">Quản trị hệ thống thông tin</SelectItem>
                <SelectItem value="cnpm">Công nghệ phần mềm</SelectItem>
                <SelectItem value="httt">Hệ thống thông tin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lop">Lớp<span className="text-red-500">*</span></Label>
            <Select value={formData.lop || undefined} onValueChange={(val) => setFormData({...formData, lop: val})}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width] min-w-[200px]">
                <SelectItem value="48K05">48K05</SelectItem>
                <SelectItem value="48K14.1">48K14.1</SelectItem>
                <SelectItem value="48K14.2">48K14.2</SelectItem>
                <SelectItem value="48K21.2">48K21.2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ngaySinh">Ngày sinh<span className="text-red-500">*</span></Label>
            <Input id="ngaySinh" value={formData.ngaySinh} onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })} placeholder="dd/mm/yyyy" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ghiChu">Ghi chú</Label>
            <Input id="ghiChu" value={formData.ghiChu} onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })} placeholder="Nhập ghi chú" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={() => onOpenChange(false)}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}