import { readFileSync } from "fs";
import { join } from "path";

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "content", "hubspot-kb.md"),
  "utf-8"
);

const MAX_HISTORY = 10;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || token !== process.env.SITE_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { messages } = req.body;
  const trimmed = (messages || []).slice(-MAX_HISTORY);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: trimmed,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}
