import type { NextApiRequest, NextApiResponse } from "next";
import { getPlaybackUrl } from "../../lib/s3";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;
  if (!key || typeof key !== "string") return res.status(400).json({ error: "Missing key" });

  const url = await getPlaybackUrl(key);
  res.json({ url });
}