// Dữ liệu mẫu sinh viên. Chạy: npm run seed
const { openDb } = require('./db');

const faculties = [
  [1, 'Khoa Công nghệ thông tin'],
  [2, 'Khoa Kinh tế'],
  [3, 'Khoa Ngoại ngữ'],
];

const majors = [
  [1, 'Khoa học máy tính', 1],
  [2, 'Kỹ thuật phần mềm', 1],
  [3, 'Hệ thống thông tin', 1],
  [4, 'Quản trị kinh doanh', 2],
  [5, 'Ngôn ngữ Trung Quốc', 3],
];

const classes = [
  [1, 'KHMT22A', 1],
  [2, 'KHMT22B', 1],
  [3, 'KTPM22A', 2],
  [4, 'HTTT22A', 3],
  [5, 'QTKD22A', 4],
  [6, 'NNTQ22A', 5],
];

// [student_id, full_name, dob, gender, email, phone, class_id, enrolled_year, status]
const students = [
  ['SV2022001', 'Nguyễn Văn An',     '2004-03-12', 'Nam', 'an.nv@student.edu.vn',     '0901000001', 1, 2022, 'Đang học'],
  ['SV2022002', 'Trần Thị Bình',     '2004-07-25', 'Nữ',  'binh.tt@student.edu.vn',   '0901000002', 1, 2022, 'Đang học'],
  ['SV2022003', 'Lê Minh Châu',      '2004-01-08', 'Nữ',  'chau.lm@student.edu.vn',   '0901000003', 2, 2022, 'Đang học'],
  ['SV2022004', 'Phạm Quốc Dũng',    '2003-11-30', 'Nam', 'dung.pq@student.edu.vn',   '0901000004', 2, 2022, 'Đang học'],
  ['SV2022005', 'Hoàng Thị Giang',   '2004-05-17', 'Nữ',  'giang.ht@student.edu.vn',  '0901000005', 3, 2022, 'Đang học'],
  ['SV2022006', 'Vũ Đức Hải',        '2004-09-02', 'Nam', 'hai.vd@student.edu.vn',    '0901000006', 3, 2022, 'Đang học'],
  ['SV2022007', 'Đặng Thu Hà',       '2004-02-14', 'Nữ',  'ha.dt@student.edu.vn',     '0901000007', 4, 2022, 'Đang học'],
  ['SV2022008', 'Bùi Anh Khoa',      '2004-12-21', 'Nam', 'khoa.ba@student.edu.vn',   '0901000008', 4, 2022, 'Bảo lưu'],
  ['SV2022009', 'Ngô Thị Lan',       '2004-06-06', 'Nữ',  'lan.nt@student.edu.vn',    '0901000009', 5, 2022, 'Đang học'],
  ['SV2022010', 'Đỗ Hoàng Nam',      '2004-04-19', 'Nam', 'nam.dh@student.edu.vn',    '0901000010', 5, 2022, 'Đang học'],
  ['SV2022011', 'Lý Mỹ Phương',      '2004-08-09', 'Nữ',  'phuong.lm@student.edu.vn', '0901000011', 6, 2022, 'Đang học'],
  ['SV2022012', 'Trịnh Gia Huy',     '2004-10-27', 'Nam', 'huy.tg@student.edu.vn',    '0901000012', 1, 2022, 'Đang học'],
  ['SV2022013', 'Phan Thanh Tùng',   '2004-01-23', 'Nam', 'tung.pt@student.edu.vn',   '0901000013', 2, 2022, 'Đang học'],
  ['SV2022014', 'Dương Ngọc Anh',    '2004-03-30', 'Nữ',  'anh.dn@student.edu.vn',    '0901000014', 2, 2022, 'Đang học'],
  ['SV2022015', 'Võ Quang Vinh',     '2003-12-05', 'Nam', 'vinh.vq@student.edu.vn',   '0901000015', 3, 2022, 'Đang học'],
  ['SV2022016', 'Nguyễn Khánh Linh', '2004-07-11', 'Nữ',  'linh.nk@student.edu.vn',   '0901000016', 4, 2022, 'Đang học'],
  ['SV2022017', 'Lương Minh Quân',   '2004-05-28', 'Nam', 'quan.lm@student.edu.vn',   '0901000017', 4, 2022, 'Đang học'],
  ['SV2022018', 'Cao Thị Thu',       '2004-09-15', 'Nữ',  'thu.ct@student.edu.vn',    '0901000018', 5, 2022, 'Đang học'],
  ['SV2022019', 'Tạ Hữu Đạt',        '2004-02-02', 'Nam', 'dat.th@student.edu.vn',    '0901000019', 5, 2022, 'Bảo lưu'],
  ['SV2022020', 'Mai Phương Thảo',   '2004-11-18', 'Nữ',  'thao.mp@student.edu.vn',   '0901000020', 6, 2022, 'Đang học'],
];

const courses = [
  [1, 'INT1001', 'Lập trình căn bản', 3],
  [2, 'INT1002', 'Cấu trúc dữ liệu và giải thuật', 4],
  [3, 'INT1003', 'Cơ sở dữ liệu', 3],
  [4, 'INT1004', 'Mạng máy tính', 3],
  [5, 'MAT1001', 'Toán rời rạc', 3],
  [6, 'ENG1001', 'Tiếng Anh chuyên ngành', 2],
  [7, 'INT2001', 'Lập trình Web', 3],
  [8, 'ECO1001', 'Kinh tế vi mô', 3],
  [9, 'CHN1001', 'Tiếng Trung sơ cấp', 3],
];

// [student_id, course_id, semester, score]
const grades = [
  ['SV2022001', 1, '2022-2023 HK1', 8.5], ['SV2022001', 5, '2022-2023 HK1', 7.8], ['SV2022001', 6, '2022-2023 HK1', 9.0],
  ['SV2022001', 2, '2022-2023 HK2', 8.2], ['SV2022001', 3, '2022-2023 HK2', 9.1], ['SV2022001', 4, '2023-2024 HK1', 7.5],
  ['SV2022001', 7, '2023-2024 HK1', 8.8],

  ['SV2022002', 1, '2022-2023 HK1', 9.2], ['SV2022002', 5, '2022-2023 HK1', 8.6], ['SV2022002', 6, '2022-2023 HK1', 8.0],
  ['SV2022002', 2, '2022-2023 HK2', 9.0], ['SV2022002', 3, '2022-2023 HK2', 8.7], ['SV2022002', 4, '2023-2024 HK1', 9.3],

  ['SV2022003', 1, '2022-2023 HK1', 6.5], ['SV2022003', 5, '2022-2023 HK1', 7.0], ['SV2022003', 2, '2022-2023 HK2', 6.8],
  ['SV2022003', 3, '2022-2023 HK2', 7.4],

  ['SV2022004', 1, '2022-2023 HK1', 5.5], ['SV2022004', 5, '2022-2023 HK1', 4.5], ['SV2022004', 2, '2022-2023 HK2', 6.0],

  ['SV2022005', 1, '2022-2023 HK1', 8.0], ['SV2022005', 3, '2022-2023 HK2', 8.4], ['SV2022005', 7, '2023-2024 HK1', 9.0],

  ['SV2022006', 1, '2022-2023 HK1', 7.2], ['SV2022006', 3, '2022-2023 HK2', 6.9], ['SV2022006', 7, '2023-2024 HK1', 7.7],

  ['SV2022007', 3, '2022-2023 HK2', 8.9], ['SV2022007', 6, '2022-2023 HK1', 9.4],

  ['SV2022009', 8, '2022-2023 HK1', 7.9], ['SV2022009', 6, '2022-2023 HK1', 8.3],

  ['SV2022010', 8, '2022-2023 HK1', 6.4], ['SV2022010', 6, '2022-2023 HK1', 7.1],

  ['SV2022011', 9, '2022-2023 HK1', 9.5], ['SV2022011', 6, '2022-2023 HK1', 9.0],

  ['SV2022012', 1, '2022-2023 HK1', 7.0], ['SV2022012', 5, '2022-2023 HK1', 6.2], ['SV2022012', 2, '2022-2023 HK2', 7.3],

  ['SV2022013', 1, '2022-2023 HK1', 8.1], ['SV2022013', 5, '2022-2023 HK1', 7.4], ['SV2022013', 2, '2022-2023 HK2', 8.6],
  ['SV2022013', 3, '2022-2023 HK2', 7.9],

  ['SV2022014', 1, '2022-2023 HK1', 9.0], ['SV2022014', 6, '2022-2023 HK1', 8.8], ['SV2022014', 2, '2022-2023 HK2', 9.4],
  ['SV2022014', 7, '2023-2024 HK1', 9.1],

  ['SV2022015', 1, '2022-2023 HK1', 4.8], ['SV2022015', 5, '2022-2023 HK1', 3.5], ['SV2022015', 3, '2022-2023 HK2', 5.6],

  ['SV2022016', 8, '2022-2023 HK1', 8.2], ['SV2022016', 6, '2022-2023 HK1', 7.6], ['SV2022016', 3, '2022-2023 HK2', 8.0],

  ['SV2022017', 8, '2022-2023 HK1', 5.9], ['SV2022017', 6, '2022-2023 HK1', 6.7], ['SV2022017', 3, '2022-2023 HK2', 6.1],

  ['SV2022018', 8, '2022-2023 HK1', 9.1], ['SV2022018', 6, '2022-2023 HK1', 9.3],

  ['SV2022019', 8, '2022-2023 HK1', 7.0], ['SV2022019', 6, '2022-2023 HK1', 6.0],

  ['SV2022020', 9, '2022-2023 HK1', 8.7], ['SV2022020', 6, '2022-2023 HK1', 8.5],
];

function seed(db) {
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM grades; DELETE FROM students; DELETE FROM classes; DELETE FROM majors; DELETE FROM faculties; DELETE FROM courses;');

    const run = (sql, rows) => {
      const stmt = db.prepare(sql);
      rows.forEach((r) => stmt.run(...r));
    };

    run('INSERT INTO faculties (id, name) VALUES (?, ?)', faculties);
    run('INSERT INTO majors (id, name, faculty_id) VALUES (?, ?, ?)', majors);
    run('INSERT INTO classes (id, name, major_id) VALUES (?, ?, ?)', classes);
    run(
      `INSERT INTO students (student_id, full_name, date_of_birth, gender, email, phone, class_id, enrolled_year, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      students
    );
    run('INSERT INTO courses (id, code, name, credits) VALUES (?, ?, ?, ?)', courses);
    run('INSERT INTO grades (student_id, course_id, semester, score) VALUES (?, ?, ?, ?)', grades);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

module.exports = { seed };

if (require.main === module) {
  const db = openDb();
  seed(db);
  const n = db.prepare('SELECT COUNT(*) AS n FROM students').get().n;
  console.log(`Đã nạp dữ liệu mẫu: ${n} sinh viên.`);
}
