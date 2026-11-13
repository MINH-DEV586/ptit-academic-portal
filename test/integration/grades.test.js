const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestApp } = require('../helpers/testApp');

let api;
before(async () => { api = await startTestApp(); });
after(() => api.stop());

test('hồ sơ học tập: GPA tính đúng theo tín chỉ, có gradeId để sửa/xóa', async () => {
  const { status, body } = await api.get('/api/students/SV2022001/academic');
  assert.equal(status, 200);

  const { summary, results } = body.data;
  assert.equal(summary.totalCourses, 7);
  assert.equal(summary.totalCredits, 21);
  assert.equal(summary.gpa10, 8.38);
  assert.equal(summary.gpa4, 3.62);
  assert.equal(summary.classification, 'Xuất sắc');
  assert.ok(results.every((r) => Number.isInteger(r.gradeId) && Number.isInteger(r.courseId)));

  const expected = results.reduce((s, r) => s + r.score10 * r.credits, 0) / summary.totalCredits;
  assert.ok(Math.abs(summary.gpa10 - expected) < 0.01);
});

test('hồ sơ học tập: sinh viên rớt môn và sinh viên chưa có điểm', async () => {
  const failing = await api.get('/api/students/SV2022015/academic');
  assert.ok(failing.body.data.results.some((r) => r.passed === false));
  assert.ok(failing.body.data.summary.passedCredits < failing.body.data.summary.totalCredits);

  const none = await api.get('/api/students/SV2022008/academic');
  assert.equal(none.status, 200);
  assert.deepEqual(none.body.data.results, []);
  assert.equal(none.body.data.summary.classification, null);

  assert.equal((await api.get('/api/students/SV9999999/academic')).status, 404);
});

test('vòng đời một điểm: thêm → xem → sửa → xóa, và GPA thay đổi theo', async () => {
  const created = await api.post('/api/students/SV2022008/grades', { courseId: 1, semester: '2023-2024 HK1', score: 9 });
  assert.equal(created.status, 201);
  const { gradeId } = created.body.data;
  assert.equal(created.body.data.letterGrade, 'A');
  assert.equal(created.body.data.courseCode, 'INT1001');

  const list = await api.get('/api/students/SV2022008/grades');
  assert.equal(list.body.data.length, 1);

  let record = await api.get('/api/students/SV2022008/academic');
  assert.equal(record.body.data.summary.gpa10, 9);
  assert.equal(record.body.data.summary.classification, 'Xuất sắc');

  const patched = await api.patch(`/api/students/SV2022008/grades/${gradeId}`, { score: 4.5 });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.data.score10, 4.5);
  assert.equal(patched.body.data.letterGrade, 'D');
  assert.equal(patched.body.data.courseId, 1); // trường khác giữ nguyên

  const put = await api.put(`/api/students/SV2022008/grades/${gradeId}`, { courseId: 2, semester: '2023-2024 HK2', score: 7 });
  assert.equal(put.status, 200);
  assert.equal(put.body.data.courseCode, 'INT1002');
  assert.equal(put.body.data.semester, '2023-2024 HK2');

  const removed = await api.del(`/api/students/SV2022008/grades/${gradeId}`);
  assert.deepEqual(removed.body.data, { gradeId, deleted: true });

  record = await api.get('/api/students/SV2022008/academic');
  assert.equal(record.body.data.summary.totalCredits, 0);
});

test('thêm điểm: dữ liệu sai → 400, tham chiếu sai → 400/404, trùng → 409', async () => {
  const invalid = await api.post('/api/students/SV2022002/grades', { courseId: 'a', semester: '2023', score: 11 });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
  assert.deepEqual(invalid.body.error.details.map((d) => d.field).sort(), ['courseId', 'score', 'semester']);

  const noCourse = await api.post('/api/students/SV2022002/grades', { courseId: 999, semester: '2023-2024 HK1', score: 8 });
  assert.equal(noCourse.status, 400);
  assert.equal(noCourse.body.error.code, 'INVALID_REFERENCE');

  const noStudent = await api.post('/api/students/SV9999999/grades', { courseId: 1, semester: '2023-2024 HK1', score: 8 });
  assert.equal(noStudent.status, 404);
  assert.equal(noStudent.body.error.code, 'STUDENT_NOT_FOUND');

  // SV2022002 đã có điểm môn 1 ở học kỳ 2022-2023 HK1
  const duplicate = await api.post('/api/students/SV2022002/grades', { courseId: 1, semester: '2022-2023 HK1', score: 5 });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, 'GRADE_ALREADY_EXISTS');
});

test('sửa điểm: không được sửa điểm của sinh viên khác, không được tạo trùng', async () => {
  const mine = await api.get('/api/students/SV2022003/grades');
  const gradeId = mine.body.data[0].gradeId;

  const wrongOwner = await api.patch(`/api/students/SV2022004/grades/${gradeId}`, { score: 10 });
  assert.equal(wrongOwner.status, 404);
  assert.equal(wrongOwner.body.error.code, 'GRADE_NOT_FOUND');

  // Tạo thêm một điểm cùng môn ở học kỳ khác, rồi đổi học kỳ của nó cho trùng điểm đầu → 409
  const second = await api.post('/api/students/SV2022003/grades', { courseId: mine.body.data[0].courseId, semester: '2024-2025 HK1', score: 6 });
  const clash = await api.patch(`/api/students/SV2022003/grades/${second.body.data.gradeId}`, { semester: mine.body.data[0].semester });
  assert.equal(clash.status, 409);

  assert.equal((await api.patch(`/api/students/SV2022003/grades/${gradeId}`, {})).status, 400);
  assert.equal((await api.patch('/api/students/SV2022003/grades/abc', { score: 5 })).status, 400);
  assert.equal((await api.del('/api/students/SV2022003/grades/99999')).status, 404);
});