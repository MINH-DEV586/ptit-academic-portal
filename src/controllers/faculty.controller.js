const facultyService = require('../services/faculty.service');
const { sendSuccess } = require('../utils/response');
const { parseId } = require('../utils/params');

const idOf = (req) => parseId(req.params.facultyId, 'facultyId');

function list(req, res) {
  const { data, pagination } = facultyService.list(req.validQuery);
  sendSuccess(res, data, { pagination });
}

const getById = (req, res) => sendSuccess(res, facultyService.getById(idOf(req)));
const create = (req, res) => sendSuccess(res, facultyService.create(req.body), { status: 201 });
const update = (req, res) => sendSuccess(res, facultyService.update(idOf(req), req.body));
const remove = (req, res) => sendSuccess(res, facultyService.remove(idOf(req)));

module.exports = { list, getById, create, update, remove };
