const facultyRepo = require('../repositories/faculty.repository');
const errors = require('../utils/domainErrors');
const { toFaculty } = require('../mappers/catalog.mapper');
const { buildPagination, toOffset } = require('../utils/pagination');

function assertNameFree(name, exceptId) {
  const found = facultyRepo.findByName(name);
  if (found && found.id !== exceptId) throw errors.duplicate(`Khoa "${name}" đã tồn tại`);
}

function list({ q, page, limit }) {
  const { rows, total } = facultyRepo.findAll({ q }, { limit, offset: toOffset(page, limit) });
  return { data: rows.map(toFaculty), pagination: buildPagination(page, limit, total) };
}

function getById(id) {
  const row = facultyRepo.findById(id);
  if (!row) throw errors.facultyNotFound(id);
  return toFaculty(row);
}

function create(body) {
  assertNameFree(body.name);
  return getById(facultyRepo.create(body));
}

function update(id, body) {
  getById(id);
  if (body.name !== undefined) assertNameFree(body.name, id);
  facultyRepo.update(id, body);
  return getById(id);
}

function remove(id) {
  getById(id);
  if (facultyRepo.countMajors(id) > 0) {
    throw errors.inUse('Không thể xóa khoa đang có ngành học');
  }
  facultyRepo.remove(id);
  return { id, deleted: true };
}

module.exports = { list, getById, create, update, remove };