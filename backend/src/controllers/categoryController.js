import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name
      FROM categories
      ORDER BY id ASC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      categories: result.rows,
    });
  } catch (error) {
    console.error(
      "Get categories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get categories.",
      error: error.message,
    });
  }
};