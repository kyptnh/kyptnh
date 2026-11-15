import "server-only";

const BASE = "https://generativelanguage.googleapis.com/v1beta";
type Model = { name: string; supportedGenerationMethods?: string[] };
type FilePart = { mimeType: string; base64: string };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Candidate text models, newest stable Flash first. Override with GEMINI_MODEL (e.g. "gemini-2.5-flash"). */
async function candidates(key: string): Promise<string[]> {
  if (process.env.GEMINI_MODEL) return [`models/${process.env.GEMINI_MODEL.replace(/^models\//, "")}`];
  const res = await fetch(`${BASE}/models?pageSize=200`, { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Gemini: could not list models (${res.status})`);
  const models = ((await res.json()).models ?? []) as Model[];
  const version = (n: string) => Number(/gemini-(\d+(?:\.\d+)?)/.exec(n)?.[1] ?? 0);
  return models
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent") && /^models\/gemini-[\d.]+-flash(-lite)?$/.test(m.name))
    .sort((a, b) => version(b.name) - version(a.name) || a.name.length - b.name.length)
    .map((m) => m.name)
    .slice(0, 4);
}

/**
 * One Gemini answer as text. A busy or rate-limited model is retried once after a pause;
 * a model that is unavailable on this key's tier is skipped for the next one.
 */
async function generate(prompt: string, json: boolean, file?: FilePart): Promise<{ text: string; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in Vercel.");
  let last = "no model available";
  for (const model of await candidates(key)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await fetch(`${BASE}/${model}:generateContent`, {
          method: "POST",
          headers: { "x-goog-api-key": key, "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [...(file ? [{ inline_data: { mime_type: file.mimeType, data: file.base64 } }] : []), { text: prompt }] }],
            generationConfig: { temperature: 0.2, ...(json ? { responseMimeType: "application/json" } : {}) },
          }),
          signal: AbortSignal.timeout(file ? 120000 : 75000),
        });
      } catch {
        last = `${model} did not answer in time`;
        break;
      }
      if (res.status === 429 || res.status === 503) {
        last = res.status === 429 ? `${model} is rate-limited on the free tier` : `${model} is overloaded`;
        if (attempt === 0) { await sleep(12000); continue; }
        break;
      }
      if (!res.ok) { last = `${model} returned ${res.status}`; break; }
      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
      if (text.trim()) return { text, model };
      last = `${model} returned an empty answer`;
      break;
    }
  }
  throw new Error(`Gemini: ${last}`);
}

export async function generateJson(prompt: string, file?: FilePart): Promise<unknown> {
  const { text, model } = await generate(prompt, true, file);
  try { return JSON.parse(text); } catch { throw new Error(`Gemini: ${model} returned invalid JSON`); }
}

export async function generateText(prompt: string): Promise<string> {
  return (await generate(prompt, false)).text.trim();
}
