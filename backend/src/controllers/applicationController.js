import pool from "../config/db.js";

const getStudentProfileId = async (userId) => {
  const result = await pool.query(
    "SELECT id FROM student_profiles WHERE user_id = $1 LIMIT 1",
    [userId]
  );
  return result.rows[0]?.id ?? null;
};

export const applyForInternship = async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const { internshipId } = req.params;
    const { coverLetter } = req.body;

    const studentProfileId = await getStudentProfileId(req.user.id);
    if (!studentProfileId) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Please complete your profile first.",
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the internship while applying so a company cannot delete it at the same time.
    const internshipResult = await client.query(
      `
      SELECT id, approval_status, internship_status
      FROM internships
      WHERE id = $1
      LIMIT 1
      FOR UPDATE
      `,
      [internshipId]
    );

    if (!internshipResult.rows.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({ success: false, message: "Internship not found." });
    }

    const internship = internshipResult.rows[0];
    if (internship.approval_status !== "APPROVED" || internship.internship_status !== "LIVE") {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(400).json({
        success: false,
        message: "This internship is not currently available for applications.",
      });
    }

    const result = await client.query(
      `
      INSERT INTO applications (internship_id, student_id, status, cover_letter)
      VALUES ($1, $2, 'APPLIED', $3)
      ON CONFLICT (internship_id, student_id) DO NOTHING
      RETURNING *
      `,
      [internshipId, studentProfileId, coverLetter?.trim() || null]
    );

    if (!result.rows.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(409).json({
        success: false,
        message: "You have already applied for this internship.",
      });
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application: result.rows[0],
    });
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK");
    console.error("Apply internship error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit application." });
  } finally {
    client.release();
  }
};

export const getStudentApplications = async (req, res) => {
  try {
    const studentProfileId = await getStudentProfileId(req.user.id);
    if (!studentProfileId) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    const result = await pool.query(
      `
      SELECT
        a.id AS id,
        a.id AS application_id,
        a.status,
        a.cover_letter,
        a.applied_at,
        a.updated_at,
        i.id AS internship_id,
        i.title AS internship_title,
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
        c.id AS company_id,
        c.company_name,
        c.logo_url,
        cat.id AS category_id,
        cat.name AS category_name
      FROM applications a
      INNER JOIN internships i ON a.internship_id = i.id
      INNER JOIN companies c ON i.company_id = c.id
      LEFT JOIN categories cat ON i.category_id = cat.id
      WHERE a.student_id = $1
      ORDER BY a.applied_at DESC, a.id DESC
      `,
      [studentProfileId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      applications: result.rows,
    });
  } catch (error) {
    console.error("Get student applications error:", error);
    return res.status(500).json({ success: false, message: "Unable to get student applications." });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status." });
    }

    const result = await pool.query(
      `
      UPDATE applications a
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      FROM internships i
      INNER JOIN companies c ON c.id = i.company_id
      WHERE a.id = $2
        AND a.internship_id = i.id
        AND c.user_id = $3
      RETURNING a.*
      `,
      [status, id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Application not found or you are not authorized to update it." });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully.",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Update application status error:", error);
    return res.status(500).json({ success: false, message: "Unable to update application status." });
  }
};
