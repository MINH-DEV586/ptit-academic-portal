const classRepo = require('../repositories/class.repository');
const majorRepo = require('../repositories/major.repository');
const errors = require('../utils/domainErrors');
const { toClass } = require('../mappers/catalog.mapper');
const { buildPagination, toOffset } = require('../utils/pagination');

function assertNameFree(name, exceptId) {
  const found = classRepo.findByName(name);
  if (found && found.id !== exceptId) throw errors.duplicate(`Lớp "${name}" đã tồn tại`);
}

function assertMajorExists(majorId) {
  if (!majorRepo.findById(majorId)) throw errors.invalidReference('ngành', majorId);
}

function list({ page, limit, ...filters }) {
  const { rows, total } = classRepo.findAll(filters, { limit, offset: toOffset(page, limit) });
  return { data: rows.map(toClass), pagination: buildPagination(page, limit, total) };
}

function getById(id) {
  const row = classRepo.findById(id);
  if (!row) throw errors.classNotFound(id);
  return toClass(row);
}

function create(body) {
  assertMajorExists(body.majorId);
  assertNameFree(body.name);
  return getById(classRepo.create(body));
}

function update(id, body) {
  getById(id);
  if (body.majorId !== undefined) assertMajorExists(body.majorId);
  if (body.name !== undefined) assertNameFree(body.name, id);
  classRepo.update(id, body);
  return getById(id);
}

function remove(id) {
  getById(id);
  if (classRepo.countStudents(id) > 0) {
    throw errors.inUse('Không thể xóa lớp đang có sinh viên');
  }
  classRepo.remove(id);
  return { id, deleted: true };
}

module.exports = { list, getById, create, update, remove };