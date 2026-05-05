import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { sql } from 'drizzle-orm';
import db from './db/index.js';

import authRoutes from './routes/auth.js';
import calorieRoutes from './routes/calories.js';
import workoutRoutes from './routes/workouts.js';
import mealPlanRoutes from './routes/mealplans.js';
import stripeRoutes from './routes/stripe.js';
import weightRoutes from './routes/weight.js';

const app = express();

// Stripe webhook needs raw body — must come before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Health check
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/calories',   calorieRoutes);
app.use('/api/workouts',   workoutRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/stripe',     stripeRoutes);
app.use('/api/weight',     weightRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── DB bootstrap (idempotent) ─────────────────────────────────────────────────
async function initDB() {
  try {
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE plan AS ENUM ('free', 'pro');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE goal AS ENUM ('lose_weight', 'build_muscle', 'maintain', 'endurance');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      CREATE TABLE IF NOT EXISTS users (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email                 TEXT NOT NULL UNIQUE,
        name                  TEXT NOT NULL,
        avatar                TEXT,
        google_id             TEXT UNIQUE,
        password_hash         TEXT,
        plan                  plan DEFAULT 'free' NOT NULL,
        stripe_customer_id    TEXT,
        stripe_subscription_id TEXT,
        subscription_status   TEXT DEFAULT 'inactive',
        goal                  goal DEFAULT 'maintain',
        height                DECIMAL(5,2),
        weight                DECIMAL(5,2),
        age                   INTEGER,
        daily_calorie_goal    INTEGER DEFAULT 2000,
        created_at            TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at            TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS calorie_entries (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        calories    INTEGER NOT NULL,
        protein     DECIMAL(6,2) DEFAULT 0,
        carbs       DECIMAL(6,2) DEFAULT 0,
        fat         DECIMAL(6,2) DEFAULT 0,
        meal_type   TEXT DEFAULT 'snack',
        date        TEXT NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        description TEXT,
        exercises   JSONB DEFAULT '[]',
        duration    INTEGER,
        is_custom   BOOLEAN DEFAULT FALSE,
        is_template BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_logs (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        workout_id      UUID REFERENCES workouts(id),
        name            TEXT NOT NULL,
        exercises       JSONB DEFAULT '[]',
        duration        INTEGER,
        calories_burned INTEGER,
        date            TEXT NOT NULL,
        notes           TEXT,
        created_at      TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meal_plans (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        description     TEXT,
        meals           JSONB DEFAULT '[]',
        total_calories  INTEGER,
        is_custom       BOOLEAN DEFAULT FALSE,
        created_at      TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weight_logs (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        weight     DECIMAL(5,2) NOT NULL,
        date       TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Database tables ready');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 FitForge API → http://localhost:${PORT}`);
  await initDB();
});
