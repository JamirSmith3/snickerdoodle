import express from "express";
import { createUser, getUserByUsernameAndPassword } from "../db/queries/users.js";
import requireBody from "../middleware/requireBody.js";
import { createToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/register", requireBody(["username", "password"]), async (req, res) => {
  const { username, password } = req.body;
  const user = await createUser(username, password);

  const token = createToken({ id: user.id });
  res.status(201).send(token);
});

router.post("/login", requireBody(["username", "password"]), async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserByUsernameAndPassword(username, password);
  if (!user) return res.status(401).send("Invalid username or password.");

  const token = createToken({ id: user.id });
  res.send(token);
});

export default router;
