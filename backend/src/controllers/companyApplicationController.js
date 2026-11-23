import pool from "../config/db.js";

export const getCompanyApplications = async (req, res) => {
  try {
    const companyResult = await pool.query(
      "SELECT id FROM companies WHERE user_id = $1 LIMIT 1",
      [req.user.id]
    );

    if (!companyResult.rows.length) {
      return res.status(404).json({ success: false, message: "Company profile not found." });
    }

    const result = await pool.query(
      `
      SELECT
        a.id AS id,
        a.id AS application_id,
        a.internship_id,
        i.title AS internship_title,
        c.company_name,
        a.student_id AS student_profile_id,
        sp.user_id AS student_user_id,
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
        a.updated_at,
        a.internship_completed_at,
        a.certificate_full_name,
        cert.certificate_id,
        cert.certificate_url,
        cert.issue_date,
        cert.is_verified
      FROM applications a
      INNER JOIN internships i ON a.internship_id = i.id
      INNER JOIN companies c ON i.company_id = c.id
      INNER JOIN student_profiles sp ON a.student_id = sp.id
      INNER JOIN users u ON sp.user_id = u.id
      LEFT JOIN certificates cert ON cert.application_id = a.id
      WHERE c.id = $1
      ORDER BY a.applied_at DESC, a.id DESC
      `,
      [companyResult.rows[0].id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      applications: result.rows,
    });
  } catch (error) {
    console.error("Get company applications error:", error);
    return res.status(500).json({ success: false, message: "Unable to get company applications." });
  }
};


export const markInternshipCompleted = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const result = await pool.query(
      `
      UPDATE applications a
      SET internship_completed_at = COALESCE(a.internship_completed_at, CURRENT_TIMESTAMP),
          internship_completed_by = COALESCE(a.internship_completed_by, $1),
          updated_at = CURRENT_TIMESTAMP
      FROM internships i
      INNER JOIN companies c ON c.id = i.company_id
      WHERE a.id = $2
        AND a.internship_id = i.id
        AND c.user_id = $1
        AND a.status = 'SELECTED'
      RETURNING a.id, a.internship_completed_at, a.certificate_full_name
      `,
      [req.user.id, applicationId]
    );

    if (!result.rows.length) {
      return res.status(400).json({
        success: false,
        message: "Only a student selected for your internship can be marked completed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student internship marked as completed.",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Mark internship completed error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to mark internship as completed.",
    });
  }
};
