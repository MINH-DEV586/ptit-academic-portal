// Kết nối SQLite (module có sẵn trong Node >= 22.13, không cần cài thêm package)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'academic.db');

function openDb(file = DB_PATH) {
  if (file !== ':memory:') {
    require('fs').mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS faculties (
      id   INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS majors (
      id         INTEGER PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      faculty_id INTEGER NOT NULL REFERENCES faculties(id)
    );

    CREATE TABLE IF NOT EXISTS classes (
      id       INTEGER PRIMARY KEY,
      name     TEXT NOT NULL UNIQUE,
      major_id INTEGER NOT NULL REFERENCES majors(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      student_id    TEXT PRIMARY KEY,           -- ví dụ SV2022001
      full_name     TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,              -- YYYY-MM-DD
      gender        TEXT NOT NULL CHECK (gender IN ('Nam','Nữ')),
      email         TEXT NOT NULL UNIQUE,
      phone         TEXT,
      class_id      INTEGER NOT NULL REFERENCES classes(id),
      enrolled_year INTEGER NOT NULL,
      status        TEXT NOT NULL DEFAULT 'Đang học'
    );

    CREATE TABLE IF NOT EXISTS courses (
      id      INTEGER PRIMARY KEY,
      code    TEXT NOT NULL UNIQUE,
      name    TEXT NOT NULL,
      credits INTEGER NOT NULL CHECK (credits > 0)
    );

    CREATE TABLE IF NOT EXISTS grades (
      id         INTEGER PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(student_id),
      course_id  INTEGER NOT NULL REFERENCES courses(id),
      semester   TEXT NOT NULL,                 -- ví dụ 2023-2024 HK1
      score      REAL NOT NULL CHECK (score >= 0 AND score <= 10),
      UNIQUE (student_id, course_id, semester)
    );

    CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
    CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
  `);
  return db;
}

module.exports = { openDb, DB_PATH };
