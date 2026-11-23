import express from "express";

import {
  getCompanyApplications,
  markInternshipCompleted,
} from "../controllers/companyApplicationController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET COMPANY APPLICATIONS
|--------------------------------------------------------------------------
| GET /api/company/applications
|--------------------------------------------------------------------------
*/

router.get(
  "/applications",
  protect,
  authorize("COMPANY"),
  getCompanyApplications
);

router.put(
  "/applications/:applicationId/complete",
  protect,
  authorize("COMPANY"),
  markInternshipCompleted
);

export default router;