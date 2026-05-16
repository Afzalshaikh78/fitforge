import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    if (!user) {
      const [existing] = await db.select().from(users).where(eq(users.email, email));
      if (existing) {
        [user] = await db.update(users).set({ googleId, avatar: picture }).where(eq(users.email, email)).returning();
      } else {
        [user] = await db.insert(users).values({ email, name, googleId, avatar: picture }).returning();
      }
    } else {
      [user] = await db.update(users)
        .set({ name, avatar: picture, email })
        .where(eq(users.id, user.id))
        .returning();
    }

    res.json({ token: generateToken(user.id), user: sanitizeUser(user) });
  } catch (err) {
    res.status(400).json({ error: 'Google auth failed: ' + err.message });
  }
});

// Email/Password Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ email, name, passwordHash }).returning();
    res.json({ token: generateToken(user.id), user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.passwordHash) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ token: generateToken(user.id), user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const { name, height, weight, age, goal, dailyCalorieGoal } = req.body;
    const [user] = await db.update(users)
      .set({ name, height, weight, age, goal, dailyCalorieGoal, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export default router;
