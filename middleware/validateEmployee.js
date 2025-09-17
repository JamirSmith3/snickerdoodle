const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUSES = new Set(["ACTIVE", "INACTIVE"]);
const TYPES = new Set(["FT", "PT", "CONTRACT"]);

function isEmpty(v) { return v === undefined || v === null || v === ""; }
function isInt(n) { return Number.isInteger(n); }
function isValidDate(s) { return !isEmpty(s) ? !isNaN(Date.parse(s)) : true; }

export default function validateEmployee({ allowPartial = false } = {}) {
  return (req, res, next) => {
    const b = req.body || {};
    const errors = {};

    const check = (key, fn) => {
      if (allowPartial && !(key in b)) return;
      const ok = fn(b[key]);
      if (!ok) errors[key] = true;
    };

    check("first_name", v => !isEmpty(v) && String(v).trim().length > 0);
    check("last_name", v => !isEmpty(v) && String(v).trim().length > 0);
    check("email", v => !isEmpty(v) && EMAIL_RE.test(String(v)));
    check("role_title", v => !isEmpty(v) && String(v).trim().length > 0);

    check("status", v => isEmpty(v) || STATUSES.has(String(v).toUpperCase()));
    check("employment_type", v => isEmpty(v) || TYPES.has(String(v).toUpperCase()));

    check("department_id", v => isEmpty(v) || isInt(Number(v)));
    check("manager_id", v => isEmpty(v) || (isInt(Number(v)) && Number(v) >= 1));

    check("salary", v => {
      if (isEmpty(v)) return true;
      const n = Number(v);
      return !Number.isNaN(n) && n > 0;
    });

    check("hire_date", v => isValidDate(v));

    if (Object.keys(errors).length) {
      return res.status(400).json({ error: "Invalid input", fields: errors });
    }
    if (!isEmpty(b.department_id)) req.body.department_id = Number(b.department_id);
    if (!isEmpty(b.manager_id)) req.body.manager_id = Number(b.manager_id);
    if (!isEmpty(b.salary)) req.body.salary = Number(b.salary);
    if (!isEmpty(b.status)) req.body.status = String(b.status).toUpperCase();
    if (!isEmpty(b.employment_type)) req.body.employment_type = String(b.employment_type).toUpperCase();

    next();
  };
}
