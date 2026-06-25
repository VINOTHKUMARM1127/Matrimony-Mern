/**
 * Wedring Matrimony — Image Processor Service
 * Compression, thumbnails, and upload management
 */
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { IMAGE_CONFIG, STORAGE_BUCKETS } from '../utils/constants';

const uriToBlob = async (uri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.error('uriToBlob error:', e);
      reject(new TypeError('Local file read failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
};

/**
 * Pick images from library
 */
export const pickImages = async (maxCount = 1) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Photo library permission required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: maxCount > 1,
    selectionLimit: maxCount,
    quality: 0.8,
  });

  if (result.canceled) return [];
  return result.assets;
};

/**
 * Take a photo with camera
 */
export const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission required');
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    allowsEditing: true,
    aspect: [3, 4],
  });

  if (result.canceled) return null;
  return result.assets[0];
};

/**
 * Compress image for upload
 */
export const compressImage = async (uri, options = {}) => {
  const { getInfoAsync } = require('expo-file-system/legacy');
  let maxWidth = options.maxWidth || IMAGE_CONFIG.MAX_WIDTH;
  let quality = options.quality || IMAGE_CONFIG.QUALITY;
  let manipulated;
  let fileSize = Infinity;

  while (fileSize > 200 * 1024 && quality > 0.1) {
    manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.WEBP }
    );
    const fileInfo = await getInfoAsync(manipulated.uri);
    fileSize = fileInfo.size;
    quality -= 0.15;
    maxWidth = Math.floor(maxWidth * 0.8);
  }

  return manipulated;
};

/**
 * Generate thumbnail
 */
export const generateThumbnail = async (uri) => {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: IMAGE_CONFIG.THUMBNAIL_SIZE } }],
    { compress: IMAGE_CONFIG.THUMBNAIL_QUALITY, format: ImageManipulator.SaveFormat.WEBP }
  );

  return manipulated;
};

import { decode } from 'base64-arraybuffer';
import { getR2Client, PutObjectCommand, DeleteObjectCommand } from '../api/r2Client';

// All R2 access routes through the shared, RN-correct client
// (forcePathStyle + checksum-safe). See src/api/r2Client.js.
const getS3Client = getR2Client;

/**
 * Upload image to Cloudflare R2
 */
export const uploadImage = async (uri, userId, bucket = STORAGE_BUCKETS.PROFILE_PHOTOS) => {
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
  
  const r2AccountId = process.env.EXPO_PUBLIC_R2_ACCOUNT_ID;
  const r2AccessKeyId = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
  const r2SecretAccessKey = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
  const hasR2Creds = r2AccountId && r2AccessKeyId && r2SecretAccessKey;

  // Fallback if Cloudflare R2 credentials are not set in development
  if (!hasR2Creds && (__DEV__ || process.env.EXPO_PUBLIC_APP_ENV === 'development')) {
    console.warn('Cloudflare R2 credentials are not set. Using dev mock upload.');
    const randomId = Math.floor(Math.random() * 1000);
    return {
      path: fileName,
      publicUrl: `https://picsum.photos/id/${randomId % 100}/400/400`,
    };
  }

  // Convert to base64 then array buffer
  const fileInstance = new (require('expo-file-system').File)(uri);
  const base64 = await fileInstance.base64();
  const arrayBuffer = decode(base64);

  const bucketName = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || bucket;
  const buffer = new Uint8Array(arrayBuffer);
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: 'image/webp',
  });

  const client = getS3Client();
  await client.send(command);

  const r2PublicDomain = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || '';
  const publicUrl = `${r2PublicDomain}/${fileName}`;

  return {
    path: fileName,
    publicUrl: publicUrl,
  };
};

/**
 * Delete image from storage
 */
export const deleteImage = async (path, bucket = STORAGE_BUCKETS.PROFILE_PHOTOS) => {
  const r2AccountId = process.env.EXPO_PUBLIC_R2_ACCOUNT_ID;
  const r2AccessKeyId = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
  const r2SecretAccessKey = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
  const hasR2Creds = r2AccountId && r2AccessKeyId && r2SecretAccessKey;

  if (!hasR2Creds && (__DEV__ || process.env.EXPO_PUBLIC_APP_ENV === 'development')) {
    console.warn('Cloudflare R2 credentials are not set. Skipping mock delete.');
    return;
  }

  const bucketName = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || bucket;
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: path,
  });
  const client = getS3Client();
  await client.send(command);
};

/**
 * Process and upload profile photo (compress + thumbnail + upload)
 */
export const processAndUploadPhoto = async (uri, userId) => {
  // Compress main image
  const compressed = await compressImage(uri);

  // Generate thumbnail
  const thumbnail = await generateThumbnail(uri);

  // Upload both
  const [mainUpload, thumbUpload] = await Promise.all([
    uploadImage(compressed.uri, userId),
    uploadImage(thumbnail.uri, userId),
  ]);

  return {
    storagePath: mainUpload.publicUrl,
    thumbnailPath: thumbUpload.publicUrl,
    mainPath: mainUpload.path,
    thumbPath: thumbUpload.path,
  };
};

export default {
  pickImages,
  takePhoto,
  compressImage,
  generateThumbnail,
  uploadImage,
  deleteImage,
  processAndUploadPhoto,
};
