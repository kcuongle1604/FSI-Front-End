/**
 * HƯỚNG DẪN SỬ DỤNG IMPORT DIALOG
 * 
 * File này mô tả cách sử dụng component ImportDialog để import sinh viên từ CSV
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import ImportDialog from "./ImportDialog"

export default function StudentListWithImport() {
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [students, setStudents] = useState([])

  // Hàm này sẽ được gọi sau khi import thành công
  const handleImportComplete = async () => {
    // Reload danh sách sinh viên sau khi import
    await fetchStudents()
  }

  const fetchStudents = async () => {
    // Fetch students from API
    // const response = await getStudents()
    // setStudents(response.data.students)
  }

  return (
    <div>
      {/* Nút mở Import Dialog */}
      <Button 
        onClick={() => setShowImportDialog(true)}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Import từ CSV
      </Button>

      {/* Import Dialog */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onComplete={handleImportComplete}
      />

      {/* Danh sách sinh viên */}
      <div className="mt-4">
        {/* Your student table here */}
      </div>
    </div>
  )
}

/**
 * PROPS CỦA ImportDialog:
 * 
 * - open: boolean
 *   Trạng thái hiển thị của dialog
 * 
 * - onOpenChange: (open: boolean) => void
 *   Callback khi đóng/mở dialog
 * 
 * - onComplete?: () => void (optional)
 *   Callback được gọi sau khi import thành công
 *   Thường dùng để reload danh sách sinh viên
 */

/**
 * QUY TRÌNH IMPORT:
 * 
 * 1. Người dùng click nút "Import"
 * 2. Chọn file CSV và upload
 * 3. Cấu hình ánh xạ cột (nếu cần)
 * 4. Click "Phân tích" -> Gọi API analyzeImportCSV (dry_run=true)
 * 5. Xem kết quả phân tích (valid/invalid rows)
 * 6. Click "Import" -> Gọi API executeImportCSV (dry_run=false)
 * 7. Hiển thị kết quả và gọi onComplete callback
 */

/**
 * API CALLS:
 * 
 * 1. analyzeImportCSV(file, columnMapping)
 *    - Phân tích file CSV trước khi import
 *    - Returns: ImportAnalysisResult
 * 
 * 2. executeImportCSV(file, columnMapping)
 *    - Thực hiện import dữ liệu
 *    - Returns: UploadHistory
 */

/**
 * COLUMN MAPPING:
 * 
 * columnMapping là một object ánh xạ giữa tên trường trong hệ thống
 * và tên cột trong file CSV:
 * 
 * {
 *   "student_id": "MSSV",           // Hệ thống: student_id, CSV: MSSV
 *   "full_name": "Họ và tên",       // Hệ thống: full_name, CSV: Họ và tên
 *   "dob": "Ngày sinh",
 *   "class_name": "Lớp",
 *   "birthplace": "Nơi sinh",
 *   "phone_number": "Số điện thoại",
 *   "gpa": "Điểm TB"
 * }
 * 
 * Nếu tên cột CSV của bạn khác với mặc định, hãy cấu hình lại trong
 * tab "Ánh xạ cột" của ImportDialog
 */

/**
 * XỬ LÝ LỖI:
 * 
 * - Lỗi upload: Hiển thị trong bước upload
 * - Lỗi phân tích: Hiển thị trong tab "Chi tiết lỗi"
 * - Lỗi import: Hiển thị alert với số lượng thành công/thất bại
 * 
 * Các bản ghi có lỗi sẽ được bỏ qua, chỉ import các bản ghi hợp lệ
 */
