import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "InternShip Hub backend is running successfully.",
      database: "PostgreSQL connected",
      serverTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Backend is running, but PostgreSQL connection failed.",
    });
  }
});

export default router;