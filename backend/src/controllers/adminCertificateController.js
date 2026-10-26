import pool from "../config/db.js";

// Get all certificates for admin
export const getAdminCertificates = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.certificate_id,
        c.issued_at,
        c.certificate_url,
        c.qr_code_url,
        c.application_id,

        u.id AS student_id,
        COALESCE(sp.full_name, u.email) AS student_name,

        co.id AS company_id,
        co.company_name,

        i.id AS internship_id,
        i.title AS internship_title

      FROM certificates c

      JOIN applications a
        ON c.application_id = a.id

      JOIN users u
        ON a.student_id = u.id

      LEFT JOIN student_profiles sp
        ON sp.user_id = u.id

      JOIN internships i
        ON a.internship_id = i.id

      JOIN companies co
        ON i.company_id = co.id

      ORDER BY c.issued_at DESC NULLS LAST, c.id DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      certificates: result.rows,
    });
  } catch (error) {
    console.error("Get admin certificates error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get certificates.",
      error: error.message,
    });
  }
};


// Update certificate status
export const updateAdminCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "ISSUED",
      "REVOKED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate status.",
      });
    }

    const result = await pool.query(
      `
      UPDATE certificates
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Certificate ${status.toLowerCase()} successfully.`,
      certificate: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update admin certificate status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update certificate status.",
      error: error.message,
    });
  }
};