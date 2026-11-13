# Tài liệu API – Academic API

Base URL mặc định: `http://localhost:3001`. Mọi đường dẫn nghiệp vụ nằm dưới `/api`.

## Quy ước chung

**Định dạng response** (luôn là JSON):

```json
{ "success": true,  "data": { }, "pagination": { } }
{ "success": false, "error": { "code": "STUDENT_NOT_FOUND", "message": "…", "details": [ ] } }
```
`pagination` chỉ có ở API danh sách; `details` chỉ có khi lỗi kiểm tra dữ liệu.

**Phân trang** (mọi API danh sách): `?page=1&limit=10`. `page` ≥ 1, `limit` từ 1 đến 100 (mặc định 10 với sinh viên, 20 với các danh mục).
```json
"pagination": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
```

**Mã HTTP**: `200` thành công · `201` tạo mới · `400` dữ liệu/tham số sai · `404` không tìm thấy · `409` xung đột (trùng, còn dữ liệu liên quan) · `500` lỗi hệ thống.

**Quy ước cập nhật**: `PUT` gửi đầy đủ các trường bắt buộc; `PATCH` chỉ gửi các trường cần đổi (phải có ít nhất một trường). Trường lạ bị bỏ qua, chuỗi được cắt khoảng trắng hai đầu.

## Tổng hợp endpoint

| Nhóm | Method và đường dẫn | Mô tả |
|---|---|---|
| Hệ thống | `GET /`, `GET /api` | Thông tin API và danh sách endpoint |
| | `GET /api/health` | Kiểm tra server còn sống |
| Sinh viên | `GET /api/students` | Danh sách (tìm kiếm, lọc, sắp xếp, phân trang) |
| | `POST /api/students` | Thêm sinh viên |
| | `GET /api/students/:studentId` | Thông tin một sinh viên |
| | `PUT /api/students/:studentId` | Cập nhật đầy đủ |
| | `PATCH /api/students/:studentId` | Cập nhật một phần |
| | `DELETE /api/students/:studentId` | Xóa sinh viên và toàn bộ điểm của sinh viên đó |
| Học tập | `GET /api/students/:studentId/academic` | Bảng điểm, GPA, xếp loại |
| Điểm | `GET /api/students/:studentId/grades` | Danh sách điểm |
| | `POST /api/students/:studentId/grades` | Thêm điểm |
| | `PUT` / `PATCH /api/students/:studentId/grades/:gradeId` | Sửa điểm |
| | `DELETE /api/students/:studentId/grades/:gradeId` | Xóa điểm |
| Môn học | `GET/POST /api/courses`, `GET/PUT/PATCH/DELETE /api/courses/:courseId` | CRUD môn học |
| Khoa | `GET/POST /api/faculties`, `GET/PUT/PATCH/DELETE /api/faculties/:facultyId` | CRUD khoa |
| Ngành | `GET/POST /api/majors`, `GET/PUT/PATCH/DELETE /api/majors/:majorId` | CRUD ngành |
| Lớp | `GET/POST /api/classes`, `GET/PUT/PATCH/DELETE /api/classes/:classId` | CRUD lớp |

---

## Sinh viên

Mã sinh viên có dạng `SV` + 7 chữ số (ví dụ `SV2022001`). Mã viết thường như `sv2022001` vẫn được chấp nhận.

### `GET /api/students`

| Query | Ý nghĩa |
|---|---|
| `q` | Tìm theo họ tên, mã hoặc email. Chữ không dấu không phân biệt hoa/thường; chữ có dấu phải gõ đúng dấu |
| `classId`, `majorId`, `facultyId` | Lọc theo lớp, ngành, khoa |
| `status` | `Đang học`, `Bảo lưu`, `Đã tốt nghiệp`, `Thôi học` |
| `gender` | `Nam` hoặc `Nữ` |
| `enrolledYear` | Năm nhập học |
| `sortBy` | `studentId` (mặc định), `fullName`, `enrolledYear`, `dateOfBirth` |
| `order` | `asc` (mặc định) hoặc `desc` |
| `page`, `limit` | Phân trang |

Ví dụ: `GET /api/students?facultyId=1&status=Đang học&sortBy=fullName&limit=5`

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
      "class":   { "id": 1, "name": "KHMT22A" },
      "major":   { "id": 1, "name": "Khoa học máy tính" },
      "faculty": { "id": 1, "name": "Khoa Công nghệ thông tin" }
    }
  ],
  "pagination": { "page": 1, "limit": 5, "total": 12, "totalPages": 3 }
}
```

### `POST /api/students`

| Trường | Bắt buộc | Quy tắc |
|---|---|---|
| `studentId` | Không | `SV` + 7 chữ số. Bỏ trống thì tự sinh: `SV` + năm nhập học + số thứ tự 3 chữ số (`SV2024001`, `SV2024002`…) |
| `fullName` | Có | 2–100 ký tự |
| `dateOfBirth` | Có | `YYYY-MM-DD`, hợp lệ, từ 1950, không ở tương lai |
| `gender` | Có | `Nam` hoặc `Nữ` |
| `email` | Có | Đúng định dạng, **không trùng** (tự đổi về chữ thường) |
| `phone` | Không | 10 chữ số, bắt đầu bằng 0; có thể `null` |
| `classId` | Có | Id lớp đã tồn tại |
| `enrolledYear` | Có | Từ 2000 đến năm sau |
| `status` | Không | Mặc định `Đang học` |

Request:
```json
{
  "fullName": "Nguyễn Thị Mai", "dateOfBirth": "2005-05-05", "gender": "Nữ",
  "email": "mai.nt@student.edu.vn", "phone": "0912345678", "classId": 1, "enrolledYear": 2024
}
```
Response `201`: đối tượng sinh viên đầy đủ (như trên) với `"studentId": "SV2024001"`.

Lỗi thường gặp: `400 VALIDATION_ERROR` (có `details`), `400 INVALID_REFERENCE` (lớp không tồn tại), `409 EMAIL_ALREADY_EXISTS`, `409 STUDENT_ALREADY_EXISTS`.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu gửi lên không hợp lệ",
    "details": [
      { "field": "fullName", "message": "fullName phải có ít nhất 2 ký tự" },
      { "field": "gender",   "message": "gender phải là một trong: Nam, Nữ" },
      { "field": "classId",  "message": "classId là bắt buộc" }
    ]
  }
}
```

### `GET /api/students/:studentId`
Trả về một sinh viên. `400 INVALID_STUDENT_ID` nếu mã sai định dạng, `404 STUDENT_NOT_FOUND` nếu không có.

### `PUT` / `PATCH /api/students/:studentId`
Cùng các trường như khi thêm, **trừ `studentId` (không đổi được)**. `PUT` cần đủ trường bắt buộc, `PATCH` chỉ cần trường muốn đổi.
```json
{ "status": "Bảo lưu", "phone": null }
```

### `DELETE /api/students/:studentId`
Xóa sinh viên cùng toàn bộ điểm (trong một giao dịch). Response: `{ "success": true, "data": { "studentId": "SV2022012", "deleted": true } }`

---

## Hồ sơ học tập

### `GET /api/students/:studentId/academic`

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
      "totalCourses": 7, "totalCredits": 21, "passedCredits": 21,
      "gpa10": 8.38, "gpa4": 3.62, "classification": "Xuất sắc"
    },
    "results": [
      {
        "gradeId": 3, "semester": "2022-2023 HK1",
        "courseId": 6, "courseCode": "ENG1001", "courseName": "Tiếng Anh chuyên ngành", "credits": 2,
        "score10": 9, "letterGrade": "A", "score4": 4, "passed": true
      }
    ]
  }
}
```

GPA tính theo trọng số tín chỉ. Bảng quy đổi: ≥8.5 → A (4.0) · ≥8.0 → B+ (3.5) · ≥7.0 → B (3.0) · ≥6.5 → C+ (2.5) · ≥5.5 → C (2.0) · ≥5.0 → D+ (1.5) · ≥4.0 → D (1.0) · còn lại F (0). Điểm < 4.0 là không đạt (`passed: false`, không tính vào `passedCredits`).
Xếp loại theo GPA hệ 4: ≥3.6 Xuất sắc · ≥3.2 Giỏi · ≥2.5 Khá · ≥2.0 Trung bình · còn lại Yếu.
Sinh viên chưa có điểm: `results: []`, các số trong `summary` bằng 0, `classification: null`.

---

## Điểm

Mỗi sinh viên chỉ có một điểm cho mỗi cặp (môn học, học kỳ).

### `GET /api/students/:studentId/grades`
Danh sách điểm (cùng cấu trúc phần tử `results` ở trên), sắp theo học kỳ rồi mã môn.

### `POST /api/students/:studentId/grades`

| Trường | Bắt buộc | Quy tắc |
|---|---|---|
| `courseId` | Có | Id môn học đã tồn tại |
| `semester` | Có | Dạng `2023-2024 HK1` (HK1, HK2 hoặc HK3) |
| `score` | Có | Số từ 0 đến 10 |

```json
{ "courseId": 1, "semester": "2024-2025 HK1", "score": 8.5 }
```
Response `201`:
```json
{
  "success": true,
  "data": {
    "gradeId": 61, "semester": "2024-2025 HK1",
    "courseId": 1, "courseCode": "INT1001", "courseName": "Lập trình căn bản", "credits": 3,
    "score10": 8.5, "letterGrade": "A", "score4": 4, "passed": true
  }
}
```
Lỗi: `404 STUDENT_NOT_FOUND`, `400 INVALID_REFERENCE` (môn không tồn tại), `409 GRADE_ALREADY_EXISTS`.

### `PUT` / `PATCH /api/students/:studentId/grades/:gradeId`
Sửa môn, học kỳ hoặc điểm. Điểm không thuộc sinh viên trên đường dẫn thì trả `404 GRADE_NOT_FOUND`.

### `DELETE /api/students/:studentId/grades/:gradeId`
Response: `{ "success": true, "data": { "gradeId": 61, "deleted": true } }`

---

## Danh mục: môn học, khoa, ngành, lớp

Cả bốn nhóm có cùng bộ endpoint: `GET` danh sách (có `q`, `page`, `limit`), `POST`, `GET/PUT/PATCH/DELETE` theo id.

| Nhóm | Trường khi tạo/sửa | Lọc danh sách | Response mẫu |
|---|---|---|---|
| Môn học `/api/courses` | `code` (3 chữ cái + 4 chữ số, tự viết hoa), `name`, `credits` (1–10) | `q` (mã/tên) | `{ "id": 1, "code": "INT1001", "name": "Lập trình căn bản", "credits": 3 }` |
| Khoa `/api/faculties` | `name` | `q` | `{ "id": 1, "name": "Khoa Công nghệ thông tin", "majorCount": 3 }` |
| Ngành `/api/majors` | `name`, `facultyId` | `q`, `facultyId` | `{ "id": 1, "name": "Khoa học máy tính", "faculty": { "id": 1, "name": "…" }, "classCount": 2 }` |
| Lớp `/api/classes` | `name` (chữ và số, 3–20 ký tự, tự viết hoa), `majorId` | `q`, `majorId`, `facultyId` | `{ "id": 1, "name": "KHMT22A", "major": { … }, "faculty": { … }, "studentCount": 3 }` |

Quy tắc ràng buộc:
- Mã môn, tên khoa, tên ngành, tên lớp **không được trùng** → `409 DUPLICATE_RESOURCE`.
- `facultyId`, `majorId` gửi lên phải tồn tại → `400 INVALID_REFERENCE`.
- Không xóa được khi còn dữ liệu liên quan → `409 RESOURCE_IN_USE`: môn đã có điểm, khoa còn ngành, ngành còn lớp, lớp còn sinh viên.

---

## Bảng mã lỗi

| HTTP | `error.code` | Khi nào |
|---|---|---|
| 400 | `INVALID_STUDENT_ID` | Mã sinh viên sai định dạng |
| 400 | `INVALID_ID` | Id trên đường dẫn không phải số nguyên dương |
| 400 | `INVALID_QUERY` | Tham số query sai (có `details`) |
| 400 | `VALIDATION_ERROR` | Body sai hoặc thiếu trường (có `details`) |
| 400 | `INVALID_JSON` | Body JSON bị hỏng |
| 400 | `INVALID_REFERENCE` | Tham chiếu tới lớp/ngành/khoa/môn không tồn tại |
| 404 | `STUDENT_NOT_FOUND`, `GRADE_NOT_FOUND`, `COURSE_NOT_FOUND`, `FACULTY_NOT_FOUND`, `MAJOR_NOT_FOUND`, `CLASS_NOT_FOUND` | Không có bản ghi tương ứng |
| 404 | `ROUTE_NOT_FOUND` | Đường dẫn hoặc phương thức không tồn tại |
| 409 | `EMAIL_ALREADY_EXISTS`, `STUDENT_ALREADY_EXISTS`, `GRADE_ALREADY_EXISTS`, `DUPLICATE_RESOURCE` | Trùng dữ liệu |
| 409 | `RESOURCE_IN_USE` | Không xóa được vì còn dữ liệu liên quan |
| 409 | `STUDENT_ID_EXHAUSTED` | Đã dùng hết 999 mã của một năm nhập học |
| 413 | `PAYLOAD_TOO_LARGE` | Body vượt 100 KB |
| 500 | `INTERNAL_ERROR` | Lỗi không lường trước |
