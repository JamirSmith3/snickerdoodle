// db/client.js
import pg from "pg";

const url = process.env.DATABASE_URL || "";
const options = { connectionString: url };

// Decide when to use SSL
const needSSL =
  /\bssl=true\b/i.test(url) ||                  // ?ssl=true
  /\bsslmode=require\b/i.test(url) ||           // ?sslmode=require
  process.env.RENDER ||                         // running on Render
  process.env.NODE_ENV === "production";        // prod envs

if (needSSL) {
  // For managed DBs with self-signed certs, skip CA verification
  options.ssl = { rejectUnauthorized: false };
}

const db = new pg.Client(options);
export default db;
