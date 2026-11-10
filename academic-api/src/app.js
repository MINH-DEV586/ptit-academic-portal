const express = require('express');
const cors = require('cors');

const STUDENT_ID_REGEX = /^SV\d{7}$/;

// Quy đổi điểm hệ 10 sang chữ và hệ 4
function convertScore(score) {
  if (score >= 8.5) return { letter: 'A', point4: 4.0 };
  if (score >= 8.0) return { letter: 'B+', point4: 3.5 };
  if (score >= 7.0) return { letter: 'B', point4: 3.0 };
  if (score >= 6.5) return { letter: 'C+', point4: 2.5 };
  if (score >= 5.5) return { letter: 'C', point4: 2.0 };
  if (score >= 5.0) return { letter: 'D+', point4: 1.5 };
  if (score >= 4.0) return { letter: 'D', point4: 1.0 };
  return { letter: 'F', point4: 0.0 };
}

function classify(gpa4) {
  if (gpa4 >= 3.6) return 'Xuất sắc';
  if (gpa4 >= 3.2) return 'Giỏi';
  if (gpa4 >= 2.5) return 'Khá';
  if (gpa4 >= 2.0) return 'Trung bình';
  return 'Yếu';
}

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

function error(res, status, code, message, details) {
  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  return res.status(status).json(body);
}

function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const STUDENT_SELECT = `
    SELECT s.student_id, s.full_name, s.date_of_birth, s.gender, s.email, s.phone,
           s.enrolled_year, s.status,
           c.id AS class_id, c.name AS class_name,
           m.id AS major_id, m.name AS major_name,
           f.id AS faculty_id, f.name AS faculty_name
    FROM students s
    JOIN classes c   ON c.id = s.class_id
    JOIN majors m    ON m.id = c.major_id
    JOIN faculties f ON f.id = m.faculty_id
  `;

  const toStudent = (r) => ({
    studentId: r.student_id,
    fullName: r.full_name,
    dateOfBirth: r.date_of_birth,
    gender: r.gender,
    email: r.email,
    phone: r.phone,
    enrolledYear: r.enrolled_year,
    status: r.status,
    class: { id: r.class_id, name: r.class_name },
    major: { id: r.major_id, name: r.major_name },
    faculty: { id: r.faculty_id, name: r.faculty_name },
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ success: true, service: 'academic-api', status: 'ok' });
  });

  // 1. Danh sách sinh viên (tìm kiếm + lọc + phân trang)
  app.get('/api/students', (req, res) => {
    const { q, classId, majorId, facultyId } = req.query;
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    const problems = [];
    if (!Number.isInteger(page) || page < 1) problems.push('page phải là số nguyên >= 1');
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) problems.push('limit phải là số nguyên từ 1 đến 100');
    for (const [k, v] of Object.entries({ classId, majorId, facultyId })) {
      if (v !== undefined && !/^\d+$/.test(v)) problems.push(`${k} phải là số nguyên dương`);
    }
    if (problems.length) {
      return error(res, 400, 'INVALID_QUERY', 'Tham số truy vấn không hợp lệ', problems);
    }

    const where = [];
    const params = [];
    if (q) {
      where.push('(s.full_name LIKE ? OR s.student_id LIKE ? OR s.email LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (classId) { where.push('c.id = ?'); params.push(Number(classId)); }
    if (majorId) { where.push('m.id = ?'); params.push(Number(majorId)); }
    if (facultyId) { where.push('f.id = ?'); params.push(Number(facultyId)); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = db
      .prepare(`SELECT COUNT(*) AS n FROM students s
                JOIN classes c ON c.id = s.class_id
                JOIN majors m ON m.id = c.major_id
                JOIN faculties f ON f.id = m.faculty_id ${whereSql}`)
      .get(...params).n;

    const rows = db
      .prepare(`${STUDENT_SELECT} ${whereSql} ORDER BY s.student_id LIMIT ? OFFSET ?`)
      .all(...params, limit, (page - 1) * limit);

    res.json({
      success: true,
      data: rows.map(toStudent),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });

  // 2. Thông tin chi tiết 1 sinh viên
  app.get('/api/students/:studentId', (req, res) => {
    const { studentId } = req.params;
    if (!STUDENT_ID_REGEX.test(studentId)) {
      return error(res, 400, 'INVALID_STUDENT_ID', 'Mã sinh viên không hợp lệ (định dạng đúng: SV + 7 chữ số, ví dụ SV2022001)');
    }
    const row = db.prepare(`${STUDENT_SELECT} WHERE s.student_id = ?`).get(studentId);
    if (!row) {
      return error(res, 404, 'STUDENT_NOT_FOUND', `Không tìm thấy sinh viên có mã ${studentId}`);
    }
    res.json({ success: true, data: toStudent(row) });
  });

  // 3. Thông tin học tập: điểm từng môn, GPA, số tín chỉ
  app.get('/api/students/:studentId/academic', (req, res) => {
    const { studentId } = req.params;
    if (!STUDENT_ID_REGEX.test(studentId)) {
      return error(res, 400, 'INVALID_STUDENT_ID', 'Mã sinh viên không hợp lệ (định dạng đúng: SV + 7 chữ số, ví dụ SV2022001)');
    }
    const student = db.prepare(`${STUDENT_SELECT} WHERE s.student_id = ?`).get(studentId);
    if (!student) {
      return error(res, 404, 'STUDENT_NOT_FOUND', `Không tìm thấy sinh viên có mã ${studentId}`);
    }

    const rows = db
      .prepare(`SELECT g.semester, g.score, co.code, co.name, co.credits
                FROM grades g JOIN courses co ON co.id = g.course_id
                WHERE g.student_id = ?
                ORDER BY g.semester, co.code`)
      .all(studentId);

    const results = rows.map((r) => {
      const conv = convertScore(r.score);
      return {
        semester: r.semester,
        courseCode: r.code,
        courseName: r.name,
        credits: r.credits,
        score10: r.score,
        letterGrade: conv.letter,
        score4: conv.point4,
        passed: r.score >= 4.0,
      };
    });

    const totalCredits = results.reduce((s, r) => s + r.credits, 0);
    const passedCredits = results.filter((r) => r.passed).reduce((s, r) => s + r.credits, 0);
    const gpa10 = totalCredits ? results.reduce((s, r) => s + r.score10 * r.credits, 0) / totalCredits : 0;
    const gpa4 = totalCredits ? results.reduce((s, r) => s + r.score4 * r.credits, 0) / totalCredits : 0;

    res.json({
      success: true,
      data: {
        studentId: student.student_id,
        fullName: student.full_name,
        className: student.class_name,
        majorName: student.major_name,
        facultyName: student.faculty_name,
        summary: {
          totalCourses: results.length,
          totalCredits,
          passedCredits,
          gpa10: round(gpa10),
          gpa4: round(gpa4),
          classification: totalCredits ? classify(gpa4) : null,
        },
        results,
      },
    });
  });

  // 404 cho route không tồn tại
  app.use((req, res) => error(res, 404, 'ROUTE_NOT_FOUND', `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`));

  // JSON body hỏng và lỗi không lường trước
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return error(res, 400, 'INVALID_JSON', 'Body JSON không hợp lệ');
    }
    console.error(err);
    return error(res, 500, 'INTERNAL_ERROR', 'Lỗi hệ thống, vui lòng thử lại sau');
  });

  return app;
}

module.exports = { createApp, convertScore };
