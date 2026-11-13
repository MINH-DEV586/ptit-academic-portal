const { paginationRules } = require('./common.validator');

const courseSchema = {
  code: {
    type: 'string',
    required: true,
    upper: true,
    pattern: /^[A-Z]{3}\d{4}$/,
    patternMessage: 'phải gồm 3 chữ cái và 4 chữ số, ví dụ INT1001',
  },
  name: { type: 'string', required: true, min: 2, max: 150 },
  credits: { type: 'integer', required: true, min: 1, max: 10 },
};

const listQuerySchema = {
  q: { type: 'string', max: 100 },
  ...paginationRules(20),
};

module.exports = { courseSchema, listQuerySchema };