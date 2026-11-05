import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import routes from './routes/index.js';
import { errorHandler } from './middleware/auth.js';

const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
  express.json({ limit: '10mb' }),
  cookieParser()
);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

app.get('/health', (_q, res) => res.json({ ok: true, timestamp: new Date() }));
app.use('/api', routes);
app.use(errorHandler);

export default app;
