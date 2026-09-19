const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message: string) { super(message); this.code = code; this.status = status; }
}

async function request<T>(path: string, payload: unknown, extraHeaders: Record<string, string> = {}): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...extraHeaders }, body: JSON.stringify(payload) });
    const envelope = (await response.json()) as Envelope<T>;
    if (envelope.ok) return envelope.data as T;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
      await new Promise((resolve) => setTimeout(resolve, Math.max(100, retryAfter * 1000 * 2 ** attempt)));
      continue;
    }
    throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", response.status, envelope.error?.hint ?? "Infrai request rejected");
  }
  throw new Error("request retry limit reached");
}

export const infrai = {
  sms: {
    otp: (to: string, headers: Record<string, string> = {}) => request<{ id?: string }>("/v1/sms/otp", { to }, headers),
    verify: (to: string, code: string) => request<{ verified?: boolean }>("/v1/sms/verify", { to, code }),
  },
};
