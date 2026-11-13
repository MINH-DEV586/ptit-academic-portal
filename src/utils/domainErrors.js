const ApiError = require('./ApiError');

module.exports = {
  studentNotFound: (id) => ApiError.notFound('STUDENT_NOT_FOUND', `Không tìm thấy sinh viên có mã ${id}`),
  gradeNotFound: (id) => ApiError.notFound('GRADE_NOT_FOUND', `Không tìm thấy điểm có id ${id}`),
  courseNotFound: (id) => ApiError.notFound('COURSE_NOT_FOUND', `Không tìm thấy môn học có id ${id}`),
  facultyNotFound: (id) => ApiError.notFound('FACULTY_NOT_FOUND', `Không tìm thấy khoa có id ${id}`),
  majorNotFound: (id) => ApiError.notFound('MAJOR_NOT_FOUND', `Không tìm thấy ngành có id ${id}`),
  classNotFound: (id) => ApiError.notFound('CLASS_NOT_FOUND', `Không tìm thấy lớp có id ${id}`),

  invalidReference: (what, id) => ApiError.badRequest('INVALID_REFERENCE', `Không tồn tại ${what} có id ${id}`),
  duplicate: (message) => ApiError.conflict('DUPLICATE_RESOURCE', message),
  inUse: (message) => ApiError.conflict('RESOURCE_IN_USE', message),
};
