// db/client.js
import pg from "pg";

// Require DATABASE_URL
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL (Render → Environment → DATABASE_URL)");
  process.exit(1);
}

/**
 * Force SSL and skip CA verification (self-signed friendly).
 * This is fine for hosted dev/demo DBs. Tighten later with a real CA.
 */
const db = new pg.Client({
  connectionString,
  ssl: { require: true, rejectUnauthorized: false },
});

export default db;
