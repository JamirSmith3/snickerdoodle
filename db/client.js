// db/client.js
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL (Render → Environment)");
  process.exit(1);
}

const db = new pg.Client({
  connectionString,
  // Force SSL, never verify CA (self-signed friendly)
  ssl: { require: true, rejectUnauthorized: false },
});

export default db;
