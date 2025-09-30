import type { NextApiRequest, NextApiResponse } from "next";
import { getUploadUrl } from "../../lib/s3";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { key, contentType } = req.body;
  if (!key || !contentType) return res.status(400).json({ error: "Missing key or contentType" });

  const url = await getUploadUrl(key, contentType);
  res.json({ url });
}