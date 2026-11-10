# Academic API (Backend)

REST API quản lý thông tin sinh viên, xây dựng bằng **Node.js + Express**, lưu dữ liệu bằng **SQLite** (module `node:sqlite` có sẵn trong Node ≥ 22.13, không cần cài thêm driver).

Đây là một trong hai API độc lập của hệ thống; **Student Portal** gọi API này qua HTTP/JSON để lấy thông tin sinh viên, lớp, ngành học, khoa.

## Chạy project

```bash
npm install
npm run seed     # (tuỳ chọn) nạp lại dữ liệu mẫu, server cũng tự nạp ở lần chạy đầu
npm start        # http://localhost:3001  (đổi cổng: PORT=4000 npm start)
```

## Cấu trúc

```
src/
  db.js       # schema SQLite
  seed.js     # dữ liệu mẫu: 20 sinh viên, 6 lớp, 5 ngành, 3 khoa, 9 môn, điểm
  app.js      # các route + validate + xử lý lỗi
  server.js   # khởi động server
postman/      # Postman Collection (import trực tiếp)
```

## Database

| Bảng | Nội dung |
|---|---|
| `faculties` | Khoa |
| `majors` | Ngành học (thuộc khoa) |
| `classes` | Lớp (thuộc ngành) |
| `students` | Sinh viên: mã SVxxxxxxx, họ tên, ngày sinh, giới tính, email, SĐT, lớp, năm nhập học, trạng thái |
| `courses` | Môn học: mã, tên, số tín chỉ |
| `grades` | Điểm (hệ 10) theo sinh viên, môn, học kỳ |

Mã sinh viên mẫu: `SV2022001` … `SV2022012`.

## Endpoint

Tất cả response là JSON. Thành công có `"success": true`; lỗi có `"success": false` và `error: { code, message }`.

### 1. `GET /api/students` – Danh sách sinh viên

Query (đều tuỳ chọn): `q` (tìm theo tên/mã/email), `classId`, `majorId`, `facultyId`, `page` (mặc định 1), `limit` (mặc định 10, tối đa 100).

Request: `GET /api/students?q=Nguyễn&limit=2`

Response `200`:
```json
{
  "success": true,
  "data": [
    {
      "studentId": "SV2022001",
      "fullName": "Nguyễn Văn An",
      "dateOfBirth": "2004-03-12",
      "gender": "Nam",
      "email": "an.nv@student.edu.vn",
      "phone": "0901000001",
      "enrolledYear": 2022,
      "status": "Đang học",
      "class": { "id": 1, "name": "KHMT22A" },
      "major": { "id": 1, "name": "Khoa học máy tính" },
      "faculty": { "id": 1, "name": "Khoa Công nghệ thông tin" }
    }
  ],
  "pagination": { "page": 1, "limit": 2, "total": 1, "totalPages": 1 }
}
```

### 2. `GET /api/students/:studentId` – Thông tin một sinh viên

Request: `GET /api/students/SV2022001`

Response `200`: `{ "success": true, "data": { ...như một phần tử ở trên } }`

### 3. `GET /api/students/:studentId/academic` – Thông tin học tập

Request: `GET /api/students/SV2022001/academic`

Response `200`:
```json
{
  "success": true,
  "data": {
    "studentId": "SV2022001",
    "fullName": "Nguyễn Văn An",
    "className": "KHMT22A",
    "majorName": "Khoa học máy tính",
    "facultyName": "Khoa Công nghệ thông tin",
    "summary": {
      "totalCourses": 7,
      "totalCredits": 21,
      "passedCredits": 21,
      "gpa10": 8.38,
      "gpa4": 3.62,
      "classification": "Xuất sắc"
    },
    "results": [
      {
        "semester": "2022-2023 HK1",
        "courseCode": "ENG1001",
        "courseName": "Tiếng Anh chuyên ngành",
        "credits": 2,
        "score10": 9,
        "letterGrade": "A",
        "score4": 4,
        "passed": true
      }
    ]
  }
}
```
GPA tính theo trọng số tín chỉ. Quy đổi: ≥8.5→A(4.0), ≥8.0→B+(3.5), ≥7.0→B(3.0), ≥6.5→C+(2.5), ≥5.5→C(2.0), ≥5.0→D+(1.5), ≥4.0→D(1.0), còn lại F(0). Điểm < 4.0 là không đạt.

### Phụ: `GET /api/health`
`{ "success": true, "service": "academic-api", "status": "ok" }`

## Mã lỗi

| HTTP | `error.code` | Khi nào |
|---|---|---|
| 400 | `INVALID_STUDENT_ID` | Mã không đúng dạng `SV` + 7 chữ số |
| 400 | `INVALID_QUERY` | `page`/`limit`/`classId`… sai kiểu hoặc ngoài khoảng (có `details`) |
| 404 | `STUDENT_NOT_FOUND` | Không có sinh viên với mã đó |
| 404 | `ROUTE_NOT_FOUND` | Đường dẫn không tồn tại |
| 500 | `INTERNAL_ERROR` | Lỗi không lường trước |

Ví dụ lỗi `404`:
```json
{ "success": false, "error": { "code": "STUDENT_NOT_FOUND", "message": "Không tìm thấy sinh viên có mã SV9999999" } }
```

## Kiểm thử bằng Postman

1. Postman → **Import** → chọn `postman/Academic-API.postman_collection.json`.
2. Biến collection: `baseUrl` (mặc định `http://localhost:3001`), `studentId` (mặc định `SV2022001`).
3. Chạy từng request hoặc **Run collection**: mỗi request có sẵn test tự động (status code, cấu trúc dữ liệu, các trường hợp lỗi 400/404).

## Cách Student Portal gọi API

```js
const res = await fetch('http://localhost:3001/api/students/SV2022001');
const { data } = await res.json();
```
CORS đã được bật nên frontend ở origin khác gọi được trực tiếp.
