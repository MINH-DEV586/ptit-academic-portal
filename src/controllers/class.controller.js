const classService = require('../services/class.service');
const { sendSuccess } = require('../utils/response');
const { parseId } = require('../utils/params');

const idOf = (req) => parseId(req.params.classId, 'classId');

function list(req, res) {
  const { data, pagination } = classService.list(req.validQuery);
  sendSuccess(res, data, { pagination });
}

const getById = (req, res) => sendSuccess(res, classService.getById(idOf(req)));
const create = (req, res) => sendSuccess(res, classService.create(req.body), { status: 201 });
const update = (req, res) => sendSuccess(res, classService.update(idOf(req), req.body));
const remove = (req, res) => sendSuccess(res, classService.remove(idOf(req)));

module.exports = { list, getById, create, update, remove };
