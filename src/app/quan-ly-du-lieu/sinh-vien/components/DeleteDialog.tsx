// Popup Xóa
"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Student } from "../types"
import { deleteStudent } from "../student.api"
import { Loader2 } from "lucide-react"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
  onSuccess?: () => void
}

export default function DeleteDialog({ open, onOpenChange, student, onSuccess }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!student) return

    try {
      setLoading(true)
      setError("")

      await deleteStudent(student.id)

      // Success - close dialog and refresh list
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Delete student error:", err)
      setError(err.response?.data?.detail || "Có lỗi xảy ra khi xóa sinh viên")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Xóa sinh viên?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn <strong>Xóa</strong> sinh viên <strong>{student?.hoTen}</strong> (MSSV: {student?.mssv}) khỏi hệ thống không?
          </p>
        </div>
        {error && (
          <div className="text-red-600 text-sm px-6">{error}</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Có'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}