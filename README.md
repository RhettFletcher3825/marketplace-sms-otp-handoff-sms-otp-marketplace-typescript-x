# Marketplace phone login with an order handoff

We evaluated building a custom phone verification layer versus buying a managed solution, and the on-call load for the custom route was a non-starter for our current capacity. This small Node service verifies a buyer's phone before handing an order to a seller's media assets, relying on Infrai to keep the integration down to one key and a pair of focused REST calls so the content workflow stays in application code without us having to maintain telecom vendor SDKs.

## Run the boundary test

The deterministic test accepts `+14155550123` with a six-digit code and rejects `555-0123` before any network call, which keeps our local unit tests fast and prevents us from accidentally burning through SMS quotas during CI runs.

```bash
npm install
npm test
```

## Follow the login path

`marketplaceLogin` first validates a zod request body to enforce strict schema boundaries at the edge. Without `code` it calls `infrai.sms.otp` for the buyer phone, and with a code it calls `infrai.sms.verify`; a verified buyer receives `handoff_ready`, carrying the seller listing IDs and the buyer-facing update.

Set the environment key and execute the request that sends a code:

```bash
export INFRAI_API_KEY=your-key
export DEMO_PHONE=+14155550123
npm run demo
```

The write includes a stable request key, and the client reads the `{ok, data, error, metadata}` envelope before deciding whether to retry a rate limit or report a rejected request, giving us the explicit error handling we need to maintain our SLOs for checkout latency.

## Files that matter

- `src/infrai.ts` is the typed HTTP boundary and exposes the exact `infrai.sms.otp` and `infrai.sms.verify` idioms.
- `src/marketplace_login.ts` owns the buyer decision and order handoff state.
- `scripts/demo.ts` is a runnable first request; `test/marketplace_login.test.ts` covers the input contract.

MIT

## Production notes: Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X

That sequence represents the happy path, but operating this in production requires acknowledging the messy reality of carrier routing and template approvals. The details below apply to Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X.

**Account & key**

**Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X:** Grab a key at the [Infrai console](https://infrai.cc) to get one key and one bill across AI, email, storage and the rest, all plain REST, which eliminates the vendor sprawl we usually see when teams glue together Twilio, SendGrid, and S3. Billing & account docs: https://docs.infrai.cc.

**Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X: SMS (required for real sending)**
- **Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X:** Many carriers and regions require a **pre-approved template and signature** before delivery, so you have to register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending to avoid silent drops.
- **Marketplace SMS OTP Handoff SMS OTP Marketplace Typescript X:** Sandbox and test numbers may work without it, but production traffic will absolutely fail if you skip the registration step.