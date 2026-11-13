const { getDb } = require('../database');
const { buildSet } = require('../utils/sql');

const SELECT = `
  SELECT g.id, g.student_id, g.semester, g.score,
         co.id AS course_id, co.code, co.name, co.credits
  FROM grades g
  JOIN courses co ON co.id = g.course_id`;

const UPDATE_FIELDS = { courseId: 'course_id', semester: 'semester', score: 'score' };

function findByStudent(studentId) {
  return getDb().prepare(`${SELECT} WHERE g.student_id = ? ORDER BY g.semester, co.code`).all(studentId);
}

function findById(gradeId) {
  return getDb().prepare(`${SELECT} WHERE g.id = ?`).get(gradeId);
}

function findDuplicate(studentId, courseId, semester) {
  return getDb()
    .prepare('SELECT id FROM grades WHERE student_id = ? AND course_id = ? AND semester = ?')
    .get(studentId, courseId, semester);
}

function create({ studentId, courseId, semester, score }) {
  const result = getDb()
    .prepare('INSERT INTO grades (student_id, course_id, semester, score) VALUES (?, ?, ?, ?)')
    .run(studentId, courseId, semester, score);
  return Number(result.lastInsertRowid);
}

function update(gradeId, data) {
  const { setSql, params } = buildSet(UPDATE_FIELDS, data);
  if (!setSql) return;
  getDb().prepare(`UPDATE grades SET ${setSql} WHERE id = ?`).run(...params, gradeId);
}

function remove(gradeId) {
  getDb().prepare('DELETE FROM grades WHERE id = ?').run(gradeId);
}

function removeByStudent(studentId) {
  getDb().prepare('DELETE FROM grades WHERE student_id = ?').run(studentId);
}

function countByCourse(courseId) {
  return getDb().prepare('SELECT COUNT(*) AS n FROM grades WHERE course_id = ?').get(courseId).n;
}

module.exports = {
  findByStudent,
  findById,
  findDuplicate,
  create,
  update,
  remove,
  removeByStudent,
  countByCourse,
};
