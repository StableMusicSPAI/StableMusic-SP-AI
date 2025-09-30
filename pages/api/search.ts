import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  if (!q || typeof q !== "string") return res.status(400).json({ error: "Missing query" });

  const tracks = await prisma.track.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    take: 20
  });

  res.json(tracks);
}