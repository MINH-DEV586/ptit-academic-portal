const { paginationRules, idRule } = require('./common.validator');

const classSchema = {
  name: {
    type: 'string',
    required: true,
    upper: true,
    pattern: /^[A-Z0-9]{3,20}$/,
    patternMessage: 'chỉ gồm chữ cái và số, dài 3-20 ký tự, ví dụ KHMT22A',
  },
  majorId: { ...idRule, required: true },
};

const listQuerySchema = {
  q: { type: 'string', max: 100 },
  majorId: idRule,
  facultyId: idRule,
  ...paginationRules(20),
};

module.exports = { classSchema, listQuerySchema };