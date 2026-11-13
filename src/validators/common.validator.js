// Rule dùng chung cho nhiều API

// page, limit cho các API danh sách. defaultLimit khác nhau tùy tài nguyên.
function paginationRules(defaultLimit = 10) {
  return {
    page: { type: 'integer', min: 1, default: 1 },
    limit: { type: 'integer', min: 1, max: 100, default: defaultLimit },
  };
}

const idRule = { type: 'integer', min: 1 };

module.exports = { paginationRules, idRule };