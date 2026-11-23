import crypto from "crypto";
import pool from "../config/db.js";

export const getStudentCompletedApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT a.id AS application_id, a.certificate_full_name,
             a.internship_completed_at, a.status,
             i.title AS internship_title, i.duration,
             c.company_name, cert.certificate_id, cert.is_verified
      FROM applications a
      INNER JOIN student_profiles sp ON sp.id = a.student_id
      INNER JOIN internships i ON i.id = a.internship_id
      INNER JOIN companies c ON c.id = i.company_id
      LEFT JOIN certificates cert ON cert.application_id = a.id
      WHERE sp.user_id = $1
        AND a.status = 'SELECTED'
        AND a.internship_completed_at IS NOT NULL
      ORDER BY a.internship_completed_at DESC
      `,
      [req.user.id]
    );
    return res.status(200).json({ success: true, applications: result.rows });
  } catch (error) {
    console.error("Get completed applications error:", error);
    return res.status(500).json({ success: false, message: "Unable to load completed internships." });
  }
};

export const saveCertificateFullName = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim().replace(/\s+/g, " ");
    if (fullName.length < 3 || fullName.length > 160 || !/^[\p{L}][\p{L} .'-]*$/u.test(fullName)) {
      return res.status(400).json({ success: false, message: "Enter your full legal name using letters only." });
    }

    const result = await pool.query(
      `
      UPDATE applications a
      SET certificate_full_name = $1, updated_at = CURRENT_TIMESTAMP
      FROM student_profiles sp
      WHERE a.id = $2
        AND a.student_id = sp.id
        AND sp.user_id = $3
        AND a.status = 'SELECTED'
        AND a.internship_completed_at IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM certificates cert WHERE cert.application_id = a.id)
        AND a.certificate_full_name IS NULL
      RETURNING a.id, a.certificate_full_name
      `,
      [fullName, req.params.applicationId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(409).json({ success: false, message: "Name cannot be changed. Make sure the internship is completed and the certificate has not already been issued." });
    }
    return res.status(200).json({ success: true, message: "Certificate name saved and locked.", application: result.rows[0] });
  } catch (error) {
    console.error("Save certificate name error:", error);
    return res.status(500).json({ success: false, message: "Unable to save certificate name." });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const applicationResult = await pool.query(
      `
      SELECT a.id AS application_id, a.student_id, a.internship_id,
             a.status, a.internship_completed_at, a.certificate_full_name,
             i.company_id, c.user_id AS company_user_id
      FROM applications a
      INNER JOIN internships i ON a.internship_id = i.id
      INNER JOIN companies c ON i.company_id = c.id
      WHERE a.id = $1 LIMIT 1
      `,
      [applicationId]
    );

    if (!applicationResult.rows.length) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }
    const application = applicationResult.rows[0];

    if (Number(application.company_user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: "You are not authorized to issue this certificate." });
    }
    if (application.status !== "SELECTED" || !application.internship_completed_at) {
      return res.status(400).json({ success: false, message: "Mark the selected student's internship as completed before issuing a certificate." });
    }
    if (!application.certificate_full_name) {
      return res.status(400).json({ success: false, message: "The student must first confirm and lock their full name in the Student Certificates page." });
    }

    const certificateId = `ISH-${new Date().getFullYear()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const result = await pool.query(
      `
      INSERT INTO certificates (
        certificate_id, application_id, company_id, student_id, internship_id,
        certificate_full_name, certificate_url, qr_code_url, issue_date, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, CURRENT_DATE, TRUE)
      ON CONFLICT (application_id) DO NOTHING
      RETURNING *
      `,
      [certificateId, application.application_id, application.company_id,
       application.student_id, application.internship_id, application.certificate_full_name]
    );

    if (!result.rows.length) {
      return res.status(409).json({ success: false, message: "A certificate has already been issued for this application." });
    }
    return res.status(201).json({ success: true, message: "Certificate issued successfully.", certificate: result.rows[0] });
  } catch (error) {
    console.error("Issue certificate error:", error);
    return res.status(500).json({ success: false, message: "Unable to issue certificate." });
  }
};

export const getStudentCertificates = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT cert.id, cert.certificate_id, cert.application_id, cert.internship_id,
             cert.certificate_full_name, cert.certificate_url, cert.qr_code_url,
             cert.issue_date, cert.is_verified, i.title AS internship_title,
             i.duration, i.country, i.city, i.work_mode, c.company_name,
             a.internship_completed_at
      FROM certificates cert
      INNER JOIN internships i ON cert.internship_id = i.id
      INNER JOIN companies c ON cert.company_id = c.id
      INNER JOIN student_profiles sp ON cert.student_id = sp.id
      INNER JOIN applications a ON a.id = cert.application_id
      WHERE sp.user_id = $1
      ORDER BY cert.issue_date DESC, cert.id DESC
      `,
      [req.user.id]
    );
    return res.status(200).json({ success: true, count: result.rows.length, certificates: result.rows });
  } catch (error) {
    console.error("Get student certificates error:", error);
    return res.status(500).json({ success: false, message: "Unable to get student certificates." });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT cert.certificate_id, cert.issue_date, cert.is_verified,
             cert.certificate_full_name AS student_name, i.title AS internship_title,
             i.duration, c.company_name, c.country AS company_country, c.city AS company_city
      FROM certificates cert
      INNER JOIN internships i ON cert.internship_id = i.id
      INNER JOIN companies c ON cert.company_id = c.id
      WHERE cert.certificate_id = $1 LIMIT 1
      `,
      [req.params.certificateId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Certificate not found.", verified: false });
    }
    const certificate = result.rows[0];
    return res.status(200).json({
      success: true,
      message: certificate.is_verified ? "Certificate is valid and verified." : "Certificate is revoked or not verified.",
      verified: certificate.is_verified === true,
      certificate,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    return res.status(500).json({ success: false, message: "Unable to verify certificate." });
  }
};
