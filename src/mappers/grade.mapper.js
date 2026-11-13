const { convertScore } = require('../utils/grading');

function toGrade(row) {
  const converted = convertScore(row.score);
  return {
    gradeId: row.id,
    semester: row.semester,
    courseId: row.course_id,
    courseCode: row.code,
    courseName: row.name,
    credits: row.credits,
    score10: row.score,
    letterGrade: converted.letter,
    score4: converted.point4,
    passed: row.score >= 4.0,
  };
}

module.exports = { toGrade };