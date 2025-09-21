import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireBody from "../middleware/requireBody.js";        
import handlePostgresErrors from "../middleware/handlePostgresErrors.js"; 
import {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../db/queries/departments.js";

const router = express.Router();
export default router;

router.use(requireUser);

router.get("/", async (req, res, next) => {
  try {
    const rows = await listDepartments();
    res.json(rows);
  } catch (e) { next(e); }
});

router.post("/", requireBody(["name"]), async (req, res, next) => {
  try {
    const dept = await createDepartment(req.body);
    res.status(201).json(dept);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const dept = await getDepartmentById(req.params.id);
    if (!dept) return res.status(404).send("Not found");
    res.json(dept);
  } catch (e) { next(e); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const dept = await updateDepartment(req.params.id, req.body);
    res.json(dept);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await deleteDepartment(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
});
