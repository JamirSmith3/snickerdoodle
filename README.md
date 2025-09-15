# Employee Manager (MVP → Polished v1)

Full-stack demo: Node/Express + Postgres API, React/Vite UI.

## Quick start

### 1) Backend

```bash
# in repo root
cp .env.example .env
# update DATABASE_URL if needed
npm install
npm run db:setup   # optional: run your schema + seed script if you have one
npm run dev        # starts server on PORT (default 3000)

2) Frontend
Login with demo:
VITE_DEMO_USER=admin
VITE_DEMO_PASS=admin123