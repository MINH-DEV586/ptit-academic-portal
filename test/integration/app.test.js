const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestApp } = require('../helpers/testApp');

let api;
before(async () => { api = await startTestApp(); });
after(() => api.stop());

test('health check', async () => {
  const { status, body } = await api.get('/api/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('trang gốc và /api liệt kê các endpoint thay vì báo lỗi', async () => {
  for (const path of ['/', '/api']) {
    const { status, body } = await api.get(path);
    assert.equal(status, 200, path);
    assert.equal(body.data.name, 'academic-api');
    assert.ok(body.data.endpoints.students);
  }
});

test('đường dẫn không tồn tại → 404 JSON', async () => {
  const { status, body } = await api.get('/api/khong-co');
  assert.equal(status, 404);
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
});

test('phương thức không hỗ trợ → 404 JSON', async () => {
  const { status, body } = await api.del('/api/students');
  assert.equal(status, 404);
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
});

test('mọi response lỗi có cùng định dạng', async () => {
  for (const path of ['/api/students/abc', '/api/students/SV9999999', '/api/students?page=0', '/api/nothing']) {
    const { body } = await api.get(path);
    assert.equal(body.success, false, path);
    assert.equal(typeof body.error.code, 'string', path);
    assert.equal(typeof body.error.message, 'string', path);
  }
});