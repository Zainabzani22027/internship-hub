import pool from "../config/db.js";

const getStudentProfileId = async (userId) => {
  const result = await pool.query(
    "SELECT id FROM student_profiles WHERE user_id = $1 LIMIT 1",
    [userId]
  );
  return result.rows[0]?.id ?? null;
};

export const saveInternship = async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const { internshipId } = req.params;
    const studentProfileId = await getStudentProfileId(req.user.id);

    if (!studentProfileId) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    await client.query("BEGIN");
    transactionStarted = true;

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
        message: "Only approved and live internships can be saved.",
      });
    }

    const result = await client.query(
      `
      INSERT INTO saved_internships (student_id, internship_id)
      VALUES ($1, $2)
      ON CONFLICT (student_id, internship_id) DO NOTHING
      RETURNING *
      `,
      [studentProfileId, internshipId]
    );

    if (!result.rows.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(409).json({ success: false, message: "This internship is already saved." });
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Internship saved successfully.",
      savedInternship: result.rows[0],
    });
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK");
    console.error("Save internship error:", error);
    return res.status(500).json({ success: false, message: "Unable to save internship." });
  } finally {
    client.release();
  }
};

export const getSavedInternships = async (req, res) => {
  try {
    const studentProfileId = await getStudentProfileId(req.user.id);
    if (!studentProfileId) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    const result = await pool.query(
      `
      SELECT
        s.id AS saved_id,
        s.saved_at,
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
      INNER JOIN internships i ON s.internship_id = i.id
      INNER JOIN companies c ON i.company_id = c.id
      LEFT JOIN categories cat ON i.category_id = cat.id
      WHERE s.student_id = $1
        AND i.approval_status = 'APPROVED'
        AND i.internship_status = 'LIVE'
      ORDER BY s.saved_at DESC
      `,
      [studentProfileId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      savedInternships: result.rows,
    });
  } catch (error) {
    console.error("Get saved internships error:", error);
    return res.status(500).json({ success: false, message: "Unable to get saved internships." });
  }
};

export const removeSavedInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const studentProfileId = await getStudentProfileId(req.user.id);

    if (!studentProfileId) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    const result = await pool.query(
      `
      DELETE FROM saved_internships
      WHERE student_id = $1 AND internship_id = $2
      RETURNING id
      `,
      [studentProfileId, internshipId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Saved internship not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Internship removed from saved internships successfully.",
    });
  } catch (error) {
    console.error("Remove saved internship error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove saved internship." });
  }
};
