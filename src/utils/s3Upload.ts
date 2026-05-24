import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import crypto from 'crypto';

const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;

/**
 * Uploads a buffer to S3 and returns the public URL.
 * @param buffer   File contents
 * @param mimeType MIME type (e.g. 'image/jpeg')
 * @param folder   S3 key prefix (e.g. 'avatars', 'task-media')
 * @param originalName  Original filename (used for extension)
 */
export async function uploadToS3(
  buffer: Buffer,
  mimeType: string,
  folder: string,
  originalName: string,
): Promise<string> {
  const ext = path.extname(originalName) || '';
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  return `https://${BUCKET}.s3.eu-north-1.amazonaws.com/${key}`;
}
