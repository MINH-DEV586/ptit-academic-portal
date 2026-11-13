const majorService = require('../services/major.service');
const { sendSuccess } = require('../utils/response');
const { parseId } = require('../utils/params');

const idOf = (req) => parseId(req.params.majorId, 'majorId');

function list(req, res) {
  const { data, pagination } = majorService.list(req.validQuery);
  sendSuccess(res, data, { pagination });
}

const getById = (req, res) => sendSuccess(res, majorService.getById(idOf(req)));
const create = (req, res) => sendSuccess(res, majorService.create(req.body), { status: 201 });
const update = (req, res) => sendSuccess(res, majorService.update(idOf(req), req.body));
const remove = (req, res) => sendSuccess(res, majorService.remove(idOf(req)));

module.exports = { list, getById, create, update, remove };
