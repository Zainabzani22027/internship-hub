import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| GET LIVE INTERNSHIPS
|--------------------------------------------------------------------------
| GET /api/student/internships
|--------------------------------------------------------------------------
| Students can only see:
| approval_status = APPROVED
| internship_status = LIVE
|--------------------------------------------------------------------------
*/

export const getLiveInternships = async (req, res) => {
  try {
    const {
      search,
      categoryId,
      country,
      city,
      workMode,
    } = req.query;

    const conditions = [
      "i.approval_status = 'APPROVED'",
      "i.internship_status = 'LIVE'",
    ];

    const values = [];
    let parameterIndex = 1;

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (search && search.trim() !== "") {
      conditions.push(`
        (
          LOWER(i.title) LIKE LOWER($${parameterIndex})
          OR LOWER(i.description) LIKE LOWER($${parameterIndex})
          OR LOWER(c.company_name) LIKE LOWER($${parameterIndex})
        )
      `);

      values.push(`%${search.trim()}%`);
      parameterIndex++;
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY FILTER
    |--------------------------------------------------------------------------
    */

    if (categoryId) {
      conditions.push(
        `i.category_id = $${parameterIndex}`
      );

      values.push(categoryId);
      parameterIndex++;
    }

    /*
    |--------------------------------------------------------------------------
    | COUNTRY FILTER
    |--------------------------------------------------------------------------
    */

    if (country && country.trim() !== "") {
      conditions.push(
        `LOWER(i.country) = LOWER($${parameterIndex})`
      );

      values.push(country.trim());
      parameterIndex++;
    }

    /*
    |--------------------------------------------------------------------------
    | CITY FILTER
    |--------------------------------------------------------------------------
    */

    if (city && city.trim() !== "") {
      conditions.push(
        `LOWER(i.city) = LOWER($${parameterIndex})`
      );

      values.push(city.trim());
      parameterIndex++;
    }

    /*
    |--------------------------------------------------------------------------
    | WORK MODE FILTER
    |--------------------------------------------------------------------------
    */

    if (workMode && workMode.trim() !== "") {
      const allowedWorkModes = [
        "REMOTE",
        "ONSITE",
        "HYBRID",
      ];

      const normalizedWorkMode =
        workMode.trim().toUpperCase();

      if (
        !allowedWorkModes.includes(
          normalizedWorkMode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Work mode must be REMOTE, ONSITE or HYBRID.",
        });
      }

      conditions.push(
        `i.work_mode = $${parameterIndex}`
      );

      values.push(normalizedWorkMode);
      parameterIndex++;
    }

    /*
    |--------------------------------------------------------------------------
    | GET INTERNSHIPS
    |--------------------------------------------------------------------------
    */

    const query = `
      SELECT
        i.id,
        i.company_id,
        c.company_name,

        i.category_id,
        cat.name AS category_name,

        i.title,
        i.description,
        i.duration,
        i.stipend,
        i.payment_type,
        i.country,
        i.city,
        i.work_mode,
        i.skills,
        i.deadline,

        i.approval_status,
        i.internship_status,

        i.created_at,
        i.updated_at

      FROM internships i

      INNER JOIN companies c
        ON i.company_id = c.id

      INNER JOIN categories cat
        ON i.category_id = cat.id

      WHERE ${conditions.join(" AND ")}

      ORDER BY i.created_at DESC
    `;

    const result = await pool.query(
      query,
      values
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      internships: result.rows,
    });
  } catch (error) {
    console.error(
      "Get live internships error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get live internships.",
    });
  }
};