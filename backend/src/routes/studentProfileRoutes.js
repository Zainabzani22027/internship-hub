import express from "express";

import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentProfileController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/profile",
  protect,
  authorize("STUDENT"),
  getStudentProfile
);

router.put(
  "/profile",
  protect,
  authorize("STUDENT"),
  updateStudentProfile
);

export default router;