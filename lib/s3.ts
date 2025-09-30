import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function getUploadUrl(key: string, contentType: string, expires = 300) {
  const cmd = new PutObjectCommand({
    Bucket: process.env.AUDIO_BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn: expires });
}

export async function getPlaybackUrl(key: string, expires = 300) {
  const cmd = new GetObjectCommand({
    Bucket: process.env.AUDIO_BUCKET!,
    Key: key,
  });
  return getSignedUrl(s3, cmd, { expiresIn: expires });
}