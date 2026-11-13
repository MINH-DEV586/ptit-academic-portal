const config = require('./config');
const { initDb, closeDb } = require('./database');
const { ensureSeeded } = require('./database/seed');
const { createApp } = require('./app');

initDb(config.dbPath);
if (ensureSeeded()) console.log('Đã nạp dữ liệu mẫu.');

const server = createApp().listen(config.port, () => {
  console.log(`Academic API đang chạy tại http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);