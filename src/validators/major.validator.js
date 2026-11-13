const { paginationRules, idRule } = require('./common.validator');

const majorSchema = {
  name: { type: 'string', required: true, min: 2, max: 100 },
  facultyId: { ...idRule, required: true },
};

const listQuerySchema = {
  q: { type: 'string', max: 100 },
  facultyId: idRule,
  ...paginationRules(20),
};

module.exports = { majorSchema, listQuerySchema };