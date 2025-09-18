import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";

import getUserFromToken from "./middleware/getUserFromToken.js";
import handlePostgresErrors from "./middleware/handlePostgresErrors.js";

import usersRouter from "./api/users.js";
import employeesRouter from "./api/employees.js";
import departmentsRouter from "./api/departments.js";

const app = express();
export default app;

/* ----------------------------- CORS (dev-friendly) ----------------------------- */
const stripQuotes = (s) => s.replace(/^['"]|['"]$/g, "");
const raw = (process.env.CORS_ORIGIN ?? "").trim();
const cfg = stripQuotes(raw);

const isLocalhost = (o) =>
  /^http:\/\/localhost(:\d+)?$/.test(o) ||
  /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(o) ||
  /^http:\/\/0\.0\.0\.0(:\d+)?$/.test(o);

const origin = (reqOrigin, cb) => {
  if (!reqOrigin) return cb(null, true);
  if (!cfg && isLocalhost(reqOrigin)) return cb(null, true);

  const lc = cfg.toLowerCase();
  if (lc === "*" || lc === "any") return cb(null, true);

  if (cfg.startsWith("/") && cfg.endsWith("/")) {
    try {
      const body = cfg.slice(1, -1);
      const m = body.match(/^(.*?)(?:\/([a-z]*))?$/i);
      const pattern = m ? m[1] : body;
      const flags = m ? m[2] : "";
      const re = new RegExp(pattern, flags);
      return cb(null, re.test(reqOrigin));
    } catch {
      return cb(new Error("Invalid CORS_ORIGIN regex"));
    }
  }

  if (cfg) {
    const list = cfg.split(",").map((s) => stripQuotes(s.trim())).filter(Boolean);
    if (list.includes(reqOrigin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  }

  return cb(new Error("Not allowed by CORS"));
};

const corsOptions = {
  origin,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach req.user when Authorization header is present
app.use(getUserFromToken);

// Healthcheck
app.get("/", (req, res) => res.send("OK"));

/* --------------------------------- API routes -------------------------------- */
app.use("/users", usersRouter);
app.use("/employees", employeesRouter);
app.use("/departments", departmentsRouter);

/* -------------------------- DB / PG error normalizer ------------------------- */
app.use(handlePostgresErrors);

/* -------------------- Serve React build (one-service deploy) ------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname, "ems-ui", "dist");
app.use(express.static(clientDir));

// Only catch non-API GETs and send index.html
app.get(/^(?!\/(users|employees|departments)\b).*/, (req, res, next) => {
  res.sendFile(path.join(clientDir, "index.html"), (err) => {
    if (err) next(); // fall through if dist is missing
  });
});

/* ------------------------------ Final handlers ------------------------------ */
app.use((req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const msg = err.message || "Sorry! Something went wrong.";
  res.status(status).json({ error: msg });
});
