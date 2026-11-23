import express from "express";

import {
  register,
  login,
  getMe,
  googleAuth,
  googleCallback,
  appleAuth,
  appleCallback,
} from "../controllers/authController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| EMAIL AUTH
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.get(
  "/me",
  protect,
  getMe
);

/*
|--------------------------------------------------------------------------
| GOOGLE AUTH
|--------------------------------------------------------------------------
*/

router.get(
  "/google",
  googleAuth
);

router.get(
  "/google/callback",
  googleCallback
);

/*
|--------------------------------------------------------------------------
| APPLE AUTH
|--------------------------------------------------------------------------
*/

router.get(
  "/apple",
  appleAuth
);

router.post(
  "/apple/callback",
  appleCallback
);

export default router;