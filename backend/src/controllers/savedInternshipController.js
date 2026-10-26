import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| SAVE INTERNSHIP
|--------------------------------------------------------------------------
| POST /api/saved-internships/:internshipId
|--------------------------------------------------------------------------
| Only STUDENT can save an internship.
|--------------------------------------------------------------------------
*/

export const saveInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;

    const internshipResult = await pool.query(
      `
      SELECT
        id,
        approval_status,
        internship_status
      FROM internships
      WHERE id = $1
      LIMIT 1
      `,
      [internshipId]
    );

    if (internshipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found.",
      });
    }

    const internship = internshipResult.rows[0];

    if (
      internship.approval_status !== "APPROVED" ||
      internship.internship_status !== "LIVE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only approved and live internships can be saved.",
      });
    }

    const existingResult = await pool.query(
      `
      SELECT
        id
      FROM saved_internships
      WHERE student_id = $1
        AND internship_id = $2
      LIMIT 1
      `,
      [req.user.id, internshipId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This internship is already saved.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO saved_internships (
        student_id,
        internship_id
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [req.user.id, internshipId]
    );

    return res.status(201).json({
      success: true,
      message:
        "Internship saved successfully.",
      savedInternship: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Save internship error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save internship.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET MY SAVED INTERNSHIPS
|--------------------------------------------------------------------------
| GET /api/saved-internships
|--------------------------------------------------------------------------
| Only STUDENT can view their saved internships.
|--------------------------------------------------------------------------
*/

export const getSavedInternships = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        s.id AS saved_id,
        s.saved_at AS saved_at,

        i.id AS internship_id,
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

        c.company_name,

        cat.id AS category_id,
        cat.name AS category_name

      FROM saved_internships s

      INNER JOIN internships i
        ON s.internship_id = i.id

      INNER JOIN companies c
        ON i.company_id = c.id

      INNER JOIN categories cat
        ON i.category_id = cat.id

      WHERE s.student_id = $1
        AND i.approval_status = 'APPROVED'
        AND i.internship_status = 'LIVE'

      ORDER BY s.saved_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      savedInternships: result.rows,
    });
  } catch (error) {
    console.error(
      "Get saved internships error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get saved internships.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| REMOVE SAVED INTERNSHIP
|--------------------------------------------------------------------------
| DELETE /api/saved-internships/:internshipId
|--------------------------------------------------------------------------
| Only STUDENT can remove their saved internship.
|--------------------------------------------------------------------------
*/

export const removeSavedInternship = async (
  req,
  res
) => {
  try {
    const { internshipId } = req.params;

    const result = await pool.query(
      `
      DELETE FROM saved_internships
      WHERE student_id = $1
        AND internship_id = $2
      RETURNING id
      `,
      [req.user.id, internshipId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Saved internship not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Internship removed from saved internships successfully.",
    });
  } catch (error) {
    console.error(
      "Remove saved internship error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove saved internship.",
    });
  }
};