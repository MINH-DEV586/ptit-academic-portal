function toStudent(row) {
  return {
    studentId: row.student_id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    email: row.email,
    phone: row.phone,
    enrolledYear: row.enrolled_year,
    status: row.status,
    class: { id: row.class_id, name: row.class_name },
    major: { id: row.major_id, name: row.major_name },
    faculty: { id: row.faculty_id, name: row.faculty_name },
  };
}

module.exports = { toStudent };