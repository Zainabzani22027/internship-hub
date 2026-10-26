import express from "express";

import {
  getDashboardStats,
  getAdminStudents,
  updateAdminStudent,
  updateUserStatus,
  getReports,
} from "../controllers/adminController.js";

import {
  getPendingCompanyVerifications,
  reviewCompanyVerification,
} from "../controllers/companyController.js";

import {
  getPendingInternships,
  reviewInternship,
} from "../controllers/adminInternshipController.js";

import {
  getAdminCertificates,
  updateAdminCertificateStatus,
} from "../controllers/adminCertificateController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  protect,
  authorize("ADMIN"),
  getDashboardStats
);

/*
|--------------------------------------------------------------------------
| ADMIN STUDENTS
|--------------------------------------------------------------------------
*/

router.get(
  "/students",
  protect,
  authorize("ADMIN"),
  getAdminStudents
);

router.put(
  "/students/:id",
  protect,
  authorize("ADMIN"),
  updateAdminStudent
);

router.put(
  "/users/:id/status",
  protect,
  authorize("ADMIN"),
  updateUserStatus
);

/*
|--------------------------------------------------------------------------
| ADMIN COMPANY VERIFICATIONS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| ADMIN INTERNSHIPS
|--------------------------------------------------------------------------
*/

router.get(
  "/internships",
  protect,
  authorize("ADMIN"),
  getPendingInternships
);

router.put(
  "/internships/:id",
  protect,
  authorize("ADMIN"),
  reviewInternship
);

/*
|--------------------------------------------------------------------------
| ADMIN CERTIFICATES
|--------------------------------------------------------------------------
*/

router.get(
  "/certificates",
  protect,
  authorize("ADMIN"),
  getAdminCertificates
);

router.put(
  "/certificates/:id/status",
  protect,
  authorize("ADMIN"),
  updateAdminCertificateStatus
);

/*
|--------------------------------------------------------------------------
| ADMIN REPORTS
|--------------------------------------------------------------------------
*/

router.get(
  "/reports",
  protect,
  authorize("ADMIN"),
  getReports
);

export default router;