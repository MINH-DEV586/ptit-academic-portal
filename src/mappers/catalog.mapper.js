const toFaculty = (row) => ({
  id: row.id,
  name: row.name,
  majorCount: row.major_count,
});

const toMajor = (row) => ({
  id: row.id,
  name: row.name,
  faculty: { id: row.faculty_id, name: row.faculty_name },
  classCount: row.class_count,
});

const toClass = (row) => ({
  id: row.id,
  name: row.name,
  major: { id: row.major_id, name: row.major_name },
  faculty: { id: row.faculty_id, name: row.faculty_name },
  studentCount: row.student_count,
});

const toCourse = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  credits: row.credits,
});

module.exports = { toFaculty, toMajor, toClass, toCourse };