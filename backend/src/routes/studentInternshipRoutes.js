import express from "express";

import {
  getLiveInternships,
} from "../controllers/studentInternshipController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET LIVE INTERNSHIPS
|--------------------------------------------------------------------------
| Only students can access this listing.
|--------------------------------------------------------------------------
*/

router.get(
  "/internships",
  protect,
  authorize("STUDENT"),
  getLiveInternships
);

export default router;