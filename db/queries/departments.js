import db from "../client.js";

export async function createDepartment({ name, description, manager_employee_id }) {
  const sql = `
    INSERT INTO departments (name, description, manager_employee_id)
    VALUES ($1,$2,$3) RETURNING *;
  `;
  const { rows: [dept] } = await db.query(sql, [name, description ?? null, manager_employee_id ?? null]);
  return dept;
}

export async function listDepartments() {
  const { rows } = await db.query(`SELECT * FROM departments ORDER BY name ASC;`);
  return rows;
}

export async function getDepartmentById(id) {
  const { rows: [dept] } = await db.query(`SELECT * FROM departments WHERE id = $1;`, [id]);
  return dept;
}

export async function updateDepartment(id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return getDepartmentById(id);
  const set = keys.map((k,i) => `${k} = $${i+1}`).join(", ");
  const params = keys.map(k => fields[k]);
  params.push(id);
  const sql = `UPDATE departments SET ${set}, updated_at = now() WHERE id = $${params.length} RETURNING *;`;
  const { rows: [dept] } = await db.query(sql, params);
  return dept;
}

export async function deleteDepartment(id) {
  await db.query(`DELETE FROM departments WHERE id = $1;`, [id]);
  return true;
}