const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/response');
const config = require('../config');

function notFound(req, res) {
  return sendError(res, 404, 'ROUTE_NOT_FOUND', `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`);
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return sendError(res, err.status, err.code, err.message, err.details);
  }
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'INVALID_JSON', 'Body JSON không hợp lệ');
  }
  if (err.type === 'entity.too.large') {
    return sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'Dữ liệu gửi lên quá lớn');
  }

  const message = String(err.message || '');
  if (message.includes('UNIQUE constraint failed')) {
    return sendError(res, 409, 'DUPLICATE_RESOURCE', 'Dữ liệu bị trùng với một bản ghi đã có');
  }
  if (message.includes('FOREIGN KEY constraint failed')) {
    return sendError(res, 409, 'RESOURCE_IN_USE', 'Dữ liệu đang được tham chiếu hoặc tham chiếu không tồn tại');
  }

  if (!config.isTest) console.error(err);
  return sendError(res, 500, 'INTERNAL_ERROR', 'Lỗi hệ thống, vui lòng thử lại sau');
}

module.exports = { notFound, errorHandler };
