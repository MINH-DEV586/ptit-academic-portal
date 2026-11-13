const { idRule } = require('./common.validator');

const SEMESTER_REGEX = /^\d{4}-\d{4} HK[1-3]$/;

const gradeFields = {
  courseId: { ...idRule, required: true },
  semester: {
    type: 'string',
    required: true,
    pattern: SEMESTER_REGEX,
    patternMessage: 'phải có dạng 2023-2024 HK1 (HK1, HK2 hoặc HK3)',
  },
  score: { type: 'number', required: true, min: 0, max: 10 },
};

module.exports = { gradeSchema: gradeFields };