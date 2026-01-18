// Popup Xóa
"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Student } from "../types"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
}

export default function DeleteDialog({ open, onOpenChange, student }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Xóa sinh viên?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">Bạn có chắc chắn muốn <strong>Xóa</strong> sinh viên này khỏi hệ thống không?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={() => onOpenChange(false)}>Có</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}