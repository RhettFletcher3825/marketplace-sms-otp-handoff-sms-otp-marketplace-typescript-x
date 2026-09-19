import { marketplaceLogin } from "../src/marketplace_login";

const phone = process.env.DEMO_PHONE;
if (!phone) throw new Error("Set DEMO_PHONE before running the demo");
const result = await marketplaceLogin({ phone }, { listings: ["video-pack-42"], mediaReady: true });
console.log(result);
