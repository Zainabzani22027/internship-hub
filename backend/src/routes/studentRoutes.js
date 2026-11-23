import express from "express";

import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentController.js";

import {
  uploadStudentCV,
  uploadStudentProfileImage,
} from "../controllers/fileController.js";

import uploadCV, {
  uploadImage,
} from "../middleware/uploadMiddleware.js";

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

router.post(
  "/profile/image",
  protect,
  authorize("STUDENT"),
  uploadImage.single("image"),
  uploadStudentProfileImage
);

export default router;