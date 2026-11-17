import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readDb, writeDb, generateId, DATA_DIR } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (!isProduction ? 'local-development-only-change-before-deploy' : '');
if (!JWT_SECRET || (isProduction && (JWT_SECRET.length < 32 || JWT_SECRET.startsWith('replace-with')))) {
  throw new Error('Set a strong JWT_SECRET (at least 32 characters) in the production environment.');
}
if (!isProduction && !process.env.JWT_SECRET) {
  console.warn('[security] Using a local development JWT secret. Set JWT_SECRET before deployment.');
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
// CORS configuration
const allowedOrigins = new Set([
  'https://bipalkattel.com.np',
  'https://www.bipalkattel.com.np',
  'http://localhost:5173'
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without an Origin header
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],
  optionsSuccessStatus: 204
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '2mb' }));

// Persistent disk: set DATA_DIR=/var/data and optionally UPLOADS_DIR=/var/data/uploads.
// For local development, retain the existing backend/uploads folder.
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || (process.env.DATA_DIR
  ? path.join(DATA_DIR, 'uploads')
  : path.join(__dirname, 'uploads')));
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR, {
  index: false,
  dotfiles: 'deny',
  maxAge: isProduction ? '7d' : 0,
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff')
}));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedExtensions.has(extension) && allowedMimeTypes.includes(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('Upload a JPG, PNG, WEBP or GIF image (maximum 5 MB).'), { status: 400 }));
  }
});

// Lightweight per-process rate limiter. For a single-instance portfolio server this
// protects login/contact endpoints without adding another service or dependency.
const rateBuckets = new Map();
function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.path}:${req.ip}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    bucket.count += 1;
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    if (bucket.count > max) {
      return res.status(429).json({ error: message, retry_after_seconds: Math.ceil((bucket.resetAt - now) / 1000) });
    }
    next();
  };
}
const loginRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts. Try again later.' });
const contactRateLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: 'Too many messages submitted. Please try again later.' });

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

function hasValidImageSignature(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);
  if (mimeType === 'image/jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === 'image/gif') return buffer.subarray(0, 6).toString('ascii').startsWith('GIF8');
  if (mimeType === 'image/webp') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

app.get('/api/health', (_req, res) => {
  // Reading the database here makes the health check fail if persistent storage
  // is missing or the JSON file has become unreadable.
  readDb();
  res.json({ status: 'ok' });
});

// Get Site Settings
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings || {});
});

// Get About Page Data
app.get('/api/about', (req, res) => {
  const db = readDb();
  res.json(db.about || {});
});

// Get Public Projects
app.get('/api/projects', (req, res) => {
  const db = readDb();
  let projects = db.projects || [];
  projects = projects.filter(p => p.is_published !== false);
  projects.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  
  if (req.query.featured === 'true') {
    projects = projects.filter(p => p.is_featured);
  }
  res.json(projects);
});

// Get Single Project by Slug
app.get('/api/projects/:slug', (req, res) => {
  const db = readDb();
  const project = (db.projects || []).find(p => (p.slug === req.params.slug || p.id === req.params.slug) && p.is_published !== false);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// Get Public Experience
app.get('/api/experience', (req, res) => {
  const db = readDb();
  let exp = db.experience || [];
  exp = exp.filter(e => e.is_published !== false);
  exp.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  res.json(exp);
});

// Get Public Skills
app.get('/api/skills', (req, res) => {
  const db = readDb();
  let skills = db.skills || [];
  skills = skills.filter(s => s.is_active !== false);
  skills.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  res.json(skills);
});


// Get Public Achievements
app.get("/api/achievements", (req, res) => {
  const db = readDb();

  let achievements = db.achievements || [];

  achievements = achievements.filter(
    (item) => item.is_published !== false
  );

  achievements.sort(
    (a, b) =>
      (a.display_order || 0) - (b.display_order || 0)
  );

  res.json(achievements);
});


// Get Public Gallery
app.get('/api/gallery', (req, res) => {
  const db = readDb();
  let items = db.gallery || [];
  items = items.filter(g => g.is_published !== false);
  items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  res.json(items);
});

// Submit Contact Message
app.post('/api/contact', contactRateLimit, (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string' || !name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }
  if (name.length > 120 || email.length > 254 || message.length > 5000 || (subject && String(subject).length > 180)) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const db = readDb();
  if (!db.messages) db.messages = [];

  const newMessage = {
    id: generateId(),
    name: name.trim(),
    email: email.trim(),
    subject: (typeof subject === 'string' && subject.trim()) || 'General Inquiry',
    message: message.trim(),
    is_read: false,
    created_at: new Date().toISOString()
  };

  db.messages.unshift(newMessage);
  writeDb(db);

  res.status(201).json({ success: true, message: 'Thank you! Your message has been received.' });
});

/* ==========================================================================
   ADMIN AUTHENTICATION ENDPOINTS
   ========================================================================== */

// Admin Login
app.post('/api/auth/login', loginRateLimit, async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = readDb();
  const admin = (db.admin_users || []).find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: admin.id, email: admin.email, name: admin.name }
  });
});

// Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

/* ==========================================================================
   ADMIN CMS DASHBOARD & CRUD ENDPOINTS
   ========================================================================== */

// Admin Dashboard Summary
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  const db = readDb();
  const projects = db.projects || [];
  const experience = db.experience || [];
  const skills = db.skills || [];
  const gallery = db.gallery || [];
  const messages = db.messages || [];
  const unreadMessages = messages.filter(m => !m.is_read).length;

  res.json({
    total_projects: projects.length,
    total_experience: experience.length,
    total_skills: skills.length,
    total_gallery: gallery.length,
    total_messages: messages.length,
    unread_messages: unreadMessages,
    recent_messages: messages.slice(0, 5)
  });
});

// Upload File API
app.post('/api/admin/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });
  if (!hasValidImageSignature(req.file.path, req.file.mimetype)) {
    fs.rmSync(req.file.path, { force: true });
    return res.status(400).json({ error: 'The uploaded file does not appear to be a valid image.' });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// Projects Management (Admin)
app.get('/api/admin/projects', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.projects || []);
});

app.post('/api/admin/projects', authenticateToken, (req, res) => {
  const db = readDb();
  if (!db.projects) db.projects = [];

  const newProject = {
    id: generateId(),
    title: req.body.title || 'Untitled Project',
    slug: (req.body.slug || req.body.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    category: req.body.category || 'General',
    year: req.body.year || new Date().getFullYear().toString(),
    company: req.body.company || '',
    short_description: req.body.short_description || '',
    full_description: req.body.full_description || '',
    image: req.body.image || 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
    technologies: Array.isArray(req.body.technologies) ? req.body.technologies : [],
    github_url: req.body.github_url || '',
    live_demo_url: req.body.live_demo_url || '',
    problem: req.body.problem || '',
    solution: req.body.solution || '',
    features: Array.isArray(req.body.features) ? req.body.features : [],
    challenges: req.body.challenges || '',
    results: req.body.results || '',
    screenshots: Array.isArray(req.body.screenshots) ? req.body.screenshots : [],
    is_featured: req.body.is_featured ?? false,
    is_published: req.body.is_published ?? true,
    display_order: Number(req.body.display_order) || db.projects.length + 1,
    created_at: new Date().toISOString()
  };

  db.projects.push(newProject);
  writeDb(db);
  res.status(201).json(newProject);
});

app.put('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const index = (db.projects || []).findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  const existing = db.projects[index];
  const updated = {
    ...existing,
    ...req.body,
    display_order: req.body.display_order !== undefined ? Number(req.body.display_order) : existing.display_order,
    updated_at: new Date().toISOString()
  };

  db.projects[index] = updated;
  writeDb(db);
  res.json(updated);
});

app.delete('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const db = readDb();
  db.projects = (db.projects || []).filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Experience Management (Admin)
app.get('/api/admin/experience', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.experience || []);
});

app.post('/api/admin/experience', authenticateToken, (req, res) => {
  const db = readDb();
  if (!db.experience) db.experience = [];

  const newExp = {
    id: generateId(),
    organization: req.body.organization || '',
    position: req.body.position || '',
    start_date: req.body.start_date || '',
    end_date: req.body.end_date || '',
    is_current: req.body.is_current ?? false,
    location: req.body.location || '',
    description: req.body.description || '',
    responsibilities: Array.isArray(req.body.responsibilities) ? req.body.responsibilities : [],
    technologies: Array.isArray(req.body.technologies) ? req.body.technologies : [],
    achievements: Array.isArray(req.body.achievements) ? req.body.achievements : [],
    display_order: Number(req.body.display_order) || db.experience.length + 1,
    is_published: req.body.is_published ?? true
  };

  db.experience.push(newExp);
  writeDb(db);
  res.status(201).json(newExp);
});

app.put('/api/admin/experience/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const index = (db.experience || []).findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Experience entry not found' });

  const existing = db.experience[index];
  const updated = { ...existing, ...req.body };
  db.experience[index] = updated;
  writeDb(db);
  res.json(updated);
});

app.delete('/api/admin/experience/:id', authenticateToken, (req, res) => {
  const db = readDb();
  db.experience = (db.experience || []).filter(e => e.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Skills Management (Admin)
app.get('/api/admin/skills', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.skills || []);
});

app.post('/api/admin/skills', authenticateToken, (req, res) => {
  const db = readDb();
  if (!db.skills) db.skills = [];

  const newSkill = {
    id: generateId(),
    name: req.body.name || '',
    icon: req.body.icon || 'Code',
    category: req.body.category || 'Frontend',
    display_order: Number(req.body.display_order) || db.skills.length + 1,
    is_active: req.body.is_active ?? true
  };

  db.skills.push(newSkill);
  writeDb(db);
  res.status(201).json(newSkill);
});

app.put('/api/admin/skills/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const index = (db.skills || []).findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Skill not found' });

  const existing = db.skills[index];
  const updated = { ...existing, ...req.body };
  db.skills[index] = updated;
  writeDb(db);
  res.json(updated);
});

app.delete('/api/admin/skills/:id', authenticateToken, (req, res) => {
  const db = readDb();
  db.skills = (db.skills || []).filter(s => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});


// ===============================
// ACHIEVEMENTS MANAGEMENT (ADMIN)
// ===============================

// Get all achievements for admin
app.get("/api/admin/achievements", authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.achievements || []);
});

// Add achievement
app.post("/api/admin/achievements", authenticateToken, (req, res) => {
  const db = readDb();

  if (!db.achievements) {
    db.achievements = [];
  }

  const newAchievement = {
    id: generateId(),
    title: req.body.title || "",
    organization: req.body.organization || "",
    year: req.body.year || "",
    description: req.body.description || "",
    image: req.body.image || "",
    display_order:
      Number(req.body.display_order) || db.achievements.length + 1,
    is_published: req.body.is_published ?? true,
    created_at: new Date().toISOString()
  };

  db.achievements.push(newAchievement);
  writeDb(db);

  res.status(201).json(newAchievement);
});

// Update achievement
app.put("/api/admin/achievements/:id", authenticateToken, (req, res) => {
  const db = readDb();

  const index = (db.achievements || []).findIndex(
    (item) => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Achievement not found"
    });
  }

  const existing = db.achievements[index];

  const updated = {
    ...existing,
    ...req.body,
    display_order:
      req.body.display_order !== undefined
        ? Number(req.body.display_order)
        : existing.display_order,
    updated_at: new Date().toISOString()
  };

  db.achievements[index] = updated;
  writeDb(db);

  res.json(updated);
});

// Delete achievement
app.delete("/api/admin/achievements/:id", authenticateToken, (req, res) => {
  const db = readDb();

  db.achievements = (db.achievements || []).filter(
    (item) => item.id !== req.params.id
  );

  writeDb(db);

  res.json({ success: true });
});



// Gallery Management (Admin)
app.get('/api/admin/gallery', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.gallery || []);
});

app.post('/api/admin/gallery', authenticateToken, (req, res) => {
  const db = readDb();
  if (!db.gallery) db.gallery = [];

  const newItem = {
    id: generateId(),
    title: req.body.title || '',
    description: req.body.description || '',
    image: req.body.image || '',
    category: req.body.category || 'Other',
    display_order: Number(req.body.display_order) || db.gallery.length + 1,
    is_published: req.body.is_published ?? true
  };

  db.gallery.push(newItem);
  writeDb(db);
  res.status(201).json(newItem);
});

app.put('/api/admin/gallery/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const index = (db.gallery || []).findIndex(g => g.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Gallery item not found' });

  const existing = db.gallery[index];
  const updated = { ...existing, ...req.body };
  db.gallery[index] = updated;
  writeDb(db);
  res.json(updated);
});

app.delete('/api/admin/gallery/:id', authenticateToken, (req, res) => {
  const db = readDb();
  db.gallery = (db.gallery || []).filter(g => g.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// About Management (Admin)
app.put('/api/admin/about', authenticateToken, (req, res) => {
  const db = readDb();
  db.about = { ...db.about, ...req.body };
  writeDb(db);
  res.json(db.about);
});

// Settings Management (Admin)
app.put('/api/admin/settings', authenticateToken, (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

// Messages Management (Admin)
app.get('/api/admin/messages', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.messages || []);
});

app.patch('/api/admin/messages/:id/read', authenticateToken, (req, res) => {
  const db = readDb();
  const index = (db.messages || []).findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Message not found' });

  db.messages[index].is_read = req.body.is_read ?? true;
  writeDb(db);
  res.json(db.messages[index]);
});

app.delete('/api/admin/messages/:id', authenticateToken, (req, res) => {
  const db = readDb();
  db.messages = (db.messages || []).filter(m => m.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Serve the built React SPA from the same Node.js process in production.
const FRONTEND_DIST = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST, { index: false, maxAge: isProduction ? '1h' : 0 }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : 'Unable to process the uploaded file.';
    return res.status(400).json({ error: message });
  }
  console.error('[server error]', err);
  res.status(err.status || 500).json({ error: isProduction ? 'An unexpected server error occurred.' : err.message || 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BipalKattel app running on port ${PORT}`);
    console.log(`Database: ${path.join(DATA_DIR, 'db.json')}`);
    console.log(`Uploads: ${UPLOADS_DIR}`);
  });
}

export default app;
