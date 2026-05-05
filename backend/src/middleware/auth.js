import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requirePro = (req, res, next) => {
  if (req.user.plan !== 'pro') {
    return res.status(403).json({ error: 'Pro subscription required', upgrade: true });
  }
  next();
};
