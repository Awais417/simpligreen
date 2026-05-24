import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../app';
import { AppError, asyncHandler } from '../utils/errors';
import { sendPasswordResetEmail } from '../services/email.service';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required');

  const user = await prisma.user.findUnique({
    where: { email },
    include: { installerType: true },
  });
  if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: process.env.JWT_EXPIRATION || '7d' } as any,
  );

  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { installerType: true },
  });
  if (!user) throw new AppError('User not found', 404);
  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const avatarFile = (req as any).file;

  const data: { name?: string; avatar?: string } = {};
  if (name?.trim()) data.name = name.trim();
  if (avatarFile) data.avatar = avatarFile.filename;

  if (Object.keys(data).length === 0) throw new AppError('Nothing to update', 400);

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data,
    include: { installerType: true },
  });
  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required');

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user || !user.isActive) {
    res.json({ message: 'If that email exists, a reset link has been sent.' });
    return;
  }

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Generate a secure random token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt,
    },
  });

  await sendPasswordResetEmail(user.email, user.name, rawToken);

  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) throw new AppError('Token and new password are required');
  if (password.length < 8) throw new AppError('Password must be at least 8 characters');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!record || record.used) throw new AppError('Invalid or expired reset token', 400);
  if (record.expiresAt < new Date()) throw new AppError('Reset token has expired', 400);
  if (!record.user.isActive) throw new AppError('Account is inactive', 403);

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
  ]);

  res.json({ message: 'Password has been reset successfully. You can now log in.' });
});
