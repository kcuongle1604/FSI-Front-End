"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Account = {
  id: number
  name: string
  email: string
  role: string
  status: string
  isBan: boolean
}

type DeleteUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account
  onConfirm?: () => void
}

export function DeleteUserDialog({ open, onOpenChange, account, onConfirm }: DeleteUserDialogProps) {
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
          <DialogTitle className="text-lg font-bold">Xóa người dùng?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-gray-700">
            Bạn có chắc chắn muốn <span className="font-semibold">xóa người dùng {account?.name}</span> khỏi hệ thống không?
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
