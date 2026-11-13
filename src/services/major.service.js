const majorRepo = require('../repositories/major.repository');
const facultyRepo = require('../repositories/faculty.repository');
const errors = require('../utils/domainErrors');
const { toMajor } = require('../mappers/catalog.mapper');
const { buildPagination, toOffset } = require('../utils/pagination');

function assertNameFree(name, exceptId) {
  const found = majorRepo.findByName(name);
  if (found && found.id !== exceptId) throw errors.duplicate(`Ngành "${name}" đã tồn tại`);
}

function assertFacultyExists(facultyId) {
  if (!facultyRepo.findById(facultyId)) throw errors.invalidReference('khoa', facultyId);
}

function list({ page, limit, ...filters }) {
  const { rows, total } = majorRepo.findAll(filters, { limit, offset: toOffset(page, limit) });
  return { data: rows.map(toMajor), pagination: buildPagination(page, limit, total) };
}

function getById(id) {
  const row = majorRepo.findById(id);
  if (!row) throw errors.majorNotFound(id);
  return toMajor(row);
}

function create(body) {
  assertFacultyExists(body.facultyId);
  assertNameFree(body.name);
  return getById(majorRepo.create(body));
}

function update(id, body) {
  getById(id);
  if (body.facultyId !== undefined) assertFacultyExists(body.facultyId);
  if (body.name !== undefined) assertNameFree(body.name, id);
  majorRepo.update(id, body);
  return getById(id);
}

function remove(id) {
  getById(id);
  if (majorRepo.countClasses(id) > 0) {
    throw errors.inUse('Không thể xóa ngành đang có lớp');
  }
  majorRepo.remove(id);
  return { id, deleted: true };
}

module.exports = { list, getById, create, update, remove };