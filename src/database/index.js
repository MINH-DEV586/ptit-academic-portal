const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

let db = null;

function initDb(file) {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  return db;
}

function getDb() {
  if (!db) throw new Error('Database chưa được khởi tạo. Hãy gọi initDb() trước.');
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

function transaction(fn) {
  const conn = getDb();
  conn.exec('BEGIN');
  try {
    const result = fn();
    conn.exec('COMMIT');
    return result;
  } catch (err) {
    conn.exec('ROLLBACK');
    throw err;
  }
}

module.exports = { initDb, getDb, closeDb, transaction };
