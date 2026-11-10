const { openDb } = require('./db');
const { seed } = require('./seed');
const { createApp } = require('./app');

const PORT = process.env.PORT || 3001;

const db = openDb();
// Tự nạp dữ liệu mẫu lần chạy đầu tiên
if (db.prepare('SELECT COUNT(*) AS n FROM students').get().n === 0) {
  seed(db);
  console.log('Đã nạp dữ liệu mẫu.');
}

createApp(db).listen(PORT, () => {
  console.log(`Academic API đang chạy tại http://localhost:${PORT}`);
});
