import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial state
const defaultDb = {
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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDb() {
  ensureDirectoryExists();
  if (!fs.existsSync(DB_FILE)) {
    writeDb(defaultDb);
    return defaultDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, returning default:', err);
    return defaultDb;
  }
}

export function writeDb(data) {
  ensureDirectoryExists();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
