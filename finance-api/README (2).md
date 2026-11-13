# Finance API (Backend)

REST API quản lý học phí và công nợ sinh viên, xây dựng bằng **Node.js + Express**, lưu dữ liệu bằng **SQLite** (module `node:sqlite` có sẵn trong Node ≥ 22.13).

Đây là mảnh ghép thứ hai trong kiến trúc Microservices của hệ thống. Finance API hoạt động **hoàn toàn độc lập** với Academic API. **Student Portal (Frontend)** sẽ gọi API này qua HTTP/JSON để lấy thông tin công nợ và thực hiện thanh toán.

## Tính năng nổi bật (Architecture & Security)
- **Kiến trúc 3 lớp:** Router/Controller -> Service -> Repository (Tối ưu hóa maintainability).
- **Tham chiếu lỏng (Loose Coupling):** Không lưu trữ thông tin cá nhân của sinh viên, chỉ tham chiếu qua `studentId`.
- **An toàn giao dịch (ACID):** Áp dụng Database Transaction (`BEGIN IMMEDIATE`) để xử lý thanh toán, chống lại hoàn toàn tình trạng *Race Condition* (nộp vượt trần) và *Idempotency* (Frontend nộp trùng mã giao dịch).

## Chạy project

```bash
npm install
npm run seed     # Nạp dữ liệu mẫu vào DB (Chạy lặp lại an toàn)
npm start        # http://localhost:3002 (Cổng mặc định của Finance API)
```

## Cấu trúc thư mục

```text
src/
  config/db.js           # Khởi tạo SQLite và schema
  controllers/           # Tiếp nhận Request, Validate và trả về JSON
  services/              # Chứa business logic, xử lý Transaction
  repositories/          # Truy vấn Database (SELECT, INSERT, UPDATE)
  routes/                # Định nghĩa các endpoint
  utils/AppError.js      # Lớp xử lý mã lỗi nghiệp vụ
  scripts/seed.js        # Dữ liệu mẫu (mock data)
  app.js                 # Cấu hình Express, Middleware
  server.js              # Entry point khởi động server
```

## Database Schema (SQLite)

| Bảng | Nội dung | Ràng buộc quan trọng |
|---|---|---|
| `tuition_fees` | Học phí (id, studentId, semester, totalAmount, dueDate, status) | `UNIQUE(studentId, semester)`, `CHECK(totalAmount >= 0)` |
| `payments` | Lịch sử nộp (id, tuitionFeeId, amountPaid, paymentDate, transactionRef) | `transactionRef UNIQUE`, `CHECK(amountPaid > 0)` |

*Lưu ý: Không xóa học phí (`ON DELETE RESTRICT`) nếu đã có lịch sử thanh toán.*

---

## Danh sách API Endpoints

Tất cả response đều trả về chuẩn JSON.
- **Thành công:** `{ "success": true, "data": ... }`
- **Thất bại:** `{ "success": false, "error": { "code", "message" } }`

### 1. `GET /api/tuitions/:studentId` – Tra cứu công nợ

**Request:** `GET /api/tuitions/SV2022001`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "studentId": "SV2022001",
    "summary": {
      "totalDebt": 15000000,
      "totalPaid": 5000000
    },
    "semesters": [
      {
        "tuitionFeeId": 1,
        "semester": "2023-2024 HK1",
        "totalAmount": 15000000,
        "dueDate": "2023-10-15",
        "paidAmount": 5000000,
        "remainingAmount": 10000000,
        "status": "PARTIAL"
      }
    ]
  }
}
```

### 2. `POST /api/payments` – Ghi nhận thanh toán

**Request:** `POST /api/payments`
```json
{
    "tuitionFeeId": 1,
    "amountPaid": 5000000,
    "transactionRef": "TXN_MoiNhat_001"
}
```

**Response `200`:**
```json
{
    "success": true,
    "data": {
        "tuitionFeeId": 1,
        "transactionRef": "TXN_MoiNhat_001",
        "amountPaid": 5000000,
        "paymentDate": "2026-11-13T17:10:00.000Z",
        "newStatus": "PARTIAL",
        "remainingDebt": 5000000
    }
}
```

### 3. `GET /api/tuitions/:tuitionFeeId/payments` – Xem lịch sử giao dịch

**Request:** `GET /api/tuitions/1/payments`

**Response `200`:** Trả về mảng chứa danh sách các lần nộp tiền của học kỳ đó.
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "tuitionFeeId": 1,
            "amountPaid": 5000000,
            "paymentDate": "2023-09-20T08:30:00Z",
            "transactionRef": "TXN123456789"
        }
    ]
}
```

### Phụ: `GET /api/health`
Kiểm tra trạng thái server đang hoạt động.

---

## Bảng Mã Lỗi (Error Codes)

| HTTP | `error.code` | Khi nào xảy ra |
|---|---|---|
| **400** | `INVALID_TUITION_ID` / `INVALID_AMOUNT` | Đầu vào không hợp lệ (âm, không phải số) |
| **400** | `OVERPAYMENT` | Số tiền nộp lớn hơn số nợ còn lại |
| **400** | `ALREADY_PAID` | Khoản học phí này đã thanh toán xong |
| **404** | `TUITION_NOT_FOUND` | Không tìm thấy học phí |
| **409** | `DUPLICATE_TRANSACTION` | Giao dịch gửi lên bị trùng lặp `transactionRef` |
| **500** | `INTERNAL_ERROR` | Lỗi DB hoặc hệ thống không lường trước |

## Tích hợp Frontend

Portal có thể gọi trực tiếp API này từ trình duyệt nhờ CORS đã được kích hoạt.
Ví dụ nộp tiền:
```javascript
const res = await fetch('http://localhost:3002/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tuitionFeeId: 1, amountPaid: 2000000, transactionRef: 'unique-id-123' })
});
const { data, error } = await res.json();
```