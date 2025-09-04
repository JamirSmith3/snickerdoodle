DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS employment_type CASCADE;
DROP TYPE IF EXISTS employee_status CASCADE;

CREATE TYPE user_role AS ENUM ('USER','ADMIN');
CREATE TYPE employment_type AS ENUM ('FT','PT','CONTRACT');
CREATE TYPE employee_status AS ENUM ('ACTIVE','INACTIVE');

CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(100) NOT NULL UNIQUE,
  email          VARCHAR(255) UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           user_role NOT NULL DEFAULT 'USER',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE departments (
  id                   SERIAL PRIMARY KEY,
  name                 VARCHAR(120) NOT NULL UNIQUE,
  description          TEXT,
  manager_employee_id  INT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employees (
  id               SERIAL PRIMARY KEY,
  first_name       VARCHAR(80)  NOT NULL,
  last_name        VARCHAR(80)  NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,
  phone            VARCHAR(40),
  department_id    INT,
  manager_id       INT,
  role_title       VARCHAR(120) NOT NULL,
  employment_type  employment_type NOT NULL DEFAULT 'FT',
  status           employee_status NOT NULL DEFAULT 'ACTIVE',
  location         VARCHAR(120),
  hire_date        DATE,
  salary           NUMERIC(12,2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_name ON employees(last_name, first_name);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);

ALTER TABLE employees
  ADD CONSTRAINT fk_employees_department
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_employees_manager
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE departments
  ADD CONSTRAINT fk_departments_manager
  FOREIGN KEY (manager_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

CREATE TABLE notes (
  id             SERIAL PRIMARY KEY,
  employee_id    INT NOT NULL,
  author_user_id INT NOT NULL,
  body           TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_employee ON notes(employee_id);
CREATE INDEX idx_notes_author ON notes(author_user_id);

ALTER TABLE notes
  ADD CONSTRAINT fk_notes_employee
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_notes_author
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE;
