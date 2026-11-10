import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || 'alfa-dashboard';
const PUBLIC_URL = process.env.S3_PUBLIC_URL;

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimeType: string,
  userId: string
): Promise<{ url: string; key: string }> {
  const key = `${userId}/${uuidv4()}-${filename}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: mimeType,
    })
  );
  const url = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `/api/files/${key}`;
  return { url, key };
}

export async function getPresignedUploadUrl(
  filename: string,
  mimeType: string,
  userId: string
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const key = `${userId}/${uuidv4()}-${filename}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicUrl = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `/api/files/${key}`;
  return { uploadUrl, key, publicUrl };
}

export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}