import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const R2_ACCOUNT_ID = process.env.VITE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.VITE_R2_SECRET_ACCESS_KEY;
// The bucket name used in the API call in index-CCxJ-qBI.js was "matrimony" not "matimony"
const R2_BUCKET_NAME = "matrimony"; 

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const run = async () => {
  try {
    const corsParams = {
      Bucket: R2_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: [
              'http://localhost:5173',
              'http://localhost:8081',
              'https://matrimony-admin-one.vercel.app',
              'https://matrimony-admin-one.vercel.app/',
              '*'
            ],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000
          }
        ]
      }
    };

    console.log('Applying CORS config to bucket:', R2_BUCKET_NAME);
    const command = new PutBucketCorsCommand(corsParams);
    const response = await s3Client.send(command);
    console.log('CORS Configuration Successfully Updated:', response);
  } catch (err) {
    console.error('Error applying CORS:', err);
  }
};

run();
