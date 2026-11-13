const config = require('../../config');
const { initDb, getDb, closeDb } = require('..');
const { seed } = require('.');

initDb(config.dbPath);
seed();
const { n } = getDb().prepare('SELECT COUNT(*) AS n FROM students').get();
console.log(`Đã nạp dữ liệu mẫu: ${n} sinh viên (${config.dbPath}).`);
closeDb();
