import express from "express";

import {
  applyForInternship,
  updateApplicationStatus,
  getStudentApplications,
} from "../controllers/applicationController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:internshipId",
  protect,
  authorize("STUDENT"),
  applyForInternship
);

router.get(
  "/student",
  protect,
  authorize("STUDENT"),
  getStudentApplications
);

router.put(
  "/:id/status",
  protect,
  authorize("COMPANY"),
  updateApplicationStatus
);

export default router;