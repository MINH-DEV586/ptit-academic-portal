const courseService = require('../services/course.service');
const { sendSuccess } = require('../utils/response');
const { parseId } = require('../utils/params');

const idOf = (req) => parseId(req.params.courseId, 'courseId');

function list(req, res) {
  const { data, pagination } = courseService.list(req.validQuery);
  sendSuccess(res, data, { pagination });
}

const getById = (req, res) => sendSuccess(res, courseService.getById(idOf(req)));
const create = (req, res) => sendSuccess(res, courseService.create(req.body), { status: 201 });
const update = (req, res) => sendSuccess(res, courseService.update(idOf(req), req.body));
const remove = (req, res) => sendSuccess(res, courseService.remove(idOf(req)));

module.exports = { list, getById, create, update, remove };
