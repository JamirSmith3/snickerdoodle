// app.js
import express from "express";
const app = express();
export default app;

import departmentsRouter from "#api/departments";

import usersRouter from "#api/users";
import employeesRouter from "#api/employees";
import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import cors from "cors";
import morgan from "morgan";

app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(getUserFromToken);              // 👈 must be BEFORE protected routers

app.get("/", (req, res) => res.send("Hello, World!"));

app.use("/users", usersRouter);         // public (login/register)
app.use("/employees", employeesRouter); // protected
app.use("/departments", departmentsRouter); // protected

app.use(handlePostgresErrors);

// Final catch-all (JSON)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const msg = err.message || "Sorry! Something went wrong.";
  res.status(status).json({ error: msg });
});