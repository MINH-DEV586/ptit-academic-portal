# Academic API

REST API quản lý thông tin sinh viên, xây dựng bằng **Node.js + Express**, lưu dữ liệu bằng **SQLite**.
Đây là một trong hai API độc lập của hệ thống; **Student Portal** gọi API này qua HTTP/JSON để lấy thông tin sinh viên, lớp, ngành học, khoa và điểm số.

## Chạy project

Yêu cầu **Node.js ≥ 22.13** (database dùng module `node:sqlite` có sẵn, không cần cài driver). Cảnh báo `ExperimentalWarning: SQLite` khi chạy là bình thường.

```bash
npm install
npm start        # http://localhost:3001  (lần đầu tự tạo database và nạp 20 sinh viên mẫu)
```

| Lệnh | Tác dụng |
|---|---|
| `npm start` | Chạy server |
| `npm run dev` | Chạy và tự khởi động lại khi sửa code |
| `npm run seed` | Xóa và nạp lại dữ liệu mẫu |
| `npm test` | Chạy toàn bộ test (40 test, database trong bộ nhớ, không ảnh hưởng dữ liệu thật) |

Mở `http://localhost:3001` để xem danh sách endpoint. Cấu hình (cổng, đường dẫn database, CORS) qua biến môi trường hoặc file `.env`, xem mẫu ở `.env.example`.

## Cấu trúc thư mục

```
academic-api/
├── src/
│   ├── server.js            # Điểm khởi động: kết nối DB, nạp dữ liệu mẫu, mở cổng
│   ├── app.js               # Lắp ráp Express: middleware → routes → xử lý lỗi
│   ├── config/              # Cấu hình tập trung (cổng, DB, CORS)
│   ├── routes/              # Khai báo đường dẫn → controller (mỗi tài nguyên một file)
│   ├── controllers/         # Nhận request, gọi service, trả response (mỏng, không có nghiệp vụ)
│   ├── services/            # Nghiệp vụ: kiểm tra quy tắc, ghép dữ liệu, tính GPA
│   ├── repositories/        # Truy cập database: chỉ chứa SQL
│   ├── mappers/             # Đổi dòng DB (snake_case) sang JSON trả về (camelCase)
│   ├── validators/          # Schema kiểm tra dữ liệu đầu vào cho từng tài nguyên
│   ├── middlewares/         # validate, errorHandler, requestLogger
│   ├── utils/               # ApiError, response, validator, grading, pagination, sql...
│   └── database/
│       ├── index.js         # Kết nối SQLite, giao dịch
│       ├── schema.sql       # Câu lệnh tạo bảng
│       └── seed/            # Dữ liệu mẫu, mỗi bảng một file trong seed/data/
├── test/
│   ├── unit/                # Test hàm thuần (GPA, validator, SQL helper)
│   ├── integration/         # Test qua HTTP với database trong bộ nhớ
│   └── helpers/testApp.js
├── postman/                 # Postman Collection (53 request, có test tự động)
└── docs/
    ├── API.md               # Tài liệu endpoint đầy đủ (request/response, mã lỗi)
    └── DATABASE.md          # ERD và mô tả bảng
```

## Một request đi qua những đâu

Ví dụ `POST /api/students`:

```
Request → routes/student.routes.js
        → middlewares/validate.js     kiểm tra body theo validators/student.validator.js (sai thì 400)
        → controllers/student.controller.js
        → services/student.service.js  kiểm tra lớp tồn tại, email không trùng, sinh mã sinh viên
        → repositories/student.repository.js   câu lệnh INSERT
        → mappers/student.mapper.js    định dạng JSON trả về
        → Response 201
```
Lỗi ở bất kỳ tầng nào chỉ cần `throw` một `ApiError`; `middlewares/errorHandler.js` biến nó thành response JSON thống nhất.

Mỗi tầng chỉ làm một việc nên dễ tìm và dễ sửa: đổi câu SQL thì vào `repositories/`, đổi quy tắc nghiệp vụ thì vào `services/`, đổi quy tắc kiểm tra dữ liệu thì vào `validators/`.

## Thêm một endpoint mới

1. `validators/`: định nghĩa schema dữ liệu (nếu có body hoặc query).
2. `repositories/`: viết hàm SQL cần dùng.
3. `services/`: viết nghiệp vụ, ném `ApiError` khi vi phạm quy tắc.
4. `controllers/`: viết hàm nhận request và gọi service.
5. `routes/`: khai báo đường dẫn, gắn `validateBody` hoặc `validateQuery`.
6. `test/integration/`: viết test; `postman/`: thêm request nếu cần.

## Tổng quan API

Mọi response đều là JSON, thành công có `"success": true`, lỗi có `"success": false` và `error: { code, message }`. Chi tiết từng endpoint, ví dụ request/response và bảng mã lỗi: **[docs/API.md](docs/API.md)**.

| Tài nguyên | Endpoint |
|---|---|
| Sinh viên | `GET/POST /api/students` · `GET/PUT/PATCH/DELETE /api/students/:studentId` |
| Hồ sơ học tập | `GET /api/students/:studentId/academic` (điểm từng môn, GPA hệ 10 và hệ 4, xếp loại) |
| Điểm | `GET/POST /api/students/:studentId/grades` · `PUT/PATCH/DELETE …/grades/:gradeId` |
| Môn học | `GET/POST /api/courses` · `GET/PUT/PATCH/DELETE /api/courses/:courseId` |
| Khoa | `GET/POST /api/faculties` · `GET/PUT/PATCH/DELETE /api/faculties/:facultyId` |
| Ngành | `GET/POST /api/majors` · `GET/PUT/PATCH/DELETE /api/majors/:majorId` |
| Lớp | `GET/POST /api/classes` · `GET/PUT/PATCH/DELETE /api/classes/:classId` |
| Hệ thống | `GET /api` (danh sách endpoint) · `GET /api/health` |

Danh sách sinh viên hỗ trợ tìm kiếm (`q`), lọc (`classId`, `majorId`, `facultyId`, `status`, `gender`, `enrolledYear`), sắp xếp (`sortBy`, `order`) và phân trang (`page`, `limit`).

## Database

6 bảng `faculties → majors → classes → students → grades ← courses` với khóa ngoại và ràng buộc kiểm tra. Sơ đồ ERD và mô tả từng bảng: **[docs/DATABASE.md](docs/DATABASE.md)**. Dữ liệu mẫu gồm 20 sinh viên (`SV2022001`–`SV2022020`), 6 lớp, 5 ngành, 3 khoa, 9 môn học và 60 điểm.

## Kiểm thử bằng Postman

1. Postman → **Import** → chọn `postman/Academic-API.postman_collection.json`.
2. Chạy server (`npm start`), rồi bấm **Run collection** để chạy cả bộ.
3. Collection gồm 7 nhóm: Health, Students, Courses, Faculties, Majors, Classes và Kiểm tra lỗi. Mỗi request có test tự động. Các request thêm/sửa/xóa tự tạo rồi tự dọn dữ liệu thử nghiệm, nên chạy lại nhiều lần vẫn được.

Biến collection: `baseUrl` (mặc định `http://localhost:3001`) và `studentId` (mặc định `SV2022001`).

## Student Portal gọi API như thế nào

```js
const res = await fetch('http://localhost:3001/api/students/SV2022001/academic');
const { success, data, error } = await res.json();
if (!success) console.error(error.code, error.message);
```
CORS đã bật sẵn. Giới hạn nguồn được gọi bằng biến `CORS_ORIGIN` trong `.env`.
