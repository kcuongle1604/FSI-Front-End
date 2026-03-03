// Popup Xóa
"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Student } from "../types"
import { deleteStudent } from "../student.api"

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
      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      console.error("Delete failed:", err)
      setError(err.response?.data?.message || "Không thể xóa sinh viên. Vui lòng thử lại.")
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
          <p className="text-gray-600">Bạn có chắc chắn muốn <strong>Xóa</strong> sinh viên này khỏi hệ thống không?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Có"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}