
const round = (n, digits = 2) => Math.round(n * 10 ** digits) / 10 ** digits;

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

function summarize(results) {
  const totalCredits = results.reduce((sum, r) => sum + r.credits, 0);
  const passedCredits = results.filter((r) => r.passed).reduce((sum, r) => sum + r.credits, 0);
  const gpa10 = totalCredits ? results.reduce((s, r) => s + r.score10 * r.credits, 0) / totalCredits : 0;
  const gpa4 = totalCredits ? results.reduce((s, r) => s + r.score4 * r.credits, 0) / totalCredits : 0;

  return {
    totalCourses: results.length,
    totalCredits,
    passedCredits,
    gpa10: round(gpa10),
    gpa4: round(gpa4),
    classification: totalCredits ? classify(gpa4) : null,
  };
}

module.exports = { round, convertScore, classify, summarize };
