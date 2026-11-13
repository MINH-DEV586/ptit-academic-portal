const { paginationRules } = require('./common.validator');

const facultySchema = {
  name: { type: 'string', required: true, min: 2, max: 100 },
};

const listQuerySchema = {
  q: { type: 'string', max: 100 },
  ...paginationRules(20),
};

module.exports = { facultySchema, listQuerySchema };