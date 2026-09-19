import { z } from "zod";
import { infrai } from "./infrai";

export const loginBody = z.object({ phone: z.string().regex(/^\+[1-9]\d{7,14}$/), code: z.string().regex(/^\d{4,8}$/).optional() });
type Assets = { listings: string[]; mediaReady: boolean };
export type LoginResult = { state: "code_sent" | "handoff_ready"; buyerPhone: string; sellerAssets: Assets; buyerUpdate: string };

export async function marketplaceLogin(input: unknown, assets: Assets): Promise<LoginResult> {
  const body = loginBody.parse(input);
  if (!body.code) {
    await infrai.sms.otp(body.phone, { "Idempotency-Key": `marketplace-login:${body.phone}` });
    return { state: "code_sent", buyerPhone: body.phone, sellerAssets: assets, buyerUpdate: "Verification code sent" };
  }
  const result = await infrai.sms.verify(body.phone, body.code);
  if (result.verified !== true) throw new Error("code was not verified");
  return { state: "handoff_ready", buyerPhone: body.phone, sellerAssets: assets, buyerUpdate: "Buyer verified; order handoff ready" };
}
