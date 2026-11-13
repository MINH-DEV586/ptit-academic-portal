const studentRepo = require('../repositories/student.repository');
const classRepo = require('../repositories/class.repository');
const gradeRepo = require('../repositories/grade.repository');
const { transaction } = require('../database');
const ApiError = require('../utils/ApiError');
const errors = require('../utils/domainErrors');
const { toStudent } = require('../mappers/student.mapper');
const { buildPagination, toOffset } = require('../utils/pagination');

function assertClassExists(classId) {
  if (!classRepo.findById(classId)) throw errors.invalidReference('lớp', classId);
}

function assertEmailFree(email, exceptStudentId) {
  const found = studentRepo.findByEmail(email);
  if (found && found.student_id !== exceptStudentId) {
    throw ApiError.conflict('EMAIL_ALREADY_EXISTS', `Email ${email} đã được sử dụng`);
  }
}

function list(query) {
  const { sortBy, order, page, limit, ...filters } = query;
  const { rows, total } = studentRepo.findAll(filters, {
    sortBy,
    order,
    limit,
    offset: toOffset(page, limit),
  });
  return { data: rows.map(toStudent), pagination: buildPagination(page, limit, total) };
}

function getById(studentId) {
  const row = studentRepo.findById(studentId);
  if (!row) throw errors.studentNotFound(studentId);
  return toStudent(row);
}

function create(body) {
  assertClassExists(body.classId);
  assertEmailFree(body.email);

  let studentId = body.studentId;
  if (studentId) {
    if (studentRepo.findById(studentId)) {
      throw ApiError.conflict('STUDENT_ALREADY_EXISTS', `Mã sinh viên ${studentId} đã tồn tại`);
    }
  } else {
    studentId = studentRepo.generateId(body.enrolledYear);
    if (!studentId) {
      throw ApiError.conflict('STUDENT_ID_EXHAUSTED', `Đã hết mã sinh viên cho năm ${body.enrolledYear}`);
    }
  }

  studentRepo.create({ ...body, studentId });
  return getById(studentId);
}

function update(studentId, body) {
  getById(studentId); // 404 nếu không tồn tại
  if (body.classId !== undefined) assertClassExists(body.classId);
  if (body.email !== undefined) assertEmailFree(body.email, studentId);

  studentRepo.update(studentId, body);
  return getById(studentId);
}

function remove(studentId) {
  getById(studentId);
  transaction(() => {
    gradeRepo.removeByStudent(studentId);
    studentRepo.remove(studentId);
  });
  return { studentId, deleted: true };
}

module.exports = { list, getById, create, update, remove };