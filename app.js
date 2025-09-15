// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";

import usersRouter from "#api/users";
import employeesRouter from "#api/employees";
import departmentsRouter from "#api/departments";

const app = express();
export default app;

/**
 * CORS
 * - Permissive by default for smooth dev: allows ANY origin.
 * - If you set CORS_ORIGIN (string or regex), it will honor that.
 *   - Set CORS_ORIGIN="*" or leave unset for "allow all".
 */
const rawOrigin = (process.env.CORS_ORIGIN ?? "*").trim();
const corsOptions = {
  origin:
    rawOrigin === "*" ? true :
    rawOrigin.toLowerCase() === "any" ? true :
    rawOrigin,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach req.user when Authorization header is present
app.use(getUserFromToken);

app.get("/", (req, res) => res.send("OK"));

/** Routes */
app.use("/users", usersRouter);          // public (login/register)
app.use("/employees", employeesRouter);  // protected
app.use("/departments", departmentsRouter); // protected

app.use(handlePostgresErrors);

/** Final JSON error / 404 */
app.use((req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const msg = err.message || "Sorry! Something went wrong.";
  res.status(status).json({ error: msg });
});
