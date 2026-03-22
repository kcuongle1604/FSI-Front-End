"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseLabel: string
  onConfirm: () => void | Promise<void>
}

export default function DeleteCourseDialog({
  open,
  onOpenChange,
  courseLabel,
  onConfirm,
}: DeleteCourseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const label = courseLabel || "học phần này"

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError("")
      await Promise.resolve(onConfirm())
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "Không thể xóa học phần.")
    } finally {
      setLoading(false)
    }
  }

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
          {error && (
            <p className="text-xs text-red-500 mt-3">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Có"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { DeleteCourseDialogProps }
