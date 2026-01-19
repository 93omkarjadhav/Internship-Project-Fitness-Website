import express from "express";
import { savePeriodDate } from "../../controllers/periodTracker/periodController.js";

const router = express.Router();

// Middleware will be applied at the app level for gender-based access control
router.post("/save", savePeriodDate);

export default router;


