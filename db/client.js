// db/client.js
import pg from "pg";

/**
 * Force SSL and skip CA verification for hosted Postgres
 * (Render/bit.io/Neon often use self-signed certs).
 * This is safe for demo/staging; tighten later if you add a trusted CA.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL (set it in Render → Environment)");
  process.exit(1);
}

const db = new pg.Client({
  connectionString,
  ssl: { require: true, rejectUnauthorized: false },
});

export default db;
