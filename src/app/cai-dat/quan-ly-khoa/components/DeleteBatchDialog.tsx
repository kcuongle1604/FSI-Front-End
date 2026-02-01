"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Batch = {
  id: number
  code: string
}

interface DeleteBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batch?: Batch
  onConfirm: () => void
}

export function DeleteBatchDialog({ 
  open, 
  onOpenChange, 
  batch,
  onConfirm 
}: DeleteBatchDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa khoá?</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-gray-600">
          Bạn có chắc chắn muốn <span className="font-semibold">Xóa khoá</span> này khỏi hệ thống không?
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
            className="px-6 bg-red-600 hover:bg-red-700 text-white h-9"
          >
            Có
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type { DeleteBatchDialogProps };
