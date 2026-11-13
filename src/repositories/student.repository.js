const { getDb } = require('../database');
const { LIKE_ESCAPE, likePattern, buildSet } = require('../utils/sql');

const FROM = `
  FROM students s
  JOIN classes c   ON c.id = s.class_id
  JOIN majors m    ON m.id = c.major_id
  JOIN faculties f ON f.id = m.faculty_id`;

const SELECT = `
  SELECT s.student_id, s.full_name, s.date_of_birth, s.gender, s.email, s.phone,
         s.enrolled_year, s.status,
         c.id AS class_id, c.name AS class_name,
         m.id AS major_id, m.name AS major_name,
         f.id AS faculty_id, f.name AS faculty_name
  ${FROM}`;

const SORT_COLUMNS = {
  studentId: 's.student_id',
  fullName: 's.full_name',
  enrolledYear: 's.enrolled_year',
  dateOfBirth: 's.date_of_birth',
};

const UPDATE_FIELDS = {
  fullName: 'full_name',
  dateOfBirth: 'date_of_birth',
  gender: 'gender',
  email: 'email',
  phone: 'phone',
  classId: 'class_id',
  enrolledYear: 'enrolled_year',
  status: 'status',
};

function buildWhere({ q, classId, majorId, facultyId, status, gender, enrolledYear }) {
  const where = [];
  const params = [];

  if (q) {
    const like = likePattern(q);
    where.push(
      `(s.full_name LIKE ? ${LIKE_ESCAPE} OR s.student_id LIKE ? ${LIKE_ESCAPE} OR s.email LIKE ? ${LIKE_ESCAPE})`
    );
    params.push(like, like, like);
  }
  if (classId) { where.push('c.id = ?'); params.push(classId); }
  if (majorId) { where.push('m.id = ?'); params.push(majorId); }
  if (facultyId) { where.push('f.id = ?'); params.push(facultyId); }
  if (status) { where.push('s.status = ?'); params.push(status); }
  if (gender) { where.push('s.gender = ?'); params.push(gender); }
  if (enrolledYear) { where.push('s.enrolled_year = ?'); params.push(enrolledYear); }

  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

function findAll(filters, { sortBy, order, limit, offset }) {
  const db = getDb();
  const { sql, params } = buildWhere(filters);
  const direction = order === 'desc' ? 'DESC' : 'ASC';

  const { n: total } = db.prepare(`SELECT COUNT(*) AS n ${FROM} ${sql}`).get(...params);
  const rows = db
    .prepare(`${SELECT} ${sql} ORDER BY ${SORT_COLUMNS[sortBy]} ${direction}, s.student_id LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  return { rows, total };
}

function findById(studentId) {
  return getDb().prepare(`${SELECT} WHERE s.student_id = ?`).get(studentId);
}

function findByEmail(email) {
  return getDb().prepare('SELECT student_id FROM students WHERE email = ?').get(email);
}

function create(data) {
  getDb()
    .prepare(
      `INSERT INTO students
         (student_id, full_name, date_of_birth, gender, email, phone, class_id, enrolled_year, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.studentId,
      data.fullName,
      data.dateOfBirth,
      data.gender,
      data.email,
      data.phone ?? null,
      data.classId,
      data.enrolledYear,
      data.status
    );
}

function update(studentId, data) {
  const { setSql, params } = buildSet(UPDATE_FIELDS, data);
  if (!setSql) return;
  getDb().prepare(`UPDATE students SET ${setSql} WHERE student_id = ?`).run(...params, studentId);
}

function remove(studentId) {
  getDb().prepare('DELETE FROM students WHERE student_id = ?').run(studentId);
}

function generateId(enrolledYear) {
  const prefix = `SV${enrolledYear}`;
  const { last } = getDb()
    .prepare('SELECT MAX(student_id) AS last FROM students WHERE student_id LIKE ?')
    .get(`${prefix}%`);
  const next = last ? Number(last.slice(prefix.length)) + 1 : 1;
  return next > 999 ? null : `${prefix}${String(next).padStart(3, '0')}`;
}

module.exports = { findAll, findById, findByEmail, create, update, remove, generateId };
