"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Student } from "../sinh-vien/types"

interface DeleteScoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
}

export default function DeleteScoreDialog({ open, onOpenChange, student }: DeleteScoreDialogProps) {
  const studentLabel = student ? `${student.mssv} - ${student.hoTen}` : "sinh viên này"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Xóa dữ liệu điểm?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn <strong>Xóa dữ liệu điểm</strong> của sinh viên <strong>{studentLabel}</strong> khỏi hệ thống không?
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={() => {
              // Hiện tại chỉ đóng popup, chưa gọi API xóa điểm
              onOpenChange(false)
            }}
          >
            Có
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
