/**
 * Wedring Backend — Photos Service
 *
 * Handles photo uploads to Cloudflare R2 and database management.
 */
import { v4 as uuidv4 } from 'uuid';
import r2Client, { PutObjectCommand, DeleteObjectCommand } from '../../config/r2.js';
import { supabaseAdmin } from '../../config/supabase.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

const MAX_PHOTOS = 5;

/**
 * Upload a photo to R2 and save record
 */
export async function uploadPhoto(userId, file) {
  // Check current photo count
  const { count } = await supabaseAdmin
    .from('profile_photos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (count >= MAX_PHOTOS) {
    const err = new Error(`Maximum ${MAX_PHOTOS} photos allowed`);
    err.statusCode = 400;
    throw err;
  }

  // Generate R2 key
  const ext = file.originalname?.split('.').pop() || 'jpg';
  const r2Key = `photos/${userId}/${uuidv4()}.${ext}`;

  // Upload to R2
  await r2Client.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: r2Key,
    Body: file.buffer,
    ContentType: file.mimetype || 'image/jpeg',
  }));

  const r2Url = `${env.R2_PUBLIC_DOMAIN}/${r2Key}`;

  // Check if this is the first photo (make it primary)
  const isPrimary = count === 0;

  // Save to database
  const { data, error } = await supabaseAdmin
    .from('profile_photos')
    .insert({
      user_id: userId,
      r2_key: r2Key,
      r2_url: r2Url,
      is_primary: isPrimary,
      display_order: count || 0,
    })
    .select()
    .single();

  if (error) throw error;

  logger.info(`Photo uploaded for user ${userId}: ${r2Key}`);
  return data;
}

/**
 * Delete a photo from R2 and database
 */
export async function deletePhoto(userId, photoId) {
  // Fetch photo record and verify ownership
  const { data: photo, error: fetchErr } = await supabaseAdmin
    .from('profile_photos')
    .select('*')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !photo) {
    const err = new Error('Photo not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  // Delete from R2
  if (photo.r2_key) {
    try {
      await r2Client.send(new DeleteObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: photo.r2_key,
      }));
    } catch (r2Err) {
      logger.warn(`Failed to delete from R2: ${photo.r2_key}`, r2Err.message);
    }
  }

  // Delete from database
  const { error } = await supabaseAdmin
    .from('profile_photos')
    .delete()
    .eq('id', photoId);

  if (error) throw error;

  logger.info(`Photo deleted for user ${userId}: ${photoId}`);
  return true;
}

/**
 * Set a photo as primary
 */
export async function setPrimary(userId, photoId) {
  // Verify ownership
  const { data: photo } = await supabaseAdmin
    .from('profile_photos')
    .select('id')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (!photo) {
    const err = new Error('Photo not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  // Unset all primary
  await supabaseAdmin
    .from('profile_photos')
    .update({ is_primary: false })
    .eq('user_id', userId);

  // Set target as primary
  const { data, error } = await supabaseAdmin
    .from('profile_photos')
    .update({ is_primary: true })
    .eq('id', photoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * List user's photos
 */
export async function listPhotos(userId) {
  const { data, error } = await supabaseAdmin
    .from('profile_photos')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export default { uploadPhoto, deletePhoto, setPrimary, listPhotos };
