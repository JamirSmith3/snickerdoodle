import db from "#db/client";
import bcrypt from "bcrypt";


export async function createUser(username, password, email = null, role = "USER") {
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (username, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username, email, hashedPassword, role]);
  return user;
}

export async function getUserByUsernameAndPassword(username, password) {
  const sql = `
    SELECT *
    FROM users
    WHERE username = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username]);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;

  return user;
}

export async function getUserById(id) {
  const sql = `
    SELECT *
    FROM users
    WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}
