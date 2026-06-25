/**
 * Wedring Backend — Cloudflare R2 S3-Compatible Client
 *
 * Uses forcePathStyle: true to match the existing app's R2 client pattern
 * and avoid SigV4 virtual-hosted signing issues.
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import env from './env.js';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export { r2Client, PutObjectCommand, DeleteObjectCommand };
export default r2Client;
