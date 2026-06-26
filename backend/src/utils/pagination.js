/**
 * Wedring Backend — Pagination Helpers
 */

/**
 * Parse pagination params from query string.
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export default { parsePagination };
