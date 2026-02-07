"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, FileText, Upload, CheckCircle2, Loader2 } from "lucide-react"
import { uploadScores } from "../score.api"
import type { ScoreImportResponse } from "../types"

interface ScoreImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImportSuccess?: (result: ScoreImportResponse) => void
}

export default function ScoreImportDialog({ open, onOpenChange, onImportSuccess }: ScoreImportDialogProps) {
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importError, setImportError] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [importResult, setImportResult] = useState<ScoreImportResponse | null>(null)
    const [importStep, setImportStep] = useState<'upload' | 'result'>('upload')

    const handleFileSelect = async (file: File) => {
        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            setImportError("File vượt quá dung lượng cho phép. Giới hạn tối đa: 50 MB.")
            setImportFile(null)
            return
        }

        // Validate file type
        const lowerName = file.name.toLowerCase()
        if (!lowerName.endsWith('.csv')) {
            setImportError("Định dạng file không hợp lệ, chỉ chấp nhận .csv")
            setImportFile(null)
            return
        }

        setImportError("")
        setImportFile(file)
    }

    const handleUpload = async () => {
        if (!importFile) return

        try {
            setLoading(true)
            setImportError("")

            console.log('🚀 Uploading scores:', {
                file: importFile.name,
                size: importFile.size,
            })

            const response = await uploadScores(importFile)
            setImportResult(response.data)
            setImportStep('result')

            // Call success callback
            if (onImportSuccess) {
                onImportSuccess(response.data)
            }
        } catch (error: any) {
            console.error("❌ Upload error:", error)
            console.error("❌ Error response:", error.response?.data)

            // Handle validation errors
            if (error.response?.status === 422) {
                const validationErrors = error.response?.data?.detail
                if (validationErrors && Array.isArray(validationErrors)) {
                    const errorMessages = validationErrors.map((err: any) => err.msg).join(", ")
                    setImportError(`Lỗi xác thực: ${errorMessages}`)
                } else {
                    setImportError("Lỗi xác thực dữ liệu. Vui lòng kiểm tra lại file.")
                }
            } else {
                setImportError(error.response?.data?.detail || error.message || "Lỗi khi tải file lên. Vui lòng thử lại.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen)
        if (!newOpen) {
            // Reset all states
            setImportFile(null)
            setImportError("")
            setImportStep('upload')
            setImportResult(null)
        }
    }

    const uploadStepContent = (
        <>
            <DialogHeader>
                <DialogTitle>Tải điểm lên</DialogTitle>
                <DialogDescription>Chọn file CSV chứa dữ liệu điểm</DialogDescription>
            </DialogHeader>
            <div className="pt-0 pb-4">
                {importError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                        <AlertCircle className="h-4 w-4" /><span>{importError}</span>
                    </div>
                )}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${importError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                    onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const file = e.dataTransfer.files?.[0]
                        if (file) {
                            handleFileSelect(file)
                        }
                    }}
                >
                    <div className="flex justify-center mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${importFile ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            {importFile ? <FileText className="h-5 w-5 text-blue-600" /> : <Upload className="h-5 w-5 text-gray-500" />}
                        </div>
                    </div>
                    {importFile ? (
                        <>
                            <p className="text-gray-800 font-medium mb-1">{importFile.name}</p>
                            <p className="text-xs text-gray-500 mb-3">Định dạng CSV (.csv), {(importFile.size / 1024).toFixed(2)}KB</p>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-800 font-medium mb-1">Chọn một tệp hoặc kéo và thả vào đây</p>
                            <p className="text-xs text-gray-500 mb-3">Định dạng CSV (.csv), dung lượng tối đa 50MB</p>
                        </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'; input.accept = '.csv'
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                                handleFileSelect(file)
                            }
                        }
                        input.click()
                    }}>Chọn tệp</Button>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => handleOpenChange(false)}>Hủy</Button>
                <Button
                    className="bg-[#167FFC] hover:bg-[#1470E3]"
                    disabled={!importFile || !!importError || loading}
                    onClick={handleUpload}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải lên...
                        </>
                    ) : (
                        'Tải lên'
                    )}
                </Button>
            </DialogFooter>
        </>
    )

    const resultStepContent = (
        <>
            <DialogHeader>
                <DialogTitle>Kết quả Import Điểm</DialogTitle>
            </DialogHeader>
            <div className="py-6">
                {importResult && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center">
                            {importResult.status === 'completed' || importResult.failure_count === 0 ? (
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                            ) : (
                                <AlertCircle className="h-16 w-16 text-amber-500" />
                            )}
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg font-semibold">
                                {importResult.status === 'completed'
                                    ? 'Import thành công!'
                                    : `Trạng thái: ${importResult.status}`}
                            </p>
                            <div className="text-sm text-gray-600">
                                <p>File: {importResult.file_name}</p>
                                <p>Thời gian: {new Date(importResult.created_at).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Tổng số</p>
                                    <p className="text-2xl font-bold text-blue-600">{importResult.total_processed}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Thành công</p>
                                    <p className="text-2xl font-bold text-green-600">{importResult.success_count}</p>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Thất bại</p>
                                    <p className="text-2xl font-bold text-red-600">{importResult.failure_count}</p>
                                </div>
                            </div>
                            {importResult.error_message && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg text-left">
                                    <p className="text-sm font-medium text-red-800">Thông báo lỗi:</p>
                                    <p className="text-sm text-red-600 mt-1">{importResult.error_message}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button className="bg-[#167FFC] hover:bg-[#1470E3]" onClick={() => handleOpenChange(false)}>Đóng</Button>
            </DialogFooter>
        </>
    )

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                {importStep === 'upload' && uploadStepContent}
                {importStep === 'result' && resultStepContent}
            </DialogContent>
        </Dialog>
    )
}
