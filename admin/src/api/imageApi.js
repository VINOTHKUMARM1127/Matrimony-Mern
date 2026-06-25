import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let _s3Client = null;

const getS3Client = () => {
  if (_s3Client) return _s3Client;

  const r2AccountId = import.meta.env.VITE_R2_ACCOUNT_ID;
  const r2AccessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
  const r2SecretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;

  if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey) {
    throw new Error('Cloudflare R2 credentials are missing in .env');
  }

  _s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    },
    forcePathStyle: true,
  });
  return _s3Client;
};

/**
 * Upload an image File object to Cloudflare R2
 */
export const uploadPhotoToR2 = async (userId, file) => {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bucketName = import.meta.env.VITE_R2_BUCKET_NAME || 'matrimony';

  const client = getS3Client();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: file.type || 'image/jpeg',
  });

  await client.send(command);

  const r2PublicDomain = import.meta.env.VITE_R2_PUBLIC_URL || '';
  const publicUrl = `${r2PublicDomain}/${fileName}`;

  return {
    path: fileName,
    publicUrl: publicUrl,
  };
};

/**
 * Delete an image from Cloudflare R2 using its public URL
 */
export const deletePhotoFromR2 = async (publicUrl) => {
  if (!publicUrl) return;

  const r2PublicDomain = import.meta.env.VITE_R2_PUBLIC_URL || '';
  let key = publicUrl;

  // Extract the key from the public URL
  if (r2PublicDomain && publicUrl.startsWith(r2PublicDomain)) {
    key = publicUrl.replace(`${r2PublicDomain}/`, '');
  } else {
    // Fallback: try to extract 'userId/filename' assuming 2 parts at the end
    try {
      const url = new URL(publicUrl);
      const pathParts = url.pathname.split('/');
      if (pathParts.length >= 2) {
        key = `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`;
      }
    } catch (e) {
      console.warn('Could not parse URL for R2 deletion:', publicUrl);
    }
  }

  const bucketName = import.meta.env.VITE_R2_BUCKET_NAME || 'matrimony';
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await client.send(command);
};
