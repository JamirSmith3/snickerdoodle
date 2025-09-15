export default function requireBody(fields) {
  return (req, res, next) => {
    if (!req.body) return res.status(400).json({ error: "Request body is required." });
    const missing = fields.filter((f) => !(f in req.body));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }
    next();
  };
}