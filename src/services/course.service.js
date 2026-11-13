const courseRepo = require('../repositories/course.repository');
const gradeRepo = require('../repositories/grade.repository');
const errors = require('../utils/domainErrors');
const { toCourse } = require('../mappers/catalog.mapper');
const { buildPagination, toOffset } = require('../utils/pagination');

function assertCodeFree(code, exceptId) {
  const found = courseRepo.findByCode(code);
  if (found && found.id !== exceptId) throw errors.duplicate(`Mã môn học ${code} đã tồn tại`);
}

function list({ q, page, limit }) {
  const { rows, total } = courseRepo.findAll({ q }, { limit, offset: toOffset(page, limit) });
  return { data: rows.map(toCourse), pagination: buildPagination(page, limit, total) };
}

function getById(id) {
  const row = courseRepo.findById(id);
  if (!row) throw errors.courseNotFound(id);
  return toCourse(row);
}

function create(body) {
  assertCodeFree(body.code);
  return getById(courseRepo.create(body));
}

function update(id, body) {
  getById(id);
  if (body.code !== undefined) assertCodeFree(body.code, id);
  courseRepo.update(id, body);
  return getById(id);
}

function remove(id) {
  getById(id);
  if (gradeRepo.countByCourse(id) > 0) {
    throw errors.inUse('Không thể xóa môn học đã có điểm của sinh viên');
  }
  courseRepo.remove(id);
  return { id, deleted: true };
}

module.exports = { list, getById, create, update, remove };