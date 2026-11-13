const studentRepo = require('../repositories/student.repository');
const gradeRepo = require('../repositories/grade.repository');
const courseRepo = require('../repositories/course.repository');
const ApiError = require('../utils/ApiError');
const errors = require('../utils/domainErrors');
const { toGrade } = require('../mappers/grade.mapper');

function ensureStudent(studentId) {
  if (!studentRepo.findById(studentId)) throw errors.studentNotFound(studentId);
}

function ensureCourse(courseId) {
  if (!courseRepo.findById(courseId)) throw errors.invalidReference('môn học', courseId);
}

function findOwned(studentId, gradeId) {
  ensureStudent(studentId);
  const row = gradeRepo.findById(gradeId);
  if (!row || row.student_id !== studentId) throw errors.gradeNotFound(gradeId);
  return row;
}

const alreadyExists = (studentId, semester) =>
  ApiError.conflict(
    'GRADE_ALREADY_EXISTS',
    `Sinh viên ${studentId} đã có điểm môn này trong học kỳ ${semester}`
  );

function listByStudent(studentId) {
  ensureStudent(studentId);
  return gradeRepo.findByStudent(studentId).map(toGrade);
}

function add(studentId, body) {
  ensureStudent(studentId);
  ensureCourse(body.courseId);
  if (gradeRepo.findDuplicate(studentId, body.courseId, body.semester)) {
    throw alreadyExists(studentId, body.semester);
  }
  const gradeId = gradeRepo.create({ studentId, ...body });
  return toGrade(gradeRepo.findById(gradeId));
}

function update(studentId, gradeId, body) {
  const current = findOwned(studentId, gradeId);
  if (body.courseId !== undefined) ensureCourse(body.courseId);

  const courseId = body.courseId ?? current.course_id;
  const semester = body.semester ?? current.semester;
  const duplicate = gradeRepo.findDuplicate(studentId, courseId, semester);
  if (duplicate && duplicate.id !== gradeId) throw alreadyExists(studentId, semester);

  gradeRepo.update(gradeId, body);
  return toGrade(gradeRepo.findById(gradeId));
}

function remove(studentId, gradeId) {
  findOwned(studentId, gradeId);
  gradeRepo.remove(gradeId);
  return { gradeId, deleted: true };
}

module.exports = { listByStudent, add, update, remove };