import express from "express";

import {
  getCategories,
} from "../controllers/categoryController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getCategories
);

export default router;