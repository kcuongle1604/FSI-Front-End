"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Specialization = {
  id: number
  code: string
  name: string
  batches: string[]
}

type DeleteSpecializationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  specialization?: Specialization
  onConfirm?: () => void
}

export function DeleteSpecializationDialog({ open, onOpenChange, specialization, onConfirm }: DeleteSpecializationDialogProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Xóa chuyên ngành?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-gray-700">
            Bạn có chắc chắn muốn <span className="font-semibold">Xóa</span> chuyên ngành <span className="font-semibold">{specialization?.name}</span> này khỏi hệ thống không?
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              Có
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
