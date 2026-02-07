// Popup Xóa
"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Student } from "../types"
import { deleteStudent } from "../student.api"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
}

export default function DeleteDialog({ open, onOpenChange, student }: DeleteDialogProps) {
  const studentLabel = student?.hoTen || "sinh viên này"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Xóa sinh viên?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn <strong>Xóa</strong> sinh viên <strong>{studentLabel}</strong> khỏi hệ thống không?
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={() => {
              if (!student) {
                onOpenChange(false)
                return
              }

              // Đóng popup ngay lập tức để không bị đơ UI
              onOpenChange(false)

              // Gọi API xóa sinh viên, reload lại danh sách khi xóa xong
              deleteStudent(student.id)
                .then(() => {
                  window.location.reload()
                })
                .catch((error) => {
                  console.error("Xóa sinh viên thất bại", error)
                })
            }}
          >
            Có
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}