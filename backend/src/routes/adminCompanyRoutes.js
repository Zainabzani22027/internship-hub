import express from "express";

import {
  getAdminCompanies,
  getPendingCompanyVerifications,
  reviewCompanyVerification,
  updateAdminCompany,
} from "../controllers/companyController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All registered companies, including companies that have not submitted verification.
router.get(
  "/companies",
  protect,
  authorize("ADMIN"),
  getAdminCompanies
);

// Keep the pending-only endpoint available for any existing integrations.
router.get(
  "/company-verifications",
  protect,
  authorize("ADMIN"),
  getPendingCompanyVerifications
);

router.put(
  "/company-verifications/:id",
  protect,
  authorize("ADMIN"),
  reviewCompanyVerification
);

router.put(
  "/companies/:id",
  protect,
  authorize("ADMIN"),
  updateAdminCompany
);

export default router;
