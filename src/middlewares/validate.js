const ApiError = require('../utils/ApiError');
const { validate } = require('../utils/validator');
const { parseStudentId, parseId } = require('../utils/params');

function validateBody(schema, options = {}) {
  return (req, res, next) => {
    const { value, errors } = validate(req.body, schema, options);
    if (!errors.length && options.partial && Object.keys(value).length === 0) {
      errors.push({ field: null, message: 'Cần gửi ít nhất một trường để cập nhật' });
    }
    if (errors.length) {
      throw ApiError.badRequest('VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ', errors);
    }
    req.body = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { value, errors } = validate(req.query, schema, { coerce: true });
    if (errors.length) {
      throw ApiError.badRequest('INVALID_QUERY', 'Tham số truy vấn không hợp lệ', errors);
    }
    req.validQuery = value;
    next();
  };
}

const requireStudentId = (req, res, next) => {
  parseStudentId(req.params.studentId);
  next();
};

const requireId = (name) => (req, res, next) => {
  parseId(req.params[name], name);
  next();
};

module.exports = { validateBody, validateQuery, requireStudentId, requireId };
