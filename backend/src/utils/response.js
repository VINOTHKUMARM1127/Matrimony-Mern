/**
 * Wedring Backend — Standardised API Response Helpers
 */

/**
 * Send a successful response
 */
export function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error response
 */
export function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Send a paginated response
 */
export function paginated(res, data, total, page, limit, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: (page * limit) < total,
    },
  });
}

export default { success, error, paginated };
