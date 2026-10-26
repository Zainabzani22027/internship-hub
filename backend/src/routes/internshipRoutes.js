import express from "express";

import {
  createInternship,
  getCompanyInternships,
  getInternshipById,
  updateCompanyInternship,
} from "../controllers/internshipController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| COMPANY - CREATE INTERNSHIP
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  authorize("COMPANY"),
  createInternship
);

/*
|--------------------------------------------------------------------------
| COMPANY - GET OWN INTERNSHIPS
|--------------------------------------------------------------------------
*/

router.get(
  "/company",
  protect,
  authorize("COMPANY"),
  getCompanyInternships
);

/*
|--------------------------------------------------------------------------
| GET SINGLE INTERNSHIP
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  protect,
  authorize("COMPANY", "STUDENT", "ADMIN"),
  getInternshipById
);

/*
|--------------------------------------------------------------------------
| COMPANY - UPDATE INTERNSHIP
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  protect,
  authorize("COMPANY"),
  updateCompanyInternship
);

export default router;