import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireBody from "../middleware/requireBody.js";
import handlePostgresErrors from "../middleware/handlePostgresErrors.js";
import validateEmployee from "../middleware/validateEmployee.js";
import db from "../db/client.js";    
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../db/queries/employees.js";

const router = express.Router();

router.use(requireUser);

const EMP_TYPES = new Set(["FT","PT","CONTRACT"]);
const STATUSES  = new Set(["ACTIVE","INACTIVE"]);

function isValidISODate(s) {
  if (typeof s !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

async function validatePatchFields(body) {
  const errors = [];

  if ("employment_type" in body && !EMP_TYPES.has(String(body.employment_type))) {
    errors.push("employment_type must be FT | PT | CONTRACT");
  }
  if ("status" in body && !STATUSES.has(String(body.status))) {
    errors.push("status must be ACTIVE | INACTIVE");
  }
  if ("hire_date" in body && !isValidISODate(body.hire_date)) {
    errors.push("hire_date must be a valid date (YYYY-MM-DD)");
  }
  if ("salary" in body) {
    const n = Number(body.salary);
    if (Number.isNaN(n)) errors.push("salary must be a number");
  }

  if ("department_id" in body && body.department_id != null) {
    const { rows } = await db.query(`SELECT 1 FROM departments WHERE id = $1`, [body.department_id]);
    if (rows.length === 0) errors.push(`department_id ${body.department_id} does not exist`);
  }
  if ("manager_id" in body && body.manager_id != null) {
    const { rows } = await db.query(`SELECT 1 FROM employees WHERE id = $1`, [body.manager_id]);
    if (rows.length === 0) errors.push(`manager_id ${body.manager_id} does not exist`);
  }

  return errors;
}

router.get("/", async (req, res, next) => {
  try {
    const { limit, offset, q, department_id, status } = req.query;
    const parsed = {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      q: q ?? null,
      department_id: department_id ?? null,
      status: status ?? null,
    };
    const { rows, count } = await listEmployees(parsed);
    res.set("X-Total-Count", String(count));
    res.json(rows);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const row = await getEmployee(Number(req.params.id));
    if (!row) return res.status(404).send("Employee not found.");
    res.json(row);
  } catch (e) { next(e); }
});

router.post(
  "/",
  requireBody(["first_name","last_name","email","role_title"]),
   validateEmployee(), 
  async (req, res, next) => {
    try {
      if (req.body.employment_type && !EMP_TYPES.has(req.body.employment_type)) {
        return res.status(400).json({ error: "employment_type must be FT | PT | CONTRACT" });
      }
      if (req.body.status && !STATUSES.has(req.body.status)) {
        return res.status(400).json({ error: "status must be ACTIVE | INACTIVE" });
      }
      if (req.body.hire_date && !isValidISODate(req.body.hire_date)) {
        return res.status(400).json({ error: "hire_date must be a valid date (YYYY-MM-DD)" });
      }
      if ("salary" in req.body && Number.isNaN(Number(req.body.salary))) {
        return res.status(400).json({ error: "salary must be a number" });
      }

      const row = await createEmployee(req.body);
      res.status(201).json(row);
    } catch (e) {
      handlePostgresErrors(e, req, res, next);
    }
  }
);

router.patch("/:id", async (req, res, next) => {
  try {
    const errors = await validatePatchFields(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors[0], errors });

    const row = await updateEmployee(Number(req.params.id), req.body);
    if (!row) return res.status(404).send("Employee not found.");
    res.json(row);
  } catch (e) {
    handlePostgresErrors(e, req, res, next);
  }
});

router.patch(
  "/:id",
  validateEmployee({ allowPartial: true }),
  async (req, res, next) => {
    try {
      const errors = await validatePatchFields(req.body || {});
      if (errors.length) return res.status(400).json({ error: errors[0], errors });

      const row = await updateEmployee(Number(req.params.id), req.body);
      if (!row) return res.status(404).send("Employee not found.");
      res.json(row);
    } catch (e) {
      handlePostgresErrors(e, req, res, next);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    await deleteEmployee(Number(req.params.id));
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;