const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestApp } = require('../helpers/testApp');

let api;
before(async () => { api = await startTestApp(); });
after(() => api.stop());

const validStudent = (overrides = {}) => ({
  fullName: 'Nguyễn Thị Test',
  dateOfBirth: '2005-05-05',
  gender: 'Nữ',
  email: 'test.nt@student.edu.vn',
  phone: '0912345678',
  classId: 1,
  enrolledYear: 2024,
  ...overrides,
});

test('danh sách: đủ 20 sinh viên, phân trang đúng', async () => {
  const { status, body } = await api.get('/api/students');
  assert.equal(status, 200);
  assert.equal(body.pagination.total, 20);
  assert.equal(body.pagination.totalPages, 2);
  assert.equal(body.data.length, 10);

  const page2 = await api.get('/api/students?page=2');
  assert.equal(page2.body.data.length, 10);

  const all = await api.get('/api/students?limit=20');
  assert.equal(new Set(all.body.data.map((s) => s.studentId)).size, 20);
});

test('danh sách: tìm kiếm, lọc và sắp xếp', async () => {
  const byName = await api.get('/api/students?q=' + encodeURIComponent('Nguyễn'));
  assert.ok(byName.body.data.length >= 2);
  assert.ok(byName.body.data.every((s) => s.fullName.includes('Nguyễn')));

  const byFaculty = await api.get('/api/students?facultyId=2&limit=20');
  assert.ok(byFaculty.body.data.length > 0);
  assert.ok(byFaculty.body.data.every((s) => s.faculty.id === 2));

  const onHold = await api.get('/api/students?status=' + encodeURIComponent('Bảo lưu') + '&limit=20');
  assert.equal(onHold.body.pagination.total, 2);

  const sorted = await api.get('/api/students?sortBy=fullName&order=desc&limit=20');
  const names = sorted.body.data.map((s) => s.fullName);
  assert.equal(names.length, 20);
  assert.deepEqual(names, [...names].sort().reverse()); // giảm dần theo thứ tự ký tự

  const desc = await api.get('/api/students?sortBy=studentId&order=desc&limit=1');
  assert.equal(desc.body.data[0].studentId, 'SV2022020');

  const wildcard = await api.get('/api/students?q=%25'); // % tìm theo nghĩa đen, không phải ký tự đại diện
  assert.equal(wildcard.body.pagination.total, 0);
});

test('danh sách: tham số sai trả 400 INVALID_QUERY', async () => {
  for (const qs of ['page=0', 'page=1.5', 'limit=500', 'classId=abc', 'q=a&q=b', 'sortBy=password', 'status=khac']) {
    const { status, body } = await api.get('/api/students?' + qs);
    assert.equal(status, 400, qs);
    assert.equal(body.error.code, 'INVALID_QUERY', qs);
    assert.ok(Array.isArray(body.error.details), qs);
  }
});

test('chi tiết: đúng dữ liệu, chữ thường vẫn được chấp nhận', async () => {
  const { status, body } = await api.get('/api/students/SV2022001');
  assert.equal(status, 200);
  assert.equal(body.data.studentId, 'SV2022001');
  assert.ok(body.data.class.name && body.data.major.name && body.data.faculty.name);

  const lower = await api.get('/api/students/sv2022020');
  assert.equal(lower.status, 200);
  assert.equal(lower.body.data.studentId, 'SV2022020');
});

test('chi tiết: mã sai định dạng → 400, không tồn tại → 404', async () => {
  const bad = await api.get('/api/students/abc');
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error.code, 'INVALID_STUDENT_ID');

  const missing = await api.get('/api/students/SV9999999');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'STUDENT_NOT_FOUND');
});

test('thêm sinh viên: tự sinh mã theo năm nhập học', async () => {
  const first = await api.post('/api/students', validStudent());
  assert.equal(first.status, 201);
  assert.equal(first.body.data.studentId, 'SV2024001');
  assert.equal(first.body.data.status, 'Đang học'); // mặc định
  assert.equal(first.body.data.class.name, 'KHMT22A');

  const second = await api.post('/api/students', validStudent({ email: 'test2@student.edu.vn' }));
  assert.equal(second.body.data.studentId, 'SV2024002');

  const total = await api.get('/api/students');
  assert.equal(total.body.pagination.total, 22);
});

test('thêm sinh viên: chỉ định mã, email viết hoa được chuẩn hóa, phone có thể bỏ trống', async () => {
  const { status, body } = await api.post(
    '/api/students',
    validStudent({ studentId: 'sv2025777', email: 'MoI@Student.edu.vn', phone: undefined, enrolledYear: 2025 })
  );
  assert.equal(status, 201);
  assert.equal(body.data.studentId, 'SV2025777');
  assert.equal(body.data.email, 'moi@student.edu.vn');
  assert.equal(body.data.phone, null);
});

test('thêm sinh viên: dữ liệu sai trả 400 VALIDATION_ERROR kèm chi tiết từng trường', async () => {
  const { status, body } = await api.post('/api/students', {
    fullName: 'A',
    dateOfBirth: '2999-01-01',
    gender: 'Khác',
    email: 'khong-phai-email',
    phone: '123',
    classId: 'abc',
    enrolledYear: 1990,
    status: 'Linh tinh',
  });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  const fields = body.error.details.map((d) => d.field).sort();
  assert.deepEqual(fields, [
    'classId', 'dateOfBirth', 'email', 'enrolledYear', 'fullName', 'gender', 'phone', 'status',
  ]);

  const empty = await api.post('/api/students', {});
  assert.equal(empty.status, 400);
  assert.ok(empty.body.error.details.some((d) => d.field === 'fullName'));
});

test('thêm sinh viên: lớp không tồn tại → 400, email hoặc mã trùng → 409', async () => {
  const noClass = await api.post('/api/students', validStudent({ email: 'x1@student.edu.vn', classId: 999 }));
  assert.equal(noClass.status, 400);
  assert.equal(noClass.body.error.code, 'INVALID_REFERENCE');

  const dupEmail = await api.post('/api/students', validStudent({ email: 'an.nv@student.edu.vn' }));
  assert.equal(dupEmail.status, 409);
  assert.equal(dupEmail.body.error.code, 'EMAIL_ALREADY_EXISTS');

  const dupId = await api.post('/api/students', validStudent({ email: 'x2@student.edu.vn', studentId: 'SV2022001' }));
  assert.equal(dupId.status, 409);
  assert.equal(dupId.body.error.code, 'STUDENT_ALREADY_EXISTS');
});

test('body JSON hỏng → 400 INVALID_JSON', async () => {
  const { status, body } = await api.post('/api/students', '{khong phai json');
  assert.equal(status, 400);
  assert.equal(body.error.code, 'INVALID_JSON');
});

test('sửa sinh viên: PUT (đủ trường) và PATCH (một phần)', async () => {
  const put = await api.put('/api/students/SV2022003', validStudent({ fullName: 'Lê Minh Châu Mới', email: 'chau.lm@student.edu.vn', classId: 2 }));
  assert.equal(put.status, 200);
  assert.equal(put.body.data.fullName, 'Lê Minh Châu Mới');
  assert.equal(put.body.data.studentId, 'SV2022003'); // mã không đổi

  const patch = await api.patch('/api/students/SV2022003', { status: 'Bảo lưu', phone: null });
  assert.equal(patch.status, 200);
  assert.equal(patch.body.data.status, 'Bảo lưu');
  assert.equal(patch.body.data.phone, null);
  assert.equal(patch.body.data.fullName, 'Lê Minh Châu Mới'); // trường khác giữ nguyên

  const empty = await api.patch('/api/students/SV2022003', {});
  assert.equal(empty.status, 400);

  const putMissing = await api.put('/api/students/SV2022003', { fullName: 'Chỉ có tên' });
  assert.equal(putMissing.status, 400); // PUT phải đủ các trường bắt buộc
});

test('sửa sinh viên: lỗi 404, 409 và 400', async () => {
  const notFound = await api.patch('/api/students/SV9999999', { status: 'Thôi học' });
  assert.equal(notFound.status, 404);

  const dupEmail = await api.patch('/api/students/SV2022004', { email: 'an.nv@student.edu.vn' });
  assert.equal(dupEmail.status, 409);

  const sameEmail = await api.patch('/api/students/SV2022004', { email: 'dung.pq@student.edu.vn' });
  assert.equal(sameEmail.status, 200); // giữ nguyên email của chính mình thì không phải trùng

  const badClass = await api.patch('/api/students/SV2022004', { classId: 999 });
  assert.equal(badClass.status, 400);

  const badId = await api.patch('/api/students/abc', { status: 'Thôi học' });
  assert.equal(badId.status, 400);
  assert.equal(badId.body.error.code, 'INVALID_STUDENT_ID');
});

test('xóa sinh viên: xóa luôn điểm, sau đó trả 404', async () => {
  const before = await api.get('/api/students/SV2022012/academic');
  assert.ok(before.body.data.results.length > 0);

  const removed = await api.del('/api/students/SV2022012');
  assert.equal(removed.status, 200);
  assert.deepEqual(removed.body.data, { studentId: 'SV2022012', deleted: true });

  assert.equal((await api.get('/api/students/SV2022012')).status, 404);
  assert.equal((await api.get('/api/students/SV2022012/academic')).status, 404);
  assert.equal((await api.del('/api/students/SV2022012')).status, 404);
});