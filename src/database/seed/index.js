const { getDb, transaction } = require('..');

const faculties = require('./data/faculties');
const majors = require('./data/majors');
const classes = require('./data/classes');
const students = require('./data/students');
const courses = require('./data/courses');
const grades = require('./data/grades');

function insertAll(db, sql, rows) {
  const stmt = db.prepare(sql);
  rows.forEach((row) => stmt.run(...row));
}

function seed() {
  const db = getDb();
  transaction(() => {
    db.exec(`
      DELETE FROM grades;
      DELETE FROM students;
      DELETE FROM classes;
      DELETE FROM majors;
      DELETE FROM faculties;
      DELETE FROM courses;
    `);
    insertAll(db, 'INSERT INTO faculties (id, name) VALUES (?, ?)', faculties);
    insertAll(db, 'INSERT INTO majors (id, name, faculty_id) VALUES (?, ?, ?)', majors);
    insertAll(db, 'INSERT INTO classes (id, name, major_id) VALUES (?, ?, ?)', classes);
    insertAll(
      db,
      `INSERT INTO students
         (student_id, full_name, date_of_birth, gender, email, phone, class_id, enrolled_year, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      students
    );
    insertAll(db, 'INSERT INTO courses (id, code, name, credits) VALUES (?, ?, ?, ?)', courses);
    insertAll(db, 'INSERT INTO grades (student_id, course_id, semester, score) VALUES (?, ?, ?, ?)', grades);
  });
}

function ensureSeeded() {
  const { n } = getDb().prepare('SELECT COUNT(*) AS n FROM students').get();
  if (n === 0) {
    seed();
    return true;
  }
  return false;
}

module.exports = { seed, ensureSeeded };
