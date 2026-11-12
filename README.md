# BipalKattel Portfolio

React + Vite frontend served by a single Node.js + Express application. Portfolio content is stored in a JSON file; uploaded images are stored on disk.

## Requirements

- Node.js 20.19+ (or a compatible current Node.js release)
- npm

## Local setup

1. Install backend dependencies: `npm ci`
2. Install frontend dependencies and create a production build: `npm run build`
3. Copy `.env.example` to `.env` and set a unique `JWT_SECRET` (at least 32 characters).
4. Create or rotate the administrator account using `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), and optionally `ADMIN_NAME` in `.env`, then run `npm run admin:create`.
5. Start the complete application: `npm start`.
6. Open `http://localhost:5000`.

For frontend-only development, run `npm run dev` in `frontend/` in a separate terminal. Vite proxies `/api` and `/uploads` to `http://localhost:5000`; start the backend with `npm start` first.

## Data and uploads

By default, the JSON database remains at `backend/data/db.json` and uploads remain at `backend/uploads/`, preserving the original local project layout.

For production, mount a persistent disk and configure:

```env
NODE_ENV=production
JWT_SECRET=your-long-random-secret
DATA_DIR=/var/data
UPLOADS_DIR=/var/data/uploads
```

The database is stored at `/var/data/db.json`; daily pre-write snapshots are retained in `/var/data/backups/`. Uploads are stored in `/var/data/uploads/`.

**Do not use an ephemeral filesystem for production data.** Keep this application to one running instance when using the JSON database. JSON-file storage is not designed for multiple concurrent server instances or horizontal scaling.

## Admin account

The server does not create or reset an administrator on startup. To create an administrator or rotate a password, set the `ADMIN_*` variables and run `npm run admin:create`. Existing accounts are retained unless their email matches `ADMIN_EMAIL`, in which case that account's password is updated.

## Existing database migration

Before deployment, back up your current `backend/data/db.json`, configure `DATA_DIR` and `UPLOADS_DIR`, then run `npm run data:migrate` once from the service shell. It copies the current database and any existing uploads to persistent storage, without overwriting a non-empty target. Do not run `npm run seed` against a database containing real content; the seed command only initializes an empty portfolio database.

If the database was already committed to Git, remove it from Git tracking after backing it up locally:

```bash
git rm --cached backend/data/db.json
git add .gitignore
git commit -m "Stop tracking runtime database data"
```

This does not delete your local database file. Rotate the admin password and JWT secret before making the repository public or deploying.

## Build, checks and tests

```bash
npm run check
npm test
npm run build
npm start
```

## Deployment configuration

Use a persistent Node.js web service (for example, a Render Web Service with a persistent disk, or a VPS):

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check path: `/api/settings`
- Environment: `NODE_ENV=production`, `JWT_SECRET`, `DATA_DIR`, `UPLOADS_DIR`
- Persistent disk mount: `/var/data`

The Express server serves `frontend/dist` and the `/api` and `/uploads` routes from the same origin. No separate frontend deployment or Vercel serverless function is required.
