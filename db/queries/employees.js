import db from "#db/client";

export async function listEmployees({ search = "", limit = 50, offset = 0 } = {}) {
  const params = [];
  let where = "";
  if (search) {
    params.push(`%${search}%`);
    where = `WHERE (e.first_name || ' ' || e.last_name ILIKE $${params.length}
             OR e.email ILIKE $${params.length})`;
  }
  params.push(limit, offset);
  const sql = `
    SELECT e.*, d.name AS department_name
    FROM employees e
    LEFT JOIN departments d ON d.id = e.department_id
    ${where}
    ORDER BY e.last_name, e.first_name
    LIMIT $${params.length-1} OFFSET $${params.length};
  `;
  const { rows } = await db.query(sql, params);
  return rows;
}

export async function getEmployee(id) {
  const { rows: [row] } = await db.query(
    `SELECT e.*, d.name AS department_name
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE e.id = $1`, [id]
  );
  return row;
}

export async function createEmployee(payload) {
  const cols = [
    "first_name","last_name","email","department_id","manager_id","role_title",
    "employment_type","status","location","hire_date","salary"
  ];
  const values = cols.map((c,i)=> `$${i+1}`);
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
  const sets = keys.map((k,i)=> `${k} = $${i+1}`);
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
