import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  listDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment
} from "#db/queries/departments";

router.get("/", requireUser, async (req, res) => {
  const rows = await listDepartments();
  res.send(rows);
});

router.post("/", requireUser, requireBody(["name"]), async (req, res) => {
  const dept = await createDepartment(req.body);
  res.status(201).send(dept);
});

router.get("/:id", requireUser, async (req, res) => {
  const dept = await getDepartmentById(req.params.id);
  if (!dept) return res.status(404).send("Not found");
  res.send(dept);
});

router.patch("/:id", requireUser, async (req, res) => {
  const dept = await updateDepartment(req.params.id, req.body);
  res.send(dept);
});

router.delete("/:id", requireUser, async (req, res) => {
  await deleteDepartment(req.params.id);
  res.status(204).end();
});
