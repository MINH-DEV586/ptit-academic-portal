function sendSuccess(res, data, { status = 200, ...extra } = {}) {
  return res.status(status).json({ success: true, data, ...extra });
}

function sendError(res, status, code, message, details) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ success: false, error });
}

module.exports = { sendSuccess, sendError };