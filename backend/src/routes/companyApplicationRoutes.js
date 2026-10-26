import express from "express";

import {
  getCompanyApplications,
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

export default router;