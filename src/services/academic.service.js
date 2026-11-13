const studentRepo = require('../repositories/student.repository');
const gradeRepo = require('../repositories/grade.repository');
const errors = require('../utils/domainErrors');
const { toGrade } = require('../mappers/grade.mapper');
const { summarize } = require('../utils/grading');

function getAcademicRecord(studentId) {
  const student = studentRepo.findById(studentId);
  if (!student) throw errors.studentNotFound(studentId);

  const results = gradeRepo.findByStudent(studentId).map(toGrade);

  return {
    studentId: student.student_id,
    fullName: student.full_name,
    className: student.class_name,
    majorName: student.major_name,
    facultyName: student.faculty_name,
    summary: summarize(results),
    results,
  };
}

module.exports = { getAcademicRecord };