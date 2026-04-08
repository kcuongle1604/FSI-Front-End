"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificateName: string
  onConfirm: () => void | Promise<void>
}

export default function DeleteCertificateDialog({
  open,
  onOpenChange,
  certificateName,
  onConfirm,
}: DeleteCertificateDialogProps) {
  const studentLabel = certificateName || "sinh viên này"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Xóa thông tin chứng chỉ?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn <strong>Xóa thông tin chứng chỉ</strong> của sinh viên
            {" "}
            <strong>{studentLabel}</strong> khỏi hệ thống không?
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

export type { DeleteCertificateDialogProps }
