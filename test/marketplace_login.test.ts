import assert from "node:assert/strict";
import { loginBody } from "../src/marketplace_login";

const parsed = loginBody.safeParse({ phone: "+14155550123", code: "123456" });
assert.equal(parsed.success, true);
assert.equal(loginBody.safeParse({ phone: "555-0123" }).success, false);
console.log("login request boundary checks passed");
