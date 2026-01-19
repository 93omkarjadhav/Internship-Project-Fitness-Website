import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import wellnessRoutes from './routes/wellness.js';
import feedbackRoutes from './routes/feedback.js';
import streakRoutes from './routes/streak.js';
import aiRoutes from './routes/ai.js';
import uploadRoutes from './routes/upload.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import referralRoutes from './routes/referral.js';

import cycleRoutes from './routes/periodTracker/cycleRoutes.js';
import symptomRoutes from './routes/periodTracker/symptomRoutes.js';
import periodRoutes from './routes/periodTracker/periodRoutes.js';
import nextPeriodRoutes from './routes/periodTracker/nextPeriodRoutes.js';
import userRoutes from './routes/periodTracker/userRoutes.js';

import locationRoutes from './routes/location.js';
import clubRoutes from './routes/clubRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

import activitiesRoutes from './routes/activities.js';
import clubSectionRoutes from './routes/clubSection.js';
import bookingsRoutes from "./routes/bookings.routes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import edamamRoutes from './routes/edamam.js';

import { errorHandler } from './middleware/errorHandler.js';
import { requireFemaleGender } from './middleware/genderAuth.js';
import { authenticateToken } from './middleware/auth.js';
import { mapUserGuid } from "./middleware/mapUserGuid.js";

import path from 'path';
import fs from 'fs/promises';
import { pool } from './db/connection.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// ███████  GLOBAL MIDDLEWARE  ███████

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Session for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fitfare-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ███████  PUBLIC ROUTES  (NO AUTH REQUIRED) ███████

app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);
app.use("/api/edamam", edamamRoutes);

// ███████  AUTH + GUID MIDDLEWARE  ███████
// All routes BELOW this point require valid token + GUID → user_id mapping

app.use(authenticateToken);
app.use(mapUserGuid);

// ███████  PROTECTED ROUTES  ███████

app.use('/api/profile', profileRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/wellness', feedbackRoutes);
app.use('/api/wellness', streakRoutes);
app.use('/api/wellness', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', nutritionRoutes);
app.use('/api', mealRoutes);
app.use('/api/referrals', referralRoutes);
app.use("/api", activitiesRoutes);
app.use("/api", clubSectionRoutes);
app.use("/api", bookingsRoutes);
app.use("/api/payment", paymentRoutes);

app.use('/api/clubs', clubRoutes);
app.use('/api/system', systemRoutes);

// Period Tracker (female only)
app.use('/api/cycles', requireFemaleGender, cycleRoutes);
app.use('/api/symptoms', requireFemaleGender, symptomRoutes);
app.use('/api/period', requireFemaleGender, periodRoutes);
app.use('/api/next-period', requireFemaleGender, nextPeriodRoutes);
app.use('/api/users', requireFemaleGender, userRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 Handler (after all routes)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    type: 'NOT_FOUND',
    message: 'Page not found',
    status_code: 404
  });
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
