// db/client.js
import pg from "pg";

const url = process.env.DATABASE_URL || "";
const sslmode = (process.env.PGSSLMODE || "").toLowerCase();

// Enable SSL when we're on Render/production or when the URL/vars request it.
// If the cert is self-signed, skip CA verification (no-verify).
const needSSL =
  /\bssl=true\b/i.test(url) ||
  /\bsslmode=require\b/i.test(url) ||
  sslmode === "require" ||
  sslmode === "no-verify" ||
  process.env.RENDER ||                      // Render sets this
  process.env.NODE_ENV === "production";

const allowSelfSigned =
  sslmode === "no-verify" ||
  /\bsslmode=no-verify\b/i.test(url) ||
  needSSL;                                   // default to allowing on Render

const options = {
  connectionString: url,
  ...(needSSL ? { ssl: { rejectUnauthorized: !allowSelfSigned ? true : false } } : {})
};

// Force “no-verify” behavior on Render/hosted DBs
if (needSSL) options.ssl = { rejectUnauthorized: false };

const db = new pg.Client(options);
export default db;
