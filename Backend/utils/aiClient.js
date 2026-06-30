// ---------------------------------------------------------------------------
// Gemini LLM client
// ---------------------------------------------------------------------------
// This is an OPTIONAL upgrade. If no GEMINI_API_KEY is configured (or a call
// fails / times out) the AI routes fall back to a deterministic rule-based
// engine, so the features always work out of the box.
//
// Set in Backend/.env:
//   GEMINI_API_KEY=your_key_here
//   GEMINI_MODEL=gemini-2.0-flash        (optional)
// ---------------------------------------------------------------------------

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.AI_API_KEY ||
    '';

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-2.0-flash';

const GEMINI_BASE = (
    process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
).replace(/\/$/, '');

const REQUEST_TIMEOUT_MS = 12000;

export const isLLMConfigured = () => Boolean(GEMINI_API_KEY);
export const llmProvider = () => (GEMINI_API_KEY ? `gemini:${GEMINI_MODEL}` : 'rules');

/**
 * Call Gemini's generateContent endpoint.
 * @returns parsed JSON object (json:true) | string (json:false) | null on failure
 */
export async function callLLM({
    system,
    user,
    json = false,
    maxTokens = 400,
    temperature = 0.2,
}) {
    if (!GEMINI_API_KEY) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const url = `${GEMINI_BASE}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${GEMINI_API_KEY}`;

        const body = {
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { temperature, maxOutputTokens: maxTokens },
        };
        if (system) body.system_instruction = { parts: [{ text: system }] };
        if (json) body.generationConfig.responseMimeType = 'application/json';

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        if (!res.ok) {
            const detail = await res.text().catch(() => '');
            console.error('Gemini request failed:', res.status, detail.slice(0, 300));
            return null;
        }

        const data = await res.json();
        const text =
            data?.candidates?.[0]?.content?.parts
                ?.map((p) => p.text)
                .filter(Boolean)
                .join('') || '';

        if (!text.trim()) return null;
        if (!json) return text.trim();

        // JSON mode: strip accidental code fences, then parse (with a fallback
        // that extracts the first {...} block if the model added stray text).
        const cleaned = text
            .trim()
            .replace(/^```(?:json)?/i, '')
            .replace(/```$/, '')
            .trim();

        try {
            return JSON.parse(cleaned);
        } catch {
            const match = cleaned.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch {
                    /* fall through */
                }
            }
            return null;
        }
    } catch (err) {
        if (err.name === 'AbortError') console.error('Gemini request timed out');
        else console.error('Gemini error:', err.message);
        return null;
    } finally {
        clearTimeout(timer);
    }
}
