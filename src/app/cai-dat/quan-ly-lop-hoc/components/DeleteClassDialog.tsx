"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type SchoolClass = {
  id: number
  name: string
  specialization: string
  advisor: string
  studentCount: number | string
}

interface DeleteClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolClass?: SchoolClass
  onConfirm: () => void
}

export function DeleteClassDialog({ 
  open, 
  onOpenChange, 
  schoolClass,
  onConfirm 
}: DeleteClassDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa lớp học?</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-gray-600">
          Bạn có chắc chắn muốn <span className="font-semibold">Xóa lớp học</span> này khỏi hệ thống không?
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9"
          >
            Có
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type { DeleteClassDialogProps };
