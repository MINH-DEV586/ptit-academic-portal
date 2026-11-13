const LIKE_ESCAPE = "ESCAPE '\\'";

function likePattern(text) {
  return `%${String(text).replace(/[\\%_]/g, '\\$&')}%`;
}

function buildSet(fieldMap, data) {
  const columns = [];
  const params = [];
  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      columns.push(`${column} = ?`);
      params.push(data[key]);
    }
  }
  return { setSql: columns.join(', '), params };
}

module.exports = { LIKE_ESCAPE, likePattern, buildSet };
