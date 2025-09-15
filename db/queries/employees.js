// db/queries/employees.js
import db from "#db/client";

export async function listEmployees({ limit = 20, offset = 0, q = null, department_id = null, status = null } = {}) {
  const params = [];
  const where = [];

  if (q) {
    params.push(`%${q}%`);
    where.push(
      `(e.first_name ILIKE $${params.length} OR e.last_name ILIKE $${params.length} OR e.email ILIKE $${params.length})`
    );
  }
  if (department_id) {
    params.push(Number(department_id));
    where.push(`e.department_id = $${params.length}`);
  }
  if (status) {
    params.push(String(status).toUpperCase());
    where.push(`e.status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // count
  const countSql = `SELECT COUNT(*)::int AS count FROM employees e ${whereSql};`;
  const { rows: [{ count }] } = await db.query(countSql, params);

  // data
  params.push(limit);
  params.push(offset);
  const sql = `
    SELECT e.*, d.name AS department_name
    FROM employees e
    LEFT JOIN departments d ON d.id = e.department_id
    ${whereSql}
    ORDER BY e.last_name, e.first_name
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const { rows } = await db.query(sql, params);
  return { rows, count };
}

export async function getEmployee(id) {
  const { rows: [row] } = await db.query(
    `SELECT e.*, d.name AS department_name
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE e.id = $1`,
    [id]
  );
  return row;
}

export async function createEmployee(payload) {
  const cols = [
    "first_name","last_name","email","department_id","manager_id","role_title",
    "employment_type","status","location","hire_date","salary"
  ];
  const values = cols.map((_, i) => `$${i + 1}`);
  const params = cols.map(c => payload[c] ?? null);
  const sql = `
    INSERT INTO employees (${cols.join(",")})
    VALUES (${values.join(",")})
    RETURNING *;
  `;
  const { rows: [row] } = await db.query(sql, params);
  return row;
}

export async function updateEmployee(id, patch) {
  const keys = Object.keys(patch);
  if (keys.length === 0) return getEmployee(id);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const params = keys.map(k => patch[k]);
  params.push(id);
  const { rows: [row] } = await db.query(
    `UPDATE employees SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  return row;
}

export async function deleteEmployee(id) {
  await db.query(`DELETE FROM employees WHERE id = $1`, [id]);
  return { ok: true };
}