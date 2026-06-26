/**
 * Wedring Backend — Admin Auth Middleware
 *
 * Must be used AFTER auth middleware.
 * Checks the admin_users table for the authenticated user's email.
 */
import { supabaseAdmin } from '../config/supabase.js';
import { error } from '../utils/response.js';

export async function adminAuth(req, res, next) {
  try {
    if (!req.user || !req.user.email) {
      return error(res, 'Authentication required', 401);
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('email', req.user.email)
      .maybeSingle();

    if (dbError || !data) {
      return error(res, 'Admin access required', 403);
    }

    req.adminRole = data.role;
    next();
  } catch (err) {
    return error(res, 'Admin authorization failed', 403);
  }
}

export default adminAuth;
