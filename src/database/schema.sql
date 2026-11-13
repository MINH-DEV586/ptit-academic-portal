
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
