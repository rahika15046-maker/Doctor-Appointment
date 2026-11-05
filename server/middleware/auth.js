import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medora-production-jwt-secret-key-32chars';

export const requireAuth = async (req, _res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    }
    if (!token) throw new ApiError(401, 'Please log in');

    const { sub } = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(sub);
    if (!req.user || req.user.isActive === false) throw new ApiError(401, 'User account not active');
    next();
  } catch (err) {
    next(new ApiError(401, 'Please log in'));
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden'));
  }
  next();
};

export const errorHandler = (e, _req, res, _next) => {
  const status = e.status || 500;
  if (status === 500) {
    console.error('[Error caught in handler]:', e);
  }
  res.status(status).json({
    success: false,
    message: e.message || 'Internal server error',
  });
};
