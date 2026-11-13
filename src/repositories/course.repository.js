const { getDb } = require('../database');
const { LIKE_ESCAPE, likePattern, buildSet } = require('../utils/sql');

const SELECT = 'SELECT id, code, name, credits FROM courses';
const UPDATE_FIELDS = { code: 'code', name: 'name', credits: 'credits' };

function findAll({ q }, { limit, offset }) {
  const db = getDb();
  const where = q ? `WHERE (code LIKE ? ${LIKE_ESCAPE} OR name LIKE ? ${LIKE_ESCAPE})` : '';
  const params = q ? [likePattern(q), likePattern(q)] : [];

  const { n: total } = db.prepare(`SELECT COUNT(*) AS n FROM courses ${where}`).get(...params);
  const rows = db.prepare(`${SELECT} ${where} ORDER BY code LIMIT ? OFFSET ?`).all(...params, limit, offset);
  return { rows, total };
}

function findById(id) {
  return getDb().prepare(`${SELECT} WHERE id = ?`).get(id);
}

function findByCode(code) {
  return getDb().prepare(`${SELECT} WHERE code = ?`).get(code);
}

function create({ code, name, credits }) {
  const result = getDb().prepare('INSERT INTO courses (code, name, credits) VALUES (?, ?, ?)').run(code, name, credits);
  return Number(result.lastInsertRowid);
}

function update(id, data) {
  const { setSql, params } = buildSet(UPDATE_FIELDS, data);
  if (!setSql) return;
  getDb().prepare(`UPDATE courses SET ${setSql} WHERE id = ?`).run(...params, id);
}

function remove(id) {
  getDb().prepare('DELETE FROM courses WHERE id = ?').run(id);
}

module.exports = { findAll, findById, findByCode, create, update, remove };
