import express from "express";
import { predictNextPeriod } from "../../controllers/periodTracker/nextPeriodController.js";

const router = express.Router();

// Middleware will be applied at the app level for gender-based access control
router.post("/", predictNextPeriod);

export default router;


