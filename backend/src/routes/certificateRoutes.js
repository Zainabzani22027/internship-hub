import express from "express";

import {
  issueCertificate,
  getStudentCertificates,
  verifyCertificate,
} from "../controllers/certificateController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ISSUE CERTIFICATE
|--------------------------------------------------------------------------
| Company only
*/

router.post(
  "/issue/:applicationId",
  protect,
  authorize("COMPANY"),
  issueCertificate
);


/*
|--------------------------------------------------------------------------
| GET STUDENT CERTIFICATES
|--------------------------------------------------------------------------
| Student only
*/

router.get(
  "/student",
  protect,
  authorize("STUDENT"),
  getStudentCertificates
);


/*
|--------------------------------------------------------------------------
| VERIFY CERTIFICATE
|--------------------------------------------------------------------------
| Public endpoint
*/

router.get(
  "/verify/:certificateId",
  verifyCertificate
);

export default router;