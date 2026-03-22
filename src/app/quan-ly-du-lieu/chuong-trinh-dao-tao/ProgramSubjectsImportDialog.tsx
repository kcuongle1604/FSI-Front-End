"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload } from "lucide-react"
import { importProgramSubjects } from "./program.api"

interface ProgramSubjectsImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programName?: string
  onImportSuccess?: () => void
}

export default function ProgramSubjectsImportDialog({
  open,
  onOpenChange,
  programName,
  onImportSuccess,
}: ProgramSubjectsImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const resetState = () => {
    setFile(null)
    setLoading(false)
    setError("")
    setSuccessMessage("")
  }

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value)
    if (!value) {
      resetState()
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File vượt quá dung lượng cho phép. Giới hạn tối đa: 50 MB.")
      setFile(null)
      return
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Định dạng file không hợp lệ, chỉ chấp nhận .csv")
      setFile(null)
      return
    }

    setError("")
    setSuccessMessage("")
    setFile(selectedFile)
  }

  const handleImport = async () => {
    if (!file || !programName) return

    try {
      setLoading(true)
      setError("")

      const response = await importProgramSubjects(programName, file)
      const message =
        (typeof response.data === "object" && response.data?.message) ||
        "Import học phần thành công"

      setSuccessMessage(String(message))
      if (onImportSuccess) {
        onImportSuccess()
      }
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Import học phần thất bại. Vui lòng thử lại."
      setError(String(backendMessage))
      setSuccessMessage("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import học phần</DialogTitle>
          <DialogDescription>
            Tải file CSV danh sách môn học cho chương trình đào tạo.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-0 pb-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${error ? "border-red-300 bg-red-50" : "border-gray-300"}`}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const droppedFile = e.dataTransfer.files?.[0]
              if (droppedFile) {
                handleFileSelect(droppedFile)
              }
            }}
          >
            <div className="flex justify-center mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${file ? "bg-blue-100" : "bg-gray-100"}`}>
                {file ? <FileText className="h-5 w-5 text-blue-600" /> : <Upload className="h-5 w-5 text-gray-500" />}
              </div>
            </div>

            {file ? (
              <>
                <p className="text-gray-800 font-medium mb-1">{file.name}</p>
                <p className="text-xs text-gray-500 mb-3">Định dạng CSV (.csv), {(file.size / 1024).toFixed(2)}KB</p>
              </>
            ) : (
              <>
                <p className="text-gray-800 font-medium mb-1">Chọn một tệp hoặc kéo và thả vào đây</p>
                <p className="text-xs text-gray-500 mb-3">Định dạng CSV (.csv), dung lượng tối đa 50MB</p>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement("input")
                input.type = "file"
                input.accept = ".csv"
                input.onchange = (event) => {
                  const selected = (event.target as HTMLInputElement).files?.[0]
                  if (selected) {
                    handleFileSelect(selected)
                  }
                }
                input.click()
              }}
            >
              Chọn tệp
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-[#167FFC] hover:bg-[#1470E3]"
            disabled={!file || loading || !programName}
            onClick={handleImport}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang import...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
