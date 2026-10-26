import express from "express";

import {
  saveInternship,
  getSavedInternships,
  removeSavedInternship,
} from "../controllers/savedInternshipController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET SAVED INTERNSHIPS
|--------------------------------------------------------------------------
| GET /api/saved-internships
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  authorize("STUDENT"),
  getSavedInternships
);

/*
|--------------------------------------------------------------------------
| SAVE INTERNSHIP
|--------------------------------------------------------------------------
| POST /api/saved-internships/:internshipId
|--------------------------------------------------------------------------
*/

router.post(
  "/:internshipId",
  protect,
  authorize("STUDENT"),
  saveInternship
);

/*
|--------------------------------------------------------------------------
| REMOVE SAVED INTERNSHIP
|--------------------------------------------------------------------------
| DELETE /api/saved-internships/:internshipId
|--------------------------------------------------------------------------
*/

router.delete(
  "/:internshipId",
  protect,
  authorize("STUDENT"),
  removeSavedInternship
);

export default router;