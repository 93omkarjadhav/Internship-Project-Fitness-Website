import express from "express";
// import { auth } from "../middleware/auth.js";
import { authenticateToken } from "../middleware/auth.js";
import { createBooking, getMyBookings, deleteBooking } from "../controllers/bookings.controller.js";

const router = express.Router();

router.post("/bookings", authenticateToken, createBooking);
router.get("/bookings/my", authenticateToken, getMyBookings);
router.delete("/bookings/:id",authenticateToken , deleteBooking);


export default router;
