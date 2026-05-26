import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppError } from '../utils/errors';

export interface TokenPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    if (err instanceof JsonWebTokenError) {
      return next(new AppError('Invalid authentication token. Please log in again.', 401));
    }
    next(new AppError('Authentication failed. Please log in again.', 401));
  }
};
