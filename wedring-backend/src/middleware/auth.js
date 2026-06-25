/**
 * Wedring Backend — JWT Auth Middleware
 *
 * 1. Extract Bearer token from Authorization header
 * 2. Verify via supabaseAdmin.auth.getUser(token)
 * 3. Attach user to req.user
 * 4. Reject with 401 if invalid
 */
import { supabaseAdmin } from '../config/supabase.js';
import { error } from '../utils/response.js';

export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Missing or invalid authorization header', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return error(res, 'No token provided', 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return error(res, 'Invalid or expired token', 401);
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    return error(res, 'Authentication failed', 401);
  }
}

export default auth;
