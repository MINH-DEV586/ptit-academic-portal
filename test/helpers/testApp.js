process.env.NODE_ENV = 'test';

const { initDb, closeDb } = require('../../src/database');
const { seed } = require('../../src/database/seed');
const { createApp } = require('../../src/app');

async function startTestApp() {
  initDb(':memory:');
  seed();

  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://localhost:${server.address().port}`;

  async function request(method, path, body) {
    const hasBody = body !== undefined;
    const res = await fetch(base + path, {
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
    return { status: res.status, body: await res.json() };
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    del: (path) => request('DELETE', path),
    stop() {
      server.close();
      server.closeAllConnections?.();
      closeDb();
    },
  };
}

module.exports = { startTestApp };