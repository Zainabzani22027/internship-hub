import express from "express";

import {
  getPendingCompanyVerifications,
  reviewCompanyVerification,
} from "../controllers/companyController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET PENDING COMPANY VERIFICATIONS
|--------------------------------------------------------------------------
*/

router.get(
  "/company-verifications",
  protect,
  authorize("ADMIN"),
  getPendingCompanyVerifications
);

/*
|--------------------------------------------------------------------------
| REVIEW COMPANY VERIFICATION
|--------------------------------------------------------------------------
*/

router.put(
  "/company-verifications/:id",
  protect,
  authorize("ADMIN"),
  reviewCompanyVerification
);

export default router;