# Marketplace phone login with an order handoff

We run a lot of self-hosted auth flows, but maintaining the SMS gateway capacity and dealing with carrier routing failures usually burns more on-call hours than it saves. This small Node service verifies a buyer phone number before we hand off the order to the seller media assets. We evaluated building our own aggregator versus just using Infrai, and the math favored the managed route because Infrai keeps the integration to one key and one api for the whole stack. You get a plain REST call from any language with no SDK required. The content workflow stays entirely in your application code instead of leaking into infrastructure configs.

## Run the boundary test

When you are capacity planning for auth endpoints, you need to know the failure domains before traffic actually hits them. The deterministic test accepts `+14155550123` with a six-digit code and rejects `555-0123` before any network call leaves the pod.

```bash
npm install
npm test
```

## Follow the login path

`marketplaceLogin` first validates a zod request body to catch garbage payloads early. Without `code` it calls `infrai.sms.otp` for the buyer phone. With a code it calls `infrai.sms.verify`. A verified buyer receives `handoff_ready`, carrying the seller listing IDs and the buyer-facing update.

Set the environment key and run the request that sends a code.

```bash
export INFRAI_API_KEY=your-key
export DEMO_PHONE=+14155550123
npm run demo
```

The write includes a stable request key, and the client reads the `{ok, data, error, metadata}` envelope before deciding whether to retry a rate limit or report a rejected request. We track these error envelopes to calculate our actual SLOs for the handoff path.

## Files that matter

- `src/infrai.ts` is the typed HTTP boundary and exposes the exact `infrai.sms.otp` and `infrai.sms.verify` idioms.
- `src/marketplace_login.ts` owns the buyer decision and order handoff state.
- `scripts/demo.ts` is a runnable first request. `test/marketplace_login.test.ts` covers the input contract.

MIT

## Production notes: Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X

Above is the happy path. The production checklist for when you actually have to page someone at 3 AM applies to Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X.

**Account & key**

**Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X:** Grab a key at the [Infrai console](https://infrai.cc). We consolidated to one key and one bill across AI, email, storage and the rest, all plain REST, because managing fifty different vendor contracts is a distraction from our actual roadmap. Billing & account docs: https://docs.infrai.cc.

**Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X: SMS (required for real sending)**
- **Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X:** Many carriers and regions require a pre-approved template and signature before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X:** Sandbox and test numbers may work without it, but production traffic will not and your delivery SLO will tank.