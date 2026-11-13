const { getDb } = require('../database');
const { LIKE_ESCAPE, likePattern, buildSet } = require('../utils/sql');

const FROM = `
  FROM majors m
  JOIN faculties f ON f.id = m.faculty_id`;

const SELECT = `
  SELECT m.id, m.name, f.id AS faculty_id, f.name AS faculty_name,
         (SELECT COUNT(*) FROM classes c WHERE c.major_id = m.id) AS class_count
  ${FROM}`;

const UPDATE_FIELDS = { name: 'name', facultyId: 'faculty_id' };

function findAll({ q, facultyId }, { limit, offset }) {
  const db = getDb();
  const where = [];
  const params = [];
  if (q) { where.push(`m.name LIKE ? ${LIKE_ESCAPE}`); params.push(likePattern(q)); }
  if (facultyId) { where.push('m.faculty_id = ?'); params.push(facultyId); }
  const sql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { n: total } = db.prepare(`SELECT COUNT(*) AS n ${FROM} ${sql}`).get(...params);
  const rows = db.prepare(`${SELECT} ${sql} ORDER BY m.id LIMIT ? OFFSET ?`).all(...params, limit, offset);
  return { rows, total };
}

function findById(id) {
  return getDb().prepare(`${SELECT} WHERE m.id = ?`).get(id);
}

function findByName(name) {
  return getDb().prepare('SELECT id FROM majors WHERE name = ?').get(name);
}

function create({ name, facultyId }) {
  const result = getDb().prepare('INSERT INTO majors (name, faculty_id) VALUES (?, ?)').run(name, facultyId);
  return Number(result.lastInsertRowid);
}

function update(id, data) {
  const { setSql, params } = buildSet(UPDATE_FIELDS, data);
  if (!setSql) return;
  getDb().prepare(`UPDATE majors SET ${setSql} WHERE id = ?`).run(...params, id);
}

function remove(id) {
  getDb().prepare('DELETE FROM majors WHERE id = ?').run(id);
}

function countClasses(id) {
  return getDb().prepare('SELECT COUNT(*) AS n FROM classes WHERE major_id = ?').get(id).n;
}

module.exports = { findAll, findById, findByName, create, update, remove, countClasses };
