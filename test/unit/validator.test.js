const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validate, isValidDate } = require('../../src/utils/validator');
const { likePattern, buildSet } = require('../../src/utils/sql');

test('ngày hợp lệ và không hợp lệ', () => {
  assert.equal(isValidDate('2004-02-29'), true); // năm nhuận
  assert.equal(isValidDate('2003-02-29'), false);
  assert.equal(isValidDate('2004-13-01'), false);
  assert.equal(isValidDate('04-01-2004'), false);
});

test('string: cắt khoảng trắng, đổi hoa/thường, kiểm tra độ dài và định dạng', () => {
  const schema = {
    name: { type: 'string', required: true, min: 2, max: 5, upper: true },
    email: { type: 'string', lower: true, pattern: /^\S+@\S+$/, patternMessage: 'sai email' },
  };
  assert.deepEqual(validate({ name: '  ab ', email: 'A@B.C' }, schema).value, { name: 'AB', email: 'a@b.c' });
  assert.equal(validate({ name: 'a' }, schema).errors.length, 1);
  assert.equal(validate({ name: 'abcdefg' }, schema).errors.length, 1);
  assert.equal(validate({ name: 'ab', email: 'khong-hop-le' }, schema).errors[0].message, 'email sai email');
});

test('bắt buộc, mặc định, nullable và bỏ qua trường lạ', () => {
  const schema = {
    a: { type: 'integer', required: true },
    b: { type: 'enum', values: ['x', 'y'], default: 'x' },
    c: { type: 'string', nullable: true },
  };
  const ok = validate({ a: 1, c: '', extra: 'bỏ' }, schema);
  assert.deepEqual(ok.value, { a: 1, b: 'x', c: null });

  const missing = validate({}, schema);
  assert.deepEqual(missing.errors, [{ field: 'a', message: 'a là bắt buộc' }]);
});

test('partial: không bắt buộc và không áp giá trị mặc định', () => {
  const schema = {
    a: { type: 'integer', required: true },
    b: { type: 'enum', values: ['x', 'y'], default: 'x' },
  };
  const { value, errors } = validate({ a: 5 }, schema, { partial: true });
  assert.deepEqual(errors, []);
  assert.deepEqual(value, { a: 5 });
});

test('số: kiểm tra kiểu, khoảng giá trị và ép kiểu cho query string', () => {
  const schema = { n: { type: 'integer', min: 1, max: 10 } };
  assert.equal(validate({ n: 5 }, schema).errors.length, 0);
  assert.equal(validate({ n: '5' }, schema).errors.length, 1); // body JSON: không tự ép kiểu
  assert.deepEqual(validate({ n: '5' }, schema, { coerce: true }).value, { n: 5 });
  assert.equal(validate({ n: '5.5' }, schema, { coerce: true }).errors.length, 1);
  assert.equal(validate({ n: 'abc' }, schema, { coerce: true }).errors.length, 1);
  assert.equal(validate({ n: 0 }, schema).errors.length, 1);
  assert.equal(validate({ n: 11 }, schema).errors.length, 1);
  assert.equal(validate({ n: ['1', '2'] }, schema, { coerce: true }).errors.length, 1);
});

test('ngày: không được ở tương lai khi max = today', () => {
  const schema = { d: { type: 'date', min: '1950-01-01', max: 'today' } };
  assert.equal(validate({ d: '2004-03-12' }, schema).errors.length, 0);
  assert.equal(validate({ d: '2999-01-01' }, schema).errors.length, 1);
  assert.equal(validate({ d: '1900-01-01' }, schema).errors.length, 1);
});

test('tiện ích SQL: escape ký tự đại diện và dựng mệnh đề SET', () => {
  assert.equal(likePattern('50%_a'), '%50\\%\\_a%');
  const { setSql, params } = buildSet({ fullName: 'full_name', phone: 'phone' }, { fullName: 'An', phone: null });
  assert.equal(setSql, 'full_name = ?, phone = ?');
  assert.deepEqual(params, ['An', null]);
  assert.equal(buildSet({ a: 'a' }, {}).setSql, '');
});