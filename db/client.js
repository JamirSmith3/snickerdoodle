// db/client.js
import pg from "pg";

// Always read the URL from env
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL (Render → Environment → DATABASE_URL)");
  process.exit(1);
}

// Unconditionally enable SSL but *don't* verify CA.
// This is safe for hosted dev/demo DBs and avoids self-signed cert issues.
const db = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false, require: true }
});

export default db;
