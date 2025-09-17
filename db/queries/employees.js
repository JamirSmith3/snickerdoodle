import db from "../client.js";

export async function listEmployees({
  limit = 20,
  offset = 0,
  q = undefined,
  department_id = undefined,
  status = undefined,
} = {}) {
  const params = [];
  const where = [];

  if (q) {
    params.push(`%${q}%`);
    where.push(
      `(e.first_name ILIKE $${params.length}
        OR e.last_name ILIKE $${params.length}
        OR e.email ILIKE $${params.length})`
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

  const { rows: [{ count }] } = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM employees e
     ${whereSql}`,
    params
  );

  params.push(limit);
  params.push(offset);

  const { rows } = await db.query(
    `SELECT
        e.*,
        d.name AS department_name,
        (m.first_name || ' ' || m.last_name) AS manager_name
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN employees   m ON m.id = e.manager_id
     ${whereSql}
     ORDER BY e.last_name, e.first_name
     LIMIT $${params.length - 1} OFFSET $${params.length};`,
    params
  );

  return { rows, count };
}

export async function getEmployee(id) {
  const { rows } = await db.query(
    `SELECT
        e.*,
        d.name AS department_name,
        (m.first_name || ' ' || m.last_name) AS manager_name
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN employees   m ON m.id = e.manager_id
     WHERE e.id = $1;`,
    [id]
  );
  return rows[0] || null;
}

export async function createEmployee(payload) {
  const cols = [
    "first_name","last_name","email","role_title","department_id",
    "status","employment_type","location","hire_date","salary","manager_id"
  ];
  const vals = cols.map((_, i) => `$${i + 1}`);
  const args = cols.map((k) => payload[k] ?? null);

  const { rows } = await db.query(
    `INSERT INTO employees (${cols.join(",")})
     VALUES (${vals.join(",")})
     RETURNING *;`,
    args
  );
  return rows[0];
}

export async function updateEmployee(id, patch) {
  const keys = Object.keys(patch);
  if (keys.length === 0) {
    const { rows } = await db.query(`SELECT * FROM employees WHERE id=$1`, [id]);
    return rows[0] || null;
  }
  const sets = keys.map((k, i) => `${k}=$${i + 1}`);
  const args = keys.map((k) => patch[k]);
  args.push(id);

  const { rows } = await db.query(
    `UPDATE employees SET ${sets.join(", ")} WHERE id=$${args.length} RETURNING *;`,
    args
  );
  return rows[0] || null;
}

export async function deleteEmployee(id) {
  await db.query(`DELETE FROM employees WHERE id=$1`, [id]);
}
