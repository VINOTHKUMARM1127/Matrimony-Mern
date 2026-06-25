/**
 * Wedring Backend — Zod Request Validation Middleware
 *
 * Wraps Zod schemas for body, query, or params validation.
 * Returns 422 with field-level errors on failure.
 */
import { error } from '../utils/response.js';

/**
 * Create a validation middleware for a given Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema
 * @param {'body' | 'query' | 'params'} source - Where to read data from
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });

      return error(res, 'Validation failed', 422, fieldErrors);
    }

    // Replace with parsed (coerced/transformed) data
    req[source] = result.data;
    next();
  };
}

export default validate;
