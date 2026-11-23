import express from "express";

import {
  createInternship,
  getCompanyInternships,
  getInternshipById,
  updateCompanyInternship,
  closeCompanyInternship,
  deleteCompanyInternship,
} from "../controllers/internshipController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("COMPANY"), createInternship);
router.get("/company", protect, authorize("COMPANY"), getCompanyInternships);
router.put("/:id/close", protect, authorize("COMPANY"), closeCompanyInternship);
router.delete("/:id", protect, authorize("COMPANY"), deleteCompanyInternship);
router.get("/:id", protect, authorize("COMPANY", "STUDENT", "ADMIN"), getInternshipById);
router.put("/:id", protect, authorize("COMPANY"), updateCompanyInternship);

export default router;
