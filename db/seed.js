import db from "../db/client.js";
import { createUser } from "../db/queries/users.js";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CITIES = ["Chicago", "Austin", "Seattle", "New York", "Denver", "San Jose", "Remote"];
const EMPLOYMENT_TYPES = ["FT", "PT", "CONTRACT"]; 
const STATUSES = ["ACTIVE", "INACTIVE"]; 

const DEPARTMENTS = [
  { name: "Engineering", description: "Software and platform" },
  { name: "Human Resources", description: "People operations" },
  { name: "Finance", description: "Accounting and FP&A" },
  { name: "Sales", description: "Revenue and accounts" },
  { name: "Support", description: "Customer support" },
  { name: "Operations", description: "Business ops & IT" },
];

const FIRST_NAMES = [
  "Jane","John","Ana","Sam","Kim","Ivy","Liam","Noah","Emma","Olivia",
  "Mason","Ava","Sophia","Isabella","Lucas","Mia","Ethan","Amelia","Logan","Harper"
];
const LAST_NAMES = [
  "Smith","Doe","Ruiz","Lee","Park","Chen","Garcia","Johnson","Brown","Davis",
  "Martinez","Miller","Wilson","Taylor","Anderson","Thomas","Moore","Jackson","White","Harris"
];

const TITLES = {
  Engineering: ["Frontend Developer", "Backend Developer", "Fullstack Developer", "DevOps Engineer", "QA Engineer", "SRE", "Engineering Manager", "Data Engineer"],
  "Human Resources": ["HR Generalist", "Recruiter", "HRBP", "People Ops Specialist"],
  Finance: ["Accountant", "Financial Analyst", "AP/AR Specialist", "Payroll Specialist"],
  Sales: ["Account Executive", "SDR", "Sales Manager", "Solutions Consultant"],
  Support: ["Support Specialist", "Support Lead", "Technical Support Engineer"],
  Operations: ["IT Specialist", "Office Manager", "Operations Analyst", "Procurement Specialist"]
};

await db.connect();

try {
  await db.query("BEGIN");

  await db.query(`TRUNCATE notes RESTART IDENTITY CASCADE;`);
  await db.query(`TRUNCATE employees RESTART IDENTITY CASCADE;`);
  await db.query(`TRUNCATE departments RESTART IDENTITY CASCADE;`);

  const deptIds = {};
  for (const d of DEPARTMENTS) {
    const { rows } = await db.query(
      `INSERT INTO departments (name, description) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
       RETURNING id, name;`,
      [d.name, d.description]
    );
    deptIds[rows[0].name] = rows[0].id;
  }

  let adminUserId;
  {
    const { rows } = await db.query(`SELECT id FROM users WHERE username = 'admin'`);
    if (rows.length) {
      adminUserId = rows[0].id;
    } else {
      const admin = await createUser("admin", "admin123");
      await db.query(`UPDATE users SET role = 'ADMIN' WHERE id = $1;`, [admin.id]);
      adminUserId = admin.id;
    }
  }

  const managerEmails = ["ivy.manager@example.com", "lee.manager@example.com", "kim.manager@example.com"];
  const managerIds = [];

  for (let i = 0; i < managerEmails.length; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const deptName = pick(Object.keys(deptIds));
    const title = "Manager";
    const employmentType = "FT";
    const status = "ACTIVE";
    const location = pick(CITIES);
    const salary = randInt(120000, 180000);
    const hireDate = new Date(randInt(2017, 2023), randInt(0, 11), randInt(1, 28)); // yyyy, m, d

    const { rows } = await db.query(
      `INSERT INTO employees
        (first_name, last_name, email, phone, department_id, manager_id, role_title, employment_type, status, location, hire_date, salary)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (email) DO NOTHING
       RETURNING id;`,
      [
        first,
        last,
        managerEmails[i],
        null,
        deptIds[deptName],
        null,
        title,
        employmentType,
        status,
        location,
        hireDate,
        salary
      ]
    );
    if (rows[0]) managerIds.push(rows[0].id);
  }

  const EMP_COUNT = 50;
  for (let i = 0; i < EMP_COUNT; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;
    const deptName = pick(Object.keys(deptIds));
    const title = pick(TITLES[deptName]);
    const employmentType = pick(EMPLOYMENT_TYPES);
    const status = pick(STATUSES);
    const location = pick(CITIES);

    const baseByDept = {
      Engineering: [90000, 180000],
      "Human Resources": [60000, 110000],
      Finance: [65000, 120000],
      Sales: [55000, 150000],
      Support: [45000, 90000],
      Operations: [55000, 110000]
    };
    const [minSal, maxSal] = baseByDept[deptName];
    const salary = randInt(minSal, maxSal);

    const hireDate = new Date(randInt(2018, 2024), randInt(0, 11), randInt(1, 28));

    const manager_id = Math.random() < 0.4 && managerIds.length ? pick(managerIds) : null;

    await db.query(
      `INSERT INTO employees
        (first_name, last_name, email, phone, department_id, manager_id, role_title, employment_type, status, location, hire_date, salary)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (email) DO NOTHING;`,
      [
        first,
        last,
        email,
        null,
        deptIds[deptName],
        manager_id,
        title,
        employmentType,
        status,
        location,
        hireDate,
        salary
      ]
    );
  }

  await db.query("COMMIT");
  console.log("🌱 Seeded 6 departments, ~50 employees, admin user ensured.");
} catch (e) {
  await db.query("ROLLBACK");
  console.error(e);
  process.exitCode = 1;
} finally {
  await db.end();
}