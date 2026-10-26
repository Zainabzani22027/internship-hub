import express from "express";

import {
  getPendingInternships,
  reviewInternship,
} from "../controllers/adminInternshipController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET PENDING INTERNSHIPS
|--------------------------------------------------------------------------
*/

router.get(
  "/internships",
  protect,
  authorize("ADMIN"),
  getPendingInternships
);

/*
|--------------------------------------------------------------------------
| APPROVE / REJECT INTERNSHIP
|--------------------------------------------------------------------------
*/

router.put(
  "/internships/:id",
  protect,
  authorize("ADMIN"),
  reviewInternship
);

export default router;