import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, name } = req.body;
  if (!userId || !name) return res.status(400).json({ error: "Missing data" });

  const playlist = await prisma.playlist.create({
    data: { name, userId },
  });

  res.json(playlist);
}