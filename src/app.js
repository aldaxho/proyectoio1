import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { optimizationRoutes } from './routes/optimization.routes.js';
import { sendError, sendSuccess } from './utils/response.utils.js';

const app = express();

// ─── Middlewares ────────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/optimization', optimizationRoutes);
app.use('/api/optimize', optimizationRoutes);

// Backward-compatible health check alias
app.get('/api/health', (_req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    message: 'Backend de optimización operativo.',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  sendError(res, 404, 'Route not found');
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  sendError(res, err.status ?? 500, err.message ?? 'Internal server error');
});

export default app;
