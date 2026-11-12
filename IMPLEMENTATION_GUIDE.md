# BipalKattel implementation and deployment guide

This update keeps the existing React UI, portfolio sections, routes and admin CMS. It replaces the Vercel/serverless runtime with one persistent Node.js + Express process and retains the JSON database.

## 1. Make a backup first

Before replacing your current project folder, copy the whole folder somewhere safe. Keep a separate copy of `backend/data/db.json` and `backend/uploads/` (if it contains images).

## 2. Install dependencies and build locally

From the project root:

```powershell
npm ci
npm run build
```

The root build command installs the frontend dependencies and builds `frontend/dist`.

## 3. Configure local environment

Copy `.env.example` to `.env`. Generate a long random JWT secret in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the result into `JWT_SECRET` in `.env`. Keep `.env` private and never commit it.

## 4. Rotate or create your admin account

Set these values in `.env`:

```env
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_NAME=Bipal Kattel
ADMIN_PASSWORD=use-a-unique-password-at-least-12-characters
```

Then run:

```powershell
npm run admin:create
```

If that email already exists, its password is updated. Other admin accounts are retained. Remove `ADMIN_PASSWORD` from `.env` after creating/updating the account. The app no longer seeds or resets admins when it starts.

## 5. Run and test locally

```powershell
npm run check
npm test
npm start
```

Open `http://localhost:5000`. Check `http://localhost:5000/api/health` and `http://localhost:5000/api/projects`. Sign in to the existing admin route and test creating/editing a project, uploading an image, updating About/Settings, and sending a contact message.

For Vite development mode, keep the backend running on port 5000 and run `npm run dev` from `frontend/` in another terminal. The existing Vite proxy forwards `/api` and `/uploads` to Express.

## 6. Prepare a persistent production disk

Use a single-instance Node.js web service with a persistent disk. For a Render service, attach a disk mounted at `/var/data` and set these environment variables in the service dashboard:

```env
NODE_ENV=production
JWT_SECRET=<a-long-random-secret-of-at-least-32-characters>
DATA_DIR=/var/data
UPLOADS_DIR=/var/data/uploads
```

Do not set `VITE_API_URL` for same-domain hosting. The frontend uses `/api` automatically.

## 7. Migrate the existing database and images

After the persistent disk is mounted and the service environment variables are configured, run this once from the service shell:

```bash
npm run data:migrate
```

The migration command copies `backend/data/db.json` to `$DATA_DIR/db.json` and copies any existing `backend/uploads/` files into the configured uploads directory. It refuses to overwrite a non-empty target database. If the host health check has created an empty starter database, the script saves a copy before replacing it. It leaves the original local files untouched.

If you prefer manual migration, copy the existing JSON file to `/var/data/db.json` and existing upload files to `/var/data/uploads/` before starting the production server.

## 8. Deploy configuration

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check: `/api/health`
- Persistent disk mount: `/var/data`
- Instance count: one

Express serves the React app from `frontend/dist`, handles `/api/*`, and serves `/uploads/*` from the persistent disk. Vercel-specific `api/` and `vercel.json` files have been removed from this deployment version.

## 9. Protect the JSON database in Git

Runtime data is now ignored by `.gitignore`. If `backend/data/db.json` is already tracked in Git, back it up and then run:

```bash
git rm --cached backend/data/db.json
git add .gitignore
git commit -m "Stop tracking runtime database data"
```

This removes the file from Git tracking but keeps your local copy. Since the original repository included a database and an admin password hash, rotate the admin password before deployment. If the repository is public, treat any previously committed secrets or private messages as exposed.

## Important operating limits

- Use one running application instance. A JSON file database is not suitable for multiple replicas or horizontal scaling.
- The persistent disk must be mounted and writable before the app receives traffic.
- Daily database snapshots are saved under `backups/` and the latest seven are retained. Keep an additional off-server backup for disaster recovery.
- Uploaded images are limited to 5 MB and JPG, PNG, WEBP or GIF. SVG is intentionally disabled because uploaded SVG can contain active content.
- The current session token remains in browser local storage to preserve the existing admin login integration. Use a strong unique JWT secret and keep the admin UI protected.
