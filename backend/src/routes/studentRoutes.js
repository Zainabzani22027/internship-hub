import express from "express";

import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentController.js";

import {
  uploadStudentCV,
} from "../controllers/fileController.js";

import uploadCV from "../middleware/uploadMiddleware.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET STUDENT PROFILE
|--------------------------------------------------------------------------
*/

router.get(
  "/profile",
  protect,
  authorize("STUDENT"),
  getStudentProfile
);

/*
|--------------------------------------------------------------------------
| UPDATE STUDENT PROFILE
|--------------------------------------------------------------------------
*/

router.put(
  "/profile",
  protect,
  authorize("STUDENT"),
  updateStudentProfile
);

/*
|--------------------------------------------------------------------------
| UPLOAD STUDENT CV
|--------------------------------------------------------------------------
*/

router.post(
  "/profile/cv",
  protect,
  authorize("STUDENT"),
  uploadCV.single("cv"),
  uploadStudentCV
);

export default router;