import "server-only";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

type Model = { name: string; supportedGenerationMethods?: string[] };

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

/** Ask Gemini for a JSON answer. Tries the next model when one is unavailable on this key's tier. */
export async function generateJson(prompt: string, file?: { mimeType: string; base64: string }): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in Vercel.");
  let last = "no model available";
  for (const model of await candidates(key)) {
    const res = await fetch(`${BASE}/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [...(file ? [{ inline_data: { mime_type: file.mimeType, data: file.base64 } }] : []), { text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }),
      signal: AbortSignal.timeout(file ? 120000 : 60000),
    });
    if (!res.ok) { last = `${model} returned ${res.status}`; continue; }
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
    try { return JSON.parse(text); } catch { last = `${model} returned invalid JSON`; }
  }
  throw new Error(`Gemini: ${last}`);
}
