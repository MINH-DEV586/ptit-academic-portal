const { getDb } = require('../database');
const { LIKE_ESCAPE, likePattern, buildSet } = require('../utils/sql');

const FROM = `
  FROM classes c
  JOIN majors m    ON m.id = c.major_id
  JOIN faculties f ON f.id = m.faculty_id`;

const SELECT = `
  SELECT c.id, c.name,
         m.id AS major_id, m.name AS major_name,
         f.id AS faculty_id, f.name AS faculty_name,
         (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS student_count
  ${FROM}`;

const UPDATE_FIELDS = { name: 'name', majorId: 'major_id' };

function findAll({ q, majorId, facultyId }, { limit, offset }) {
  const db = getDb();
  const where = [];
  const params = [];
  if (q) { where.push(`c.name LIKE ? ${LIKE_ESCAPE}`); params.push(likePattern(q)); }
  if (majorId) { where.push('m.id = ?'); params.push(majorId); }
  if (facultyId) { where.push('f.id = ?'); params.push(facultyId); }
  const sql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { n: total } = db.prepare(`SELECT COUNT(*) AS n ${FROM} ${sql}`).get(...params);
  const rows = db.prepare(`${SELECT} ${sql} ORDER BY c.id LIMIT ? OFFSET ?`).all(...params, limit, offset);
  return { rows, total };
}

function findById(id) {
  return getDb().prepare(`${SELECT} WHERE c.id = ?`).get(id);
}

function findByName(name) {
  return getDb().prepare('SELECT id FROM classes WHERE name = ?').get(name);
}

function create({ name, majorId }) {
  const result = getDb().prepare('INSERT INTO classes (name, major_id) VALUES (?, ?)').run(name, majorId);
  return Number(result.lastInsertRowid);
}

function update(id, data) {
  const { setSql, params } = buildSet(UPDATE_FIELDS, data);
  if (!setSql) return;
  getDb().prepare(`UPDATE classes SET ${setSql} WHERE id = ?`).run(...params, id);
}

function remove(id) {
  getDb().prepare('DELETE FROM classes WHERE id = ?').run(id);
}

function countStudents(id) {
  return getDb().prepare('SELECT COUNT(*) AS n FROM students WHERE class_id = ?').get(id).n;
}

module.exports = { findAll, findById, findByName, create, update, remove, countStudents };
