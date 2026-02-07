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

export default function DeleteDialog({ open, onOpenChange, student }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Xóa sinh viên?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">Bạn có chắc chắn muốn <strong>Xóa</strong> sinh viên này khỏi hệ thống không?</p>
        </div>
        {error && (
          <div className="text-red-600 text-sm px-6">{error}</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={async () => {
              if (!student) return
              await deleteStudent(student.id)
              onOpenChange(false)
              window.location.reload()
            }}
          >
            Có
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}