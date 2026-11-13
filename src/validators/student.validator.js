const { STUDENT_ID_REGEX } = require('../utils/params');
const { paginationRules, idRule } = require('./common.validator');

const GENDERS = ['Nam', 'Nữ'];
const STATUSES = ['Đang học', 'Bảo lưu', 'Đã tốt nghiệp', 'Thôi học'];
const SORT_FIELDS = ['studentId', 'fullName', 'enrolledYear', 'dateOfBirth'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9}$/;

const updatableFields = {
  fullName: { type: 'string', required: true, min: 2, max: 100 },
  dateOfBirth: { type: 'date', required: true, min: '1950-01-01', max: 'today' },
  gender: { type: 'enum', required: true, values: GENDERS },
  email: {
    type: 'string',
    required: true,
    max: 120,
    lower: true,
    pattern: EMAIL_REGEX,
    patternMessage: 'không đúng định dạng email',
  },
  phone: {
    type: 'string',
    nullable: true,
    pattern: PHONE_REGEX,
    patternMessage: 'phải gồm 10 chữ số và bắt đầu bằng số 0',
  },
  classId: { ...idRule, required: true },
  enrolledYear: { type: 'integer', required: true, min: 2000, max: new Date().getFullYear() + 1 },
  status: { type: 'enum', values: STATUSES, default: 'Đang học' },
};

const createSchema = {
  studentId: {
    type: 'string',
    upper: true,
    pattern: STUDENT_ID_REGEX,
    patternMessage: 'phải có dạng SV + 7 chữ số, ví dụ SV2024001',
  },
  ...updatableFields,
};

const updateSchema = updatableFields;

const listQuerySchema = {
  q: { type: 'string', max: 100 },
  classId: idRule,
  majorId: idRule,
  facultyId: idRule,
  status: { type: 'enum', values: STATUSES },
  gender: { type: 'enum', values: GENDERS },
  enrolledYear: { type: 'integer', min: 2000, max: 2100 },
  sortBy: { type: 'enum', values: SORT_FIELDS, default: 'studentId' },
  order: { type: 'enum', values: ['asc', 'desc'], default: 'asc' },
  ...paginationRules(10),
};

module.exports = { GENDERS, STATUSES, createSchema, updateSchema, listQuerySchema };