import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| GET MY NOTIFICATIONS
|--------------------------------------------------------------------------
| GET /api/notifications
|--------------------------------------------------------------------------
*/

export const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC, id DESC
      `,
      [req.user.id]
    );

    const unreadResult = await pool.query(
      `
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = $1
        AND is_read = FALSE
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      unreadCount: Number(
        unreadResult.rows[0].unread_count
      ),
      notifications: result.rows,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get notifications.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| MARK ONE NOTIFICATION AS READ
|--------------------------------------------------------------------------
| PUT /api/notifications/:id/read
|--------------------------------------------------------------------------
*/

export const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to mark notification as read.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| MARK ALL NOTIFICATIONS AS READ
|--------------------------------------------------------------------------
| PUT /api/notifications/read-all
|--------------------------------------------------------------------------
*/

export const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
        AND is_read = FALSE
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read.",
      updatedCount: result.rowCount,
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to mark all notifications as read.",
      error: error.message,
    });
  }
};