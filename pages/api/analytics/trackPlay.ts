import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { trackId, userId } = req.body;

  await prisma.trackPlay.create({
    data: { trackId, userId },
  });

  res.json({ ok: true });
}