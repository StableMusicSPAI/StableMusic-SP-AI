import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";

export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return await getServerSession(req, res, {});
}