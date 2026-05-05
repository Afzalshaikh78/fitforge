import { pgTable, text, integer, boolean, timestamp, decimal, uuid, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'pro']);
export const goalEnum = pgEnum('goal', ['lose_weight', 'build_muscle', 'maintain', 'endurance']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  googleId: text('google_id').unique(),
  passwordHash: text('password_hash'),
  plan: planEnum('plan').default('free').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status').default('inactive'),
  goal: goalEnum('goal').default('maintain'),
  height: decimal('height', { precision: 5, scale: 2 }),
  weight: decimal('weight', { precision: 5, scale: 2 }),
  age: integer('age'),
  dailyCalorieGoal: integer('daily_calorie_goal').default(2000),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const calorieEntries = pgTable('calorie_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  calories: integer('calories').notNull(),
  protein: decimal('protein', { precision: 6, scale: 2 }).default('0'),
  carbs: decimal('carbs', { precision: 6, scale: 2 }).default('0'),
  fat: decimal('fat', { precision: 6, scale: 2 }).default('0'),
  mealType: text('meal_type').default('snack'),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  exercises: jsonb('exercises').default([]),
  duration: integer('duration'),
  isCustom: boolean('is_custom').default(false),
  isTemplate: boolean('is_template').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutLogs = pgTable('workout_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workoutId: uuid('workout_id').references(() => workouts.id),
  name: text('name').notNull(),
  exercises: jsonb('exercises').default([]),
  duration: integer('duration'),
  caloriesBurned: integer('calories_burned'),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mealPlans = pgTable('meal_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  meals: jsonb('meals').default([]),
  totalCalories: integer('total_calories'),
  isCustom: boolean('is_custom').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const weightLogs = pgTable('weight_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
