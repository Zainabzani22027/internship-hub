import express from "express";

import {
  getCompanyProfile,
  updateCompanyProfile,
  submitCompanyVerification,
  getCompanyVerification,
} from "../controllers/companyController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| COMPANY PROFILE
|--------------------------------------------------------------------------
*/

router.get(
  "/profile",
  protect,
  authorize("COMPANY"),
  getCompanyProfile
);

router.put(
  "/profile",
  protect,
  authorize("COMPANY"),
  updateCompanyProfile
);

/*
|--------------------------------------------------------------------------
| COMPANY VERIFICATION
|--------------------------------------------------------------------------
*/

router.post(
  "/verification",
  protect,
  authorize("COMPANY"),
  submitCompanyVerification
);

router.get(
  "/verification",
  protect,
  authorize("COMPANY"),
  getCompanyVerification
);

export default router;