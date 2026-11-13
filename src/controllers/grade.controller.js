const gradeService = require('../services/grade.service');
const { sendSuccess } = require('../utils/response');
const { parseStudentId, parseId } = require('../utils/params');

function list(req, res) {
  sendSuccess(res, gradeService.listByStudent(parseStudentId(req.params.studentId)));
}

function create(req, res) {
  sendSuccess(res, gradeService.add(parseStudentId(req.params.studentId), req.body), { status: 201 });
}

function update(req, res) {
  const studentId = parseStudentId(req.params.studentId);
  const gradeId = parseId(req.params.gradeId, 'gradeId');
  sendSuccess(res, gradeService.update(studentId, gradeId, req.body));
}

function remove(req, res) {
  const studentId = parseStudentId(req.params.studentId);
  const gradeId = parseId(req.params.gradeId, 'gradeId');
  sendSuccess(res, gradeService.remove(studentId, gradeId));
}

module.exports = { list, create, update, remove };
