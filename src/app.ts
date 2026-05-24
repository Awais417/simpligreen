import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import managerRoutes from './routes/manager.routes';
import installerRoutes from './routes/installer.routes';
import qaRoutes from './routes/qa.routes';
import { AppError } from './utils/errors';

export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files (local dev only; on Lambda /tmp is ephemeral)
const uploadDir = process.env.UPLOAD_DIR ||
  (process.env.LAMBDA_TASK_ROOT ? '/tmp/uploads' : path.join(process.cwd(), 'uploads'));
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/installer', installerRoutes);
app.use('/api/qa', qaRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Multer errors
  if (err.message?.includes('Invalid file type') || err.message?.includes('File too large')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
