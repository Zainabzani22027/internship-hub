import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| GET MY NOTIFICATIONS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  getNotifications
);


/*
|--------------------------------------------------------------------------
| MARK ALL AS READ
|--------------------------------------------------------------------------
*/

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);


/*
|--------------------------------------------------------------------------
| MARK ONE AS READ
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);


export default router;