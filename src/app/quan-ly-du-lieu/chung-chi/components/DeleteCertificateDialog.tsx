"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface DeleteCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificateName: string
  onConfirm: () => void
}

export default function DeleteCertificateDialog({
  open,
  onOpenChange,
  certificateName,
  onConfirm,
}: DeleteCertificateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa thông tin chứng chỉ?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa thông tin chứng chỉ của sinh viên này khỏi hệ thống không?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-600">
            <p className="font-medium">{certificateName}</p>
            <p className="mt-1">Hành động này không thể hoàn tác.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { DeleteCertificateDialogProps }
