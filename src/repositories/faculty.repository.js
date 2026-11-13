const { getDb } = require('../database');
const { LIKE_ESCAPE, likePattern, buildSet } = require('../utils/sql');

const SELECT = `
  SELECT f.id, f.name,
         (SELECT COUNT(*) FROM majors m WHERE m.faculty_id = f.id) AS major_count
  FROM faculties f`;

function findAll({ q }, { limit, offset }) {
  const db = getDb();
  const where = q ? `WHERE f.name LIKE ? ${LIKE_ESCAPE}` : '';
  const params = q ? [likePattern(q)] : [];

  const { n: total } = db.prepare(`SELECT COUNT(*) AS n FROM faculties f ${where}`).get(...params);
  const rows = db.prepare(`${SELECT} ${where} ORDER BY f.id LIMIT ? OFFSET ?`).all(...params, limit, offset);
  return { rows, total };
}

function findById(id) {
  return getDb().prepare(`${SELECT} WHERE f.id = ?`).get(id);
}

function findByName(name) {
  return getDb().prepare('SELECT id FROM faculties WHERE name = ?').get(name);
}

function create({ name }) {
  const result = getDb().prepare('INSERT INTO faculties (name) VALUES (?)').run(name);
  return Number(result.lastInsertRowid);
}

function update(id, data) {
  const { setSql, params } = buildSet({ name: 'name' }, data);
  if (!setSql) return;
  getDb().prepare(`UPDATE faculties SET ${setSql} WHERE id = ?`).run(...params, id);
}

function remove(id) {
  getDb().prepare('DELETE FROM faculties WHERE id = ?').run(id);
}

function countMajors(id) {
  return getDb().prepare('SELECT COUNT(*) AS n FROM majors WHERE faculty_id = ?').get(id).n;
}

module.exports = { findAll, findById, findByName, create, update, remove, countMajors };
