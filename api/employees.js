import express from "express";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "#db/queries/employees";

const router = express.Router();

router.use(requireUser);

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
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const row = await getEmployee(Number(req.params.id));
    if (!row) return res.status(404).send("Employee not found.");
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.post(
  "/",
  requireBody(["first_name", "last_name", "email"]),
  async (req, res, next) => {
    try {
      const row = await createEmployee(req.body);
      res.status(201).json(row);
    } catch (e) {
      handlePostgresErrors(e, req, res, next);
    }
  }
);

router.patch("/:id", async (req, res, next) => {
  try {
    const row = await updateEmployee(Number(req.params.id), req.body);
    if (!row) return res.status(404).send("Employee not found.");
    res.json(row);
  } catch (e) {
    handlePostgresErrors(e, req, res, next);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await deleteEmployee(Number(req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
