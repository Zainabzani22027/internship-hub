import pool from "../config/db.js";

export const getAdminCertificates = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        cert.id,
        cert.certificate_id,
        cert.issue_date AS issued_at,
        cert.issue_date,
        cert.certificate_url,
        cert.qr_code_url,
        cert.certificate_full_name,
        cert.application_id,
        cert.is_verified,
        CASE WHEN cert.is_verified THEN 'ISSUED' ELSE 'REVOKED' END AS status,
        u.id AS student_id,
        u.full_name AS student_name,
        co.id AS company_id,
        co.company_name,
        i.id AS internship_id,
        i.title AS internship_title
      FROM certificates cert
      INNER JOIN applications a ON cert.application_id = a.id
      INNER JOIN student_profiles sp ON a.student_id = sp.id
      INNER JOIN users u ON sp.user_id = u.id
      INNER JOIN internships i ON a.internship_id = i.id
      INNER JOIN companies co ON i.company_id = co.id
      ORDER BY cert.issue_date DESC NULLS LAST, cert.id DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      certificates: result.rows,
    });
  } catch (error) {
    console.error("Get admin certificates error:", error);
    return res.status(500).json({ success: false, message: "Unable to get certificates." });
  }
};

export const updateAdminCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const normalizedStatus = String(status || "").toUpperCase();

    if (!["ISSUED", "REVOKED"].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: "Status must be ISSUED or REVOKED." });
    }

    const result = await pool.query(
      `
      UPDATE certificates
      SET is_verified = $1
      WHERE id = $2
      RETURNING *,
        CASE WHEN is_verified THEN 'ISSUED' ELSE 'REVOKED' END AS status
      `,
      [normalizedStatus === "ISSUED", id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Certificate ${normalizedStatus.toLowerCase()} successfully.`,
      certificate: result.rows[0],
    });
  } catch (error) {
    console.error("Update admin certificate status error:", error);
    return res.status(500).json({ success: false, message: "Unable to update certificate status." });
  }
};
