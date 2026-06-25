/**
 * Wedring Backend — Global Error Handler
 *
 * Catches unhandled errors and returns standardised error responses.
 */
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  logger.error(`[${req.method}] ${req.originalUrl} →`, err.message || err);

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.',
    });
  }

  // Zod validation errors (if thrown directly)
  if (err.name === 'ZodError') {
    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }

  // Supabase errors
  if (err.code && err.message && err.details) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

export default errorHandler;
