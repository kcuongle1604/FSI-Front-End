# 🚀 QUICK START - Import Sinh Viên

## Bắt Đầu Nhanh trong 5 Phút

### Bước 1: Kiểm Tra File Đã Tạo ✅

```
✓ src/app/quan-ly-du-lieu/sinh-vien/types.ts (updated)
✓ src/app/quan-ly-du-lieu/sinh-vien/student.api.ts (updated)
✓ src/app/quan-ly-du-lieu/sinh-vien/components/ImportDialog.tsx (updated)
✓ src/app/quan-ly-du-lieu/sinh-vien/page.tsx (updated)
✓ public/templates/student_import_template.csv (new)
```

### Bước 2: Chạy Frontend

```bash
npm run dev
```

### Bước 3: Test Import

1. Mở trình duyệt: `http://localhost:3000`
2. Vào: **Quản lý dữ liệu > Sinh viên**
3. Click nút **Import**
4. Upload file: `public/templates/student_import_template.csv`
5. Click **Tiếp** → **Phân tích** → **Import**

### Bước 4: Verify Backend API

Đảm bảo backend của bạn có endpoint:

```python
POST /students/import
```

Với parameters:
- `file: UploadFile` - CSV file
- `dry_run: bool` - true/false
- `column_mapping: Optional[str]` - JSON string

### Bước 5: Test với dữ liệu thực

Tạo file CSV của bạn:

```csv
student_id,full_name,dob,class_name,birthplace,phone_number,gpa
20230001,Nguyễn Văn A,01/01/2005,CNTT-K65,Hà Nội,0912345678,3.5
20230002,Trần Thị B,15/02/2005,CNTT-K65,TP.HCM,0923456789,3.8
```

**Lưu ý:**
- Encoding: **UTF-8**
- Tên lớp phải tồn tại trong hệ thống
- Trường bắt buộc: student_id, full_name

---

## 🎯 Các Tính Năng Chính

### ✅ Đã Triển Khai
- [x] Upload CSV file
- [x] Validate file (type, size, encoding)
- [x] Column mapping linh hoạt
- [x] Dry run analysis (validate trước)
- [x] Error reporting chi tiết
- [x] Import chỉ records hợp lệ
- [x] Auto refresh sau import
- [x] Loading & error states

### 🔄 Quy Trình
```
Upload → Mapping → Analyze → Review → Import → Refresh
```

---

## 📖 Documentation

- **Chi tiết đầy đủ**: `IMPLEMENTATION_SUMMARY.md`
- **Hướng dẫn người dùng**: `IMPORT_GUIDE.md`
- **Code example**: `components/ImportDialogUsageExample.tsx`

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid column mapping JSON"
**Solution:** Kiểm tra format JSON của column_mapping

### Issue: "Class not found"
**Solution:** Tạo class trong hệ thống trước khi import

### Issue: "File encoding error"
**Solution:** Save file với UTF-8 encoding

### Issue: API 401/403
**Solution:** Kiểm tra authentication token

---

## 📞 Need Help?

1. Check `IMPORT_GUIDE.md` cho hướng dẫn chi tiết
2. Check `IMPLEMENTATION_SUMMARY.md` cho tài liệu kỹ thuật
3. Check browser console (F12) cho lỗi frontend
4. Check backend logs cho lỗi API

---

## 🎉 Hoàn Thành!

Chức năng import đã sẵn sàng sử dụng. Happy coding! 🚀
