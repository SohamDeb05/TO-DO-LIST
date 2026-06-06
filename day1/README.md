# React + PostgreSQL Login/Signup Starter

This project includes:

- `frontend/` — React + Vite login/signup UI
- `backend/` — Express API with PostgreSQL authentication
- `db/schema.sql` — SQL schema for the `users` table

## 1. Install dependencies

PowerShell on this machine blocks `npm.ps1`, so use `npm.cmd`:

```powershell
npm.cmd install --prefix backend
npm.cmd install --prefix frontend
```

## 2. Configure environment variables

Copy the example files:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Update `backend/.env` with your PostgreSQL credentials.

## 3. Create the database

Create a PostgreSQL database that matches `PGDATABASE` in `backend/.env`.

The backend automatically creates the `users` table on startup. You can also run `db/schema.sql` manually if preferred.

## 4. Start the backend

```powershell
npm.cmd run dev --prefix backend
```

Backend URL: `http://localhost:4000`

## 5. Start the frontend

In a second terminal:

```powershell
npm.cmd run dev --prefix frontend
```

Frontend URL: `http://localhost:5173`

## UI integration notes

- The frontend now supports `TypeScript`, `Tailwind CSS v4`, and a `shadcn`-style structure.
- Reusable UI components live in `frontend/src/components/ui`.
- Shared utilities live in `frontend/src/lib`.
- The Tailwind entry file is `frontend/src/index.css`.

Why `components/ui` matters:

- `shadcn` examples and generators assume `@/components/ui/...` imports.
- It keeps reusable UI primitives separate from feature code, which makes future component drops predictable.

If you need to initialize the same setup from scratch in another Vite app, use:

```powershell
npm.cmd create vite@latest frontend -- --template react-ts
npm.cmd install --prefix frontend tailwindcss @tailwindcss/vite tw-animate-css
npx shadcn@latest init
```

## API endpoints

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
