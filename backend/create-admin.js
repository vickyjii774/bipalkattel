import bcrypt from 'bcryptjs';
import { readDb, writeDb, generateId } from './db.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'Portfolio Administrator';

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this command.');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('ADMIN_EMAIL must be a valid email address.');
  process.exit(1);
}
if (password.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters long.');
  process.exit(1);
}

const db = readDb();
db.admin_users ||= [];
const existing = db.admin_users.find((admin) => admin.email?.toLowerCase() === email);
const admin = {
  id: existing?.id || generateId(),
  email,
  password_hash: await bcrypt.hash(password, 12),
  name,
  created_at: existing?.created_at || new Date().toISOString(),
  updated_at: new Date().toISOString()
};

if (existing) {
  db.admin_users = db.admin_users.map((item) => item.id === existing.id ? admin : item);
  console.log(`Admin password updated for ${email}.`);
} else {
  db.admin_users.push(admin);
  console.log(`Admin account created for ${email}.`);
}
writeDb(db);
