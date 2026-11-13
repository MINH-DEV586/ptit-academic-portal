const ApiError = require('./ApiError');

const STUDENT_ID_REGEX = /^SV\d{7}$/;

function parseStudentId(value) {
  const id = String(value).toUpperCase();
  if (!STUDENT_ID_REGEX.test(id)) {
    throw ApiError.badRequest(
      'INVALID_STUDENT_ID',
      'Mã sinh viên không hợp lệ (định dạng đúng: SV + 7 chữ số, ví dụ SV2022001)'
    );
  }
  return id;
}

function parseId(value, name = 'id') {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1) {
    throw ApiError.badRequest('INVALID_ID', `${name} phải là số nguyên dương`);
  }
  return Number(value);
}

module.exports = { STUDENT_ID_REGEX, parseStudentId, parseId };
