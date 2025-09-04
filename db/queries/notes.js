import db from "#db/client";

export async function listEmployees({ limit=20, offset=0, q=null, department_id=null, status=null }) {
  const params = [];
  const where = [];

  if (q) {
    params.push(`%${q}%`);
    where.push(`(e.first_name ILIKE $${params.length} OR e.last_name ILIKE $${params.length} OR e.email ILIKE $${params.length})`);
  }
  if (department_id) {
    params.push(Number(department_id));
    where.push(`e.department_id = $${params.length}`);
  }
  if (status) {
    params.push(status.toUpperCase());
    where.push(`e.status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countSql = `SELECT COUNT(*)::int AS count FROM employees e ${whereSql}`;
  const { rows: [{ count }] } = await db.query(countSql, params);

  params.push(limit);
  params.push(offset);
  const sql = `
    SELECT e.*, d.name AS department_name
    FROM employees e
    LEFT JOIN departments d ON d.id = e.department_id
    ${whereSql}
    ORDER BY e.id
    LIMIT $${params.length-1} OFFSET $${params.length}
  `;
  const { rows } = await db.query(sql, params);
  return { rows, count };
}
