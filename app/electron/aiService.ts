import OpenAI from "openai";

export async function askPhoneDockAI(command: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "PhoneDock AI is unavailable because no API key is configured."
    );
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: [
      {
        role: "system",
        content: `
You are PhoneDock AI.

Convert natural-language phone commands into allowed PhoneDock actions.

Allowed actions:
- HOME
- BACK
- RECENT
- VOLUME_UP
- VOLUME_DOWN
- MUTE
- LOCK

Return ONLY valid JSON in this format:
{"actions":["HOME"]}

Never return shell commands.
Never invent actions.
Never explain anything outside the JSON.
`,
      },
      {
        role: "user",
        content: command,
      },
    ],
  });

  return response.output_text;
}