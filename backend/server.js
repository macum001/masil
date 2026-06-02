import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { pool } from './db.js';
import authRoutes      from './routes/auth.js';
import requestRoutes   from './routes/requests.js';
import chatRoutes      from './routes/chat.js';
import apartmentRoutes from './routes/apartments.js';
import userRoutes      from './routes/users.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, uploadsDir); },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('이미지 파일만 가능합니다.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// CORS - 모든 origin 허용 (로컬 개발용)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Masil backend is running' });
});

app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json({ success: true, database: 'connected', time: rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, database: 'failed', error: error.message });
  }
});

app.post('/api/upload', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ success: false, message: '파일이 없습니다.' });
  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
  res.json({ success: true, imageUrls: req.files.map((f) => `${base}/uploads/${f.filename}`) });
});

app.use('/api/auth',       authRoutes);
app.use('/api/requests',   requestRoutes);
app.use('/api/chat',       chatRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/users',      userRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `경로를 찾을 수 없습니다: ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, message: err.message || '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Masil backend running on port ${PORT}`);
  console.log(`DB: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
});
