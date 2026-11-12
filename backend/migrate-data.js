import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_DIR } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDb = path.join(__dirname, 'data', 'db.json');
const targetDb = path.join(DATA_DIR, 'db.json');
const sourceUploads = path.join(__dirname, 'uploads');
const targetUploads = path.resolve(process.env.UPLOADS_DIR || path.join(DATA_DIR, 'uploads'));

if (path.resolve(sourceDb) === path.resolve(targetDb)) {
  console.log('DATA_DIR points to the current local database location. Nothing to migrate.');
  process.exit(0);
}
if (!fs.existsSync(sourceDb)) {
  console.error(`Source database not found: ${sourceDb}`);
  process.exit(1);
}
if (fs.existsSync(targetDb)) {
  let targetData;
  try {
    targetData = JSON.parse(fs.readFileSync(targetDb, 'utf8'));
  } catch {
    console.error(`Target database is not valid JSON: ${targetDb}\nNothing was overwritten.`);
    process.exit(1);
  }
  const isEmptyTarget = ['admin_users', 'projects', 'experience', 'skills', 'gallery', 'messages']
    .every((key) => !Array.isArray(targetData[key]) || targetData[key].length === 0) &&
    Object.keys(targetData.about || {}).length === 0 && Object.keys(targetData.settings || {}).length === 0;
  if (!isEmptyTarget) {
    console.error(`Target database already contains data: ${targetDb}\nNothing was overwritten.`);
    process.exit(1);
  }
  fs.copyFileSync(targetDb, `${targetDb}.empty-before-migration.json`);
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.copyFileSync(sourceDb, targetDb);
fs.mkdirSync(targetUploads, { recursive: true });
if (fs.existsSync(sourceUploads)) {
  fs.cpSync(sourceUploads, targetUploads, { recursive: true, force: false, errorOnExist: false });
}
console.log(`Database copied to ${targetDb}`);
console.log(`Uploads copied (if any) to ${targetUploads}`);
console.log('Original local files were left untouched. Verify the deployed site before removing any old copies.');
