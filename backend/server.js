import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDb, writeDb, generateId } from './db.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'bipalkattel-portfolio-super-secret-key-2026';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure DB is seeded on startup if empty
seedDatabase().catch(console.error);

// File uploads directory
const UPLOADS_DIR = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for persistent file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpg, png, webp, gif, svg) are allowed!'));
  }
});

// Middleware: Authenticate JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

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
  const project = (db.projects || []).find(p => p.slug === req.params.slug || p.id === req.params.slug);
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

// Get Public Gallery
app.get('/api/gallery', (req, res) => {
  const db = readDb();
  let items = db.gallery || [];
  items = items.filter(g => g.is_published !== false);
  items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  res.json(items);
});

// Submit Contact Message
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }

  const db = readDb();
  if (!db.messages) db.messages = [];

  const newMessage = {
    id: generateId(),
    name: name.trim(),
    email: email.trim(),
    subject: (subject || 'General Inquiry').trim(),
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
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
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
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
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

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend API Server running at http://localhost:${PORT}`);
  });
}

export default app;
