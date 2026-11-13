const studentService = require('../services/student.service');
const academicService = require('../services/academic.service');
const { sendSuccess } = require('../utils/response');
const { parseStudentId } = require('../utils/params');

function list(req, res) {
  const { data, pagination } = studentService.list(req.validQuery);
  sendSuccess(res, data, { pagination });
}

function getById(req, res) {
  sendSuccess(res, studentService.getById(parseStudentId(req.params.studentId)));
}

function create(req, res) {
  sendSuccess(res, studentService.create(req.body), { status: 201 });
}

function update(req, res) {
  sendSuccess(res, studentService.update(parseStudentId(req.params.studentId), req.body));
}

function remove(req, res) {
  sendSuccess(res, studentService.remove(parseStudentId(req.params.studentId)));
}

function academic(req, res) {
  sendSuccess(res, academicService.getAcademicRecord(parseStudentId(req.params.studentId)));
}

module.exports = { list, getById, create, update, remove, academic };
