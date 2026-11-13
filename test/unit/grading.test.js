const { test } = require('node:test');
const assert = require('node:assert/strict');
const { convertScore, classify, summarize } = require('../../src/utils/grading');

test('quy đổi điểm chữ tại các mốc', () => {
  assert.deepEqual(convertScore(10), { letter: 'A', point4: 4.0 });
  assert.deepEqual(convertScore(8.5), { letter: 'A', point4: 4.0 });
  assert.deepEqual(convertScore(8.4), { letter: 'B+', point4: 3.5 });
  assert.deepEqual(convertScore(7.0), { letter: 'B', point4: 3.0 });
  assert.deepEqual(convertScore(6.5), { letter: 'C+', point4: 2.5 });
  assert.deepEqual(convertScore(5.5), { letter: 'C', point4: 2.0 });
  assert.deepEqual(convertScore(5.0), { letter: 'D+', point4: 1.5 });
  assert.deepEqual(convertScore(4.0), { letter: 'D', point4: 1.0 });
  assert.deepEqual(convertScore(3.9), { letter: 'F', point4: 0.0 });
});

test('xếp loại học lực', () => {
  assert.equal(classify(3.6), 'Xuất sắc');
  assert.equal(classify(3.2), 'Giỏi');
  assert.equal(classify(2.5), 'Khá');
  assert.equal(classify(2.0), 'Trung bình');
  assert.equal(classify(1.9), 'Yếu');
});

test('GPA tính theo trọng số tín chỉ', () => {
  const results = [
    { credits: 3, score10: 9, score4: 4, passed: true },
    { credits: 1, score10: 5, score4: 1.5, passed: true },
  ];
  const summary = summarize(results);
  assert.equal(summary.totalCredits, 4);
  assert.equal(summary.gpa10, 8); // (9*3 + 5*1) / 4
  assert.equal(summary.gpa4, 3.38); // (4*3 + 1.5*1) / 4 = 3.375
});

test('môn không đạt không được tính vào tín chỉ tích lũy', () => {
  const summary = summarize([
    { credits: 3, score10: 3, score4: 0, passed: false },
    { credits: 2, score10: 7, score4: 3, passed: true },
  ]);
  assert.equal(summary.totalCredits, 5);
  assert.equal(summary.passedCredits, 2);
});

test('chưa có điểm: các giá trị bằng 0 và không xếp loại', () => {
  assert.deepEqual(summarize([]), {
    totalCourses: 0,
    totalCredits: 0,
    passedCredits: 0,
    gpa10: 0,
    gpa4: 0,
    classification: null,
  });
});