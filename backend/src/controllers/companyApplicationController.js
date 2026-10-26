import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| GET COMPANY APPLICATIONS
|--------------------------------------------------------------------------
| GET /api/company/applications
|--------------------------------------------------------------------------
| Company can only see applications submitted
| to its own internships.
|--------------------------------------------------------------------------
*/

export const getCompanyApplications = async (
  req,
  res
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | FIND COMPANY
    |--------------------------------------------------------------------------
    */

    const companyResult = await pool.query(
      `
      SELECT
        id,
        company_name
      FROM companies
      WHERE user_id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const companyId =
      companyResult.rows[0].id;

    /*
    |--------------------------------------------------------------------------
    | GET APPLICATIONS
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `
      SELECT
        a.id AS application_id,

        a.internship_id,
        i.title AS internship_title,

        a.student_id,

        u.full_name AS student_name,
        u.email AS student_email,

        sp.phone,
        sp.country AS student_country,
        sp.city AS student_city,
        sp.university,
        sp.degree,
        sp.graduation_year,
        sp.about,
        sp.skills,
        sp.cv_url,
        sp.profile_image_url,

        a.status,
        a.cover_letter,
        a.applied_at,
        a.updated_at

      FROM applications a

      INNER JOIN internships i
        ON a.internship_id = i.id

      INNER JOIN companies c
        ON i.company_id = c.id

      INNER JOIN users u
        ON a.student_id = u.id

      LEFT JOIN student_profiles sp
        ON a.student_id = sp.user_id

      WHERE c.id = $1

      ORDER BY a.applied_at DESC
      `,
      [companyId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      applications: result.rows,
    });
  } catch (error) {
    console.error(
      "Get company applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get company applications.",
    });
  }
};