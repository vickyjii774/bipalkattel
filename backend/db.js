import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load local .env values before resolving database paths. Hosting platforms can
// inject environment variables directly and do not need a .env file.
const localEnvFile = path.resolve(process.cwd(), '.env');
if (fs.existsSync(localEnvFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(localEnvFile);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
export const DB_FILE = path.join(DATA_DIR, 'db.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_BACKUPS = 7;

export const defaultDb = {
  admin_users: [],
  projects: [],
  experience: [],
  skills: [],
  gallery: [],
  about: {},
  settings: {},
  messages: []
};

function ensureDirectoryExists() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function createPeriodicBackup() {
  if (!fs.existsSync(DB_FILE)) return;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter((name) => name.startsWith('db-') && name.endsWith('.json'))
    .sort()
    .reverse();
  const newest = backups[0];
  if (newest) {
    const newestPath = path.join(BACKUP_DIR, newest);
    if (Date.now() - fs.statSync(newestPath).mtimeMs < BACKUP_INTERVAL_MS) return;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(DB_FILE, path.join(BACKUP_DIR, `db-${stamp}.json`));
  const all = fs.readdirSync(BACKUP_DIR)
    .filter((name) => name.startsWith('db-') && name.endsWith('.json'))
    .sort()
    .reverse();
  for (const oldBackup of all.slice(MAX_BACKUPS)) {
    fs.rmSync(path.join(BACKUP_DIR, oldBackup), { force: true });
  }
}

export function readDb() {
  ensureDirectoryExists();
  if (!fs.existsSync(DB_FILE)) {
    writeDb(structuredClone(defaultDb));
    return structuredClone(defaultDb);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    // Do not silently replace a damaged database with empty data.
    throw new Error(`Database file is invalid (${DB_FILE}). Restore a backup before continuing. ${error.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Database file has an invalid structure: ${DB_FILE}`);
  }

  return {
    ...structuredClone(defaultDb),
    ...parsed,
    admin_users: Array.isArray(parsed.admin_users) ? parsed.admin_users : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
    messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    about: parsed.about && typeof parsed.about === 'object' ? parsed.about : {},
    settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}
  };
}

export function writeDb(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new TypeError('writeDb expects a database object');
  }
  ensureDirectoryExists();
  createPeriodicBackup();

  const temporaryFile = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporaryFile, `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporaryFile, DB_FILE);
    return true;
  } catch (error) {
    fs.rmSync(temporaryFile, { force: true });
    throw new Error(`Unable to safely write database: ${error.message}`);
  }
}

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
