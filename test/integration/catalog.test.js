const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestApp } = require('../helpers/testApp');

let api;
before(async () => { api = await startTestApp(); });
after(() => api.stop());

test('khoa: danh sách và chi tiết có số ngành', async () => {
  const list = await api.get('/api/faculties');
  assert.equal(list.status, 200);
  assert.equal(list.body.pagination.total, 3);
  assert.equal(list.body.data[0].majorCount, 3); // Khoa CNTT có 3 ngành

  const one = await api.get('/api/faculties/1');
  assert.equal(one.body.data.name, 'Khoa Công nghệ thông tin');

  const search = await api.get('/api/faculties?q=' + encodeURIComponent('Kinh'));
  assert.equal(search.body.data.length, 1);

  assert.equal((await api.get('/api/faculties/999')).status, 404);
  assert.equal((await api.get('/api/faculties/abc')).status, 400);
});

test('khoa: thêm, sửa, xóa; trùng tên → 409; còn ngành → 409', async () => {
  const created = await api.post('/api/faculties', { name: 'Khoa Thiết kế' });
  assert.equal(created.status, 201);
  const id = created.body.data.id;

  assert.equal((await api.post('/api/faculties', { name: 'Khoa Thiết kế' })).status, 409);
  assert.equal((await api.post('/api/faculties', { name: 'a' })).status, 400);

  const renamed = await api.put(`/api/faculties/${id}`, { name: 'Khoa Thiết kế đồ họa' });
  assert.equal(renamed.body.data.name, 'Khoa Thiết kế đồ họa');
  assert.equal((await api.put(`/api/faculties/${id}`, { name: 'Khoa Kinh tế' })).status, 409);

  const inUse = await api.del('/api/faculties/1');
  assert.equal(inUse.status, 409);
  assert.equal(inUse.body.error.code, 'RESOURCE_IN_USE');

  assert.equal((await api.del(`/api/faculties/${id}`)).status, 200);
  assert.equal((await api.get(`/api/faculties/${id}`)).status, 404);
});

test('ngành: lọc theo khoa, thêm/sửa/xóa, kiểm tra tham chiếu', async () => {
  const list = await api.get('/api/majors?facultyId=1');
  assert.equal(list.body.pagination.total, 3);
  assert.ok(list.body.data.every((m) => m.faculty.id === 1));

  assert.equal((await api.post('/api/majors', { name: 'An toàn thông tin', facultyId: 999 })).status, 400);

  const created = await api.post('/api/majors', { name: 'An toàn thông tin', facultyId: 1 });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.classCount, 0);
  const id = created.body.data.id;

  assert.equal((await api.post('/api/majors', { name: 'An toàn thông tin', facultyId: 1 })).status, 409);

  const moved = await api.patch(`/api/majors/${id}`, { facultyId: 2 });
  assert.equal(moved.body.data.faculty.id, 2);

  assert.equal((await api.del('/api/majors/1')).status, 409); // ngành còn lớp
  assert.equal((await api.del(`/api/majors/${id}`)).status, 200);
});

test('lớp: lọc, thêm/sửa/xóa, số sinh viên, chặn xóa lớp còn sinh viên', async () => {
  const list = await api.get('/api/classes?majorId=1');
  assert.equal(list.body.pagination.total, 2);
  assert.equal(list.body.data[0].name, 'KHMT22A');
  assert.equal(list.body.data[0].studentCount, 3); // SV2022001, SV2022002, SV2022012

  const created = await api.post('/api/classes', { name: 'khmt23a', majorId: 1 });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.name, 'KHMT23A'); // tự đổi sang chữ hoa
  const id = created.body.data.id;

  assert.equal((await api.post('/api/classes', { name: 'KHMT23A', majorId: 1 })).status, 409);
  assert.equal((await api.post('/api/classes', { name: 'ab', majorId: 1 })).status, 400);
  assert.equal((await api.post('/api/classes', { name: 'KHMT24A', majorId: 999 })).status, 400);

  const renamed = await api.patch(`/api/classes/${id}`, { name: 'KHMT23B' });
  assert.equal(renamed.body.data.name, 'KHMT23B');

  assert.equal((await api.del('/api/classes/1')).status, 409); // còn sinh viên
  assert.equal((await api.del(`/api/classes/${id}`)).status, 200);
});

test('môn học: danh sách, tìm kiếm, thêm/sửa/xóa, chặn xóa môn đã có điểm', async () => {
  const list = await api.get('/api/courses');
  assert.equal(list.body.pagination.total, 9);

  const search = await api.get('/api/courses?q=INT');
  assert.ok(search.body.data.length >= 4);
  assert.ok(search.body.data.every((c) => c.code.includes('INT') || c.name.includes('INT')));

  const created = await api.post('/api/courses', { code: 'int3001', name: 'Trí tuệ nhân tạo', credits: 3 });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.code, 'INT3001');
  const id = created.body.data.id;

  assert.equal((await api.post('/api/courses', { code: 'INT3001', name: 'Trùng mã', credits: 3 })).status, 409);
  assert.equal((await api.post('/api/courses', { code: 'abc', name: 'Sai mã', credits: 3 })).status, 400);
  assert.equal((await api.post('/api/courses', { code: 'INT3002', name: 'Sai tín chỉ', credits: 0 })).status, 400);

  const updated = await api.patch(`/api/courses/${id}`, { credits: 4 });
  assert.equal(updated.body.data.credits, 4);
  assert.equal((await api.put(`/api/courses/${id}`, { code: 'INT1001', name: 'x y', credits: 3 })).status, 409);

  const inUse = await api.del('/api/courses/1');
  assert.equal(inUse.status, 409);
  assert.equal(inUse.body.error.code, 'RESOURCE_IN_USE');

  assert.equal((await api.del(`/api/courses/${id}`)).status, 200);
  assert.equal((await api.get(`/api/courses/${id}`)).status, 404);
});