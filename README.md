# ⚡ FitForge — Full-Stack Fitness SaaS

A production-grade fitness SaaS with calorie tracking, workout management, meal plans, and Stripe billing.

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Auth | JWT + Google OAuth |
| Payments | Stripe Subscriptions |
| Infra | Docker + Docker Compose |

---

## 🚀 Quick Start

### 1. Clone & configure

```bash
git clone <your-repo>
cd fitforge
cp .env.example .env
```

### 2. Fill in `.env`

```env
# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe (https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...   ← create a $12/mo recurring price in Stripe
```

### 3. Launch with Docker

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| PostgreSQL | localhost:5432 |

---

## 🔑 Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add Authorized Origins:
   - `http://localhost:5173`
5. Add Authorized Redirect URIs:
   - `http://localhost:5173`
6. Copy the Client ID & Secret into `.env`

---

## 💳 Setting Up Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Go to **Products → Add Product**
   - Name: "FitForge Pro"
   - Price: $12.00 / month (recurring)
   - Copy the **Price ID** (`price_xxx`) → `STRIPE_PRICE_ID_PRO`
3. Copy your **Secret Key** and **Publishable Key** from the dashboard
4. Set up webhook (for subscription updates):
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   # Copy the webhook secret → STRIPE_WEBHOOK_SECRET
   ```

---

## 📁 Project Structure

```
fitforge/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js              ← Express app entry
│       ├── db/
│       │   ├── index.js          ← Drizzle connection
│       │   └── schema.js         ← All table definitions
│       ├── middleware/
│       │   └── auth.js           ← JWT + requirePro guards
│       └── routes/
│           ├── auth.js           ← Register, login, Google OAuth, profile
│           ├── calories.js       ← Calorie CRUD
│           ├── workouts.js       ← Workout library + logs
│           ├── mealplans.js      ← Meal plan CRUD
│           ├── stripe.js         ← Checkout, portal, webhooks
│           └── weight.js         ← Weight logs
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx               ← Routes
        ├── index.css             ← Design system / CSS vars
        ├── contexts/
        │   └── AuthContext.jsx   ← Global auth state
        ├── lib/
        │   └── api.js            ← Axios instance w/ auth interceptor
        ├── components/
        │   ├── Layout.jsx        ← Sidebar navigation
        │   └── GoogleSignIn.jsx  ← Google One-Tap button
        └── pages/
            ├── Landing.jsx       ← Marketing home page
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx     ← Overview + charts
            ├── CalorieTracker.jsx← Food log + macro chart
            ├── Workouts.jsx      ← Library + custom + history
            ├── MealPlans.jsx     ← Plans browser + custom creator
            ├── Pricing.jsx       ← Stripe checkout entry
            └── Profile.jsx       ← Settings + weight + billing
```

---

## 🔐 Auth Flow

```
Email/Password → POST /api/auth/register or /login → JWT
Google Sign-In → POST /api/auth/google (id_token) → JWT
All protected routes → Authorization: Bearer <JWT>
Pro-only routes → requirePro middleware → 403 if free plan
```

---

## 💰 Billing Flow

```
User clicks "Upgrade" → POST /api/stripe/create-checkout
→ Stripe Checkout page (hosted)
→ On success → redirect to /dashboard?upgraded=true
→ Stripe webhook → POST /api/stripe/webhook
→ user.plan set to 'pro' in DB

Manage subscription → POST /api/stripe/portal
→ Stripe Customer Portal (cancel, update card, etc.)
```

---

## 🏋️ Features by Plan

| Feature | Free | Pro |
|---------|------|-----|
| Calorie tracking | ✓ | ✓ |
| Pre-built workouts (4) | ✓ | ✓ |
| Pre-built meal plans (3) | ✓ | ✓ |
| Weight logging | ✓ | ✓ |
| Progress charts | ✓ | ✓ |
| Custom workouts | — | ✓ |
| Custom meal plans | — | ✓ |
| Advanced analytics | — | ✓ |
| Unlimited logging | — | ✓ |

---

## 🛠️ Local Dev (without Docker)

```bash
# Start Postgres locally, then:

# Backend
cd backend
cp .env.example .env   # fill in values
npm install
node src/index.js      # DB tables auto-created on first run

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 📡 API Reference

```
POST /api/auth/register          Body: { name, email, password }
POST /api/auth/login             Body: { email, password }
POST /api/auth/google            Body: { token }   (Google id_token)
GET  /api/auth/me                → current user
PUT  /api/auth/profile           Body: { name, height, weight, age, goal, dailyCalorieGoal }

GET  /api/calories?date=YYYY-MM-DD
POST /api/calories               Body: { name, calories, protein, carbs, fat, mealType, date }
DELETE /api/calories/:id

GET  /api/workouts               → library + user custom
POST /api/workouts               (Pro) Body: { name, description, exercises, duration }
GET  /api/workouts/logs?date=
POST /api/workouts/logs          Body: { name, exercises, duration, caloriesBurned, date, notes }

GET  /api/meal-plans
POST /api/meal-plans             (Pro) Body: { name, description, meals, totalCalories }
DELETE /api/meal-plans/:id

GET  /api/weight
POST /api/weight                 Body: { weight, date }

POST /api/stripe/create-checkout → { url }
POST /api/stripe/portal          → { url }
POST /api/stripe/webhook         (Stripe webhook — raw body)
```
