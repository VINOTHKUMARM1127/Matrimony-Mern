/**
 * Wedring Backend — Photos Controller
 */
import * as photosService from './photos.service.js';
import { success, error } from '../../utils/response.js';

export async function upload(req, res, next) {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }
    const data = await photosService.uploadPhoto(req.user.id, req.file);
    return success(res, data, 'Photo uploaded', 201);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await photosService.deletePhoto(req.user.id, req.params.photoId);
    return success(res, null, 'Photo deleted');
  } catch (err) { next(err); }
}

export async function setPrimary(req, res, next) {
  try {
    const data = await photosService.setPrimary(req.user.id, req.params.photoId);
    return success(res, data, 'Primary photo updated');
  } catch (err) { next(err); }
}

export async function list(req, res, next) {
  try {
    const data = await photosService.listPhotos(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export default { upload, remove, setPrimary, list };
