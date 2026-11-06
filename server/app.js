import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import routes from './routes/index.js';
import { errorHandler } from './middleware/auth.js';

const app = express();
app.set('trust proxy', 1);

// Configure CORS for production and development
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5000')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(normalized) ||
        normalized.includes('vercel.app') ||
        normalized.includes('onrender.com') ||
        normalized.includes('netlify.app') ||
        normalized.includes('localhost') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
  express.json({ limit: '10mb' }),
  cookieParser()
);

// Uploads static directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Rate limiting for auth routes
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60e3,
    limit: 100,
    validate: { ip: false },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check endpoints — both /health and /api/health for Render compatibility
const healthPayload = (_q, res) => res.json({
  ok: true,
  app: 'MEDORA Hospital API',
  status: 'ONLINE',
  timestamp: new Date().toISOString(),
});
app.get('/health', healthPayload);
app.get('/api/health', healthPayload);

// API Routes
app.use('/api', routes);

// Static frontend serving if client/dist exists (Monolithic / Full-stack deployment)
const clientDistRelative = path.resolve(process.cwd(), '../client/dist');
const clientDistLocal = path.resolve(process.cwd(), 'client/dist');
const distPath = fs.existsSync(clientDistRelative)
  ? clientDistRelative
  : fs.existsSync(clientDistLocal)
    ? clientDistLocal
    : null;

if (distPath) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      name: 'MEDORA Hospital API Server',
      status: 'ONLINE',
      docs: '/api/services, /api/doctors',
      health: '/health',
    });
  });
}

// Global Error Handler
app.use(errorHandler);

export default app;
