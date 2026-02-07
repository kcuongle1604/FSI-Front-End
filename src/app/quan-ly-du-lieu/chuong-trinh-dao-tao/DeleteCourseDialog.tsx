"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseLabel: string
  onConfirm: () => void
}

export default function DeleteCourseDialog({
  open,
  onOpenChange,
  courseLabel,
  onConfirm,
}: DeleteCourseDialogProps) {
  const label = courseLabel || "học phần này"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Xóa học phần?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn <strong>Xóa học phần</strong> <strong>{label}</strong> khỏi chương trình đào tạo không?
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={() => {
              onConfirm()
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

export type { DeleteCourseDialogProps }
