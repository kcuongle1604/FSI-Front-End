# Import Sinh Viên từ CSV

## Tổng quan

Chức năng import sinh viên cho phép bạn tải lên file CSV chứa thông tin sinh viên và import hàng loạt vào hệ thống. Hệ thống sẽ tự động kiểm tra và validate dữ liệu trước khi thực hiện import.

## Quy trình Import

### Bước 1: Chuẩn bị file CSV

File CSV cần có các cột sau:

| Tên cột | Bắt buộc | Định dạng | Mô tả |
|---------|----------|-----------|-------|
| `student_id` | ✅ Có | Số nguyên | Mã sinh viên |
| `full_name` | ✅ Có | Chuỗi | Họ và tên sinh viên |
| `dob` | ❌ Không | dd/mm/yyyy hoặc yyyy-mm-dd | Ngày sinh |
| `class_name` | ❌ Không | Chuỗi | Tên lớp (phải tồn tại trong hệ thống) |
| `birthplace` | ❌ Không | Chuỗi | Nơi sinh |
| `phone_number` | ❌ Không | Chuỗi | Số điện thoại |
| `gpa` | ❌ Không | Số thực | Điểm trung bình (0.0 - 4.0) |

#### Lưu ý:
- File CSV phải được mã hóa bằng UTF-8 để hiển thị đúng tiếng Việt
- Dung lượng tối đa: 50MB
- Các trường bắt buộc không được để trống
- Tên lớp phải tồn tại trong hệ thống
- Ngày sinh hỗ trợ nhiều định dạng: dd/mm/yyyy, yyyy-mm-dd, mm/dd/yyyy, dd-mm-yyyy

### Bước 2: Tải file lên và ánh xạ cột

1. Click vào nút "Import" trên trang quản lý sinh viên
2. Chọn hoặc kéo thả file CSV vào vùng upload
3. Ở bước "Ánh xạ cột", cấu hình tương ứng giữa tên cột trong CSV và trường dữ liệu hệ thống
   - Nếu tên cột CSV của bạn khác với mặc định, hãy điều chỉnh ở đây
   - Ví dụ: Nếu file CSV dùng cột "MSSV" thay vì "student_id", hãy nhập "MSSV" vào ô tương ứng
4. Click "Phân tích" để kiểm tra dữ liệu

### Bước 3: Xem kết quả phân tích

Sau khi phân tích, hệ thống sẽ hiển thị:

- **Tab Tổng quan**: Số lượng bản ghi hợp lệ và không hợp lệ
- **Tab Chi tiết lỗi**: Danh sách các dòng có lỗi với thông tin chi tiết

Các lỗi phổ biến:
- Thiếu thông tin bắt buộc (student_id, full_name)
- Định dạng dữ liệu không hợp lệ (ngày sinh, GPA)
- Tên lớp không tồn tại trong hệ thống
- MSSV không đúng định dạng số

### Bước 4: Thực hiện Import

1. Kiểm tra kết quả phân tích
2. Click nút "Import (X bản ghi)" để thực hiện import
3. Hệ thống sẽ:
   - Import tất cả các bản ghi hợp lệ
   - Bỏ qua các bản ghi có lỗi
   - Hiển thị thông báo kết quả (số bản ghi thành công/tổng số)

## File mẫu

Bạn có thể tải file mẫu tại: `/public/templates/student_import_template.csv`

```csv
student_id,full_name,dob,class_name,birthplace,phone_number,gpa
20210001,Nguyễn Văn An,01/01/2003,CNTT-K63,Hà Nội,0912345678,3.5
20210002,Trần Thị Bình,15/03/2003,CNTT-K63,Hải Phòng,0923456789,3.2
```

## API Backend

### Endpoint: `POST /students/import`

**Parameters:**
- `file` (required): File CSV cần import
- `dry_run` (boolean): 
  - `true`: Chỉ phân tích dữ liệu, không import (mặc định cho bước phân tích)
  - `false`: Thực hiện import dữ liệu
- `column_mapping` (string, optional): JSON string ánh xạ giữa trường hệ thống và cột CSV

**Ví dụ column_mapping:**
```json
{
  "student_id": "MSSV",
  "full_name": "Họ và tên",
  "dob": "Ngày sinh",
  "class_name": "Lớp",
  "birthplace": "Nơi sinh",
  "phone_number": "SĐT",
  "gpa": "Điểm TB"
}
```

### Response khi dry_run = true (Phân tích)

```typescript
interface ImportAnalysisResult {
  total_rows: number
  valid_count: number
  invalid_count: number
  valid_rows: ImportPreviewRow[]
  invalid_rows: ImportRowError[]
}
```

### Response khi dry_run = false (Import)

```typescript
interface UploadHistory {
  upload_id: number
  file_name: string
  status: string  // "COMPLETED" | "FAILED"
  total_processed: number
  success_count: number
  failure_count: number
  error_message: string | null
  created_at: string
  created_by_id: number
}
```

## Xử lý lỗi

### Lỗi khi upload file
- **File quá lớn**: Giảm kích thước file xuống dưới 50MB
- **Định dạng không đúng**: Chỉ chấp nhận file .csv
- **Mã hóa file**: Đảm bảo file được lưu với mã hóa UTF-8

### Lỗi khi phân tích
- **Invalid column mapping JSON**: Kiểm tra lại định dạng JSON của column mapping
- **Empty CSV**: File CSV không có dữ liệu
- **File encoding error**: File không được mã hóa đúng UTF-8

### Lỗi dữ liệu
- Các dòng có lỗi sẽ được hiển thị trong tab "Chi tiết lỗi"
- Hệ thống sẽ tự động bỏ qua các dòng lỗi và chỉ import các dòng hợp lệ

## Best Practices

1. **Kiểm tra dữ liệu trước khi import**
   - Luôn dùng chức năng phân tích trước khi import thực tế
   - Xem kỹ chi tiết lỗi để sửa dữ liệu nguồn nếu cần

2. **Chuẩn bị dữ liệu**
   - Sử dụng file mẫu làm template
   - Đảm bảo tên lớp đã tồn tại trong hệ thống trước khi import
   - Kiểm tra định dạng ngày tháng

3. **Import từng phần**
   - Với file lớn, nên chia nhỏ thành nhiều file để dễ xử lý lỗi
   - Mỗi file không nên quá 1000 dòng

4. **Backup dữ liệu**
   - Luôn backup database trước khi import số lượng lớn
   - Kiểm tra dữ liệu sau khi import

## Troubleshooting

### Import không thành công
1. Kiểm tra kết nối mạng và token xác thực
2. Xem console browser để kiểm tra lỗi API
3. Kiểm tra log backend để biết chi tiết lỗi

### Dữ liệu import sai
1. Kiểm tra lại column mapping
2. Đảm bảo các tên lớp trong CSV khớp chính xác với tên trong hệ thống
3. Kiểm tra định dạng ngày tháng

### File CSV không đọc được
1. Mở file bằng notepad và lưu lại với encoding UTF-8
2. Kiểm tra không có ký tự đặc biệt hoặc dấu xuống dòng trong dữ liệu
3. Đảm bảo dùng dấu phẩy (,) làm delimiter

## Hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ:
- Email: support@example.com
- Hotline: 1900-xxxx
