/**
 * Wedring Backend — Admin Bulk Import Controller
 */
import * as bulkImportService from './admin.bulkImport.service.js';
import { success, error } from '../../../utils/response.js';

export async function importUsers(req, res, next) {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    const result = await bulkImportService.importUsers(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    return success(res, result, `Import complete: ${result.success_count} success`);
  } catch (err) { next(err); }
}

export default { importUsers };
