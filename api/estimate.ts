import fs from "fs/promises";
import path from "path";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { name, phone, email, location, projectType, timeline, details } =
    req.body ?? {};

  if (!name || !phone || !location || !projectType || !details) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  const submission = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    name,
    phone,
    email: email || "",
    location,
    projectType,
    timeline: timeline || "",
    details,
  };

  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "estimate-requests.ndjson");

  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(submission)}\n`, "utf8");

  return res.status(200).json({
    ok: true,
    message: "Estimate request received",
  });
}
