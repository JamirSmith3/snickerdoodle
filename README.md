# Employee Manager (MVP → Polished v1)

Full-stack demo: Node/Express + Postgres API, React/Vite UI.

## Quick start

### 1) Backend

```bash
# in repo root
cp .env.example .env
# update DATABASE_URL if needed
npm install
npm run db:setup   # optional
npm run dev        # starts server on PORT (default 3000)

2) Frontend
# Frontend (in another terminal)
cd ems-ui
npm run dev

Login with demo:
VITE_DEMO_USER=admin
VITE_DEMO_PASS=admin123