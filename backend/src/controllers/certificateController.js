import crypto from "crypto";
import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| ISSUE CERTIFICATE
|--------------------------------------------------------------------------
| POST /api/certificates/issue/:applicationId
|--------------------------------------------------------------------------
| Only COMPANY can issue certificates.
|--------------------------------------------------------------------------
*/

export const issueCertificate = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const applicationResult = await pool.query(
      `
      SELECT
        a.id AS application_id,
        a.student_id,
        a.internship_id,
        a.status,

        i.title,
        i.company_id,

        c.company_name,
        c.user_id AS company_user_id

      FROM applications a

      INNER JOIN internships i
        ON a.internship_id = i.id

      INNER JOIN companies c
        ON i.company_id = c.id

      WHERE a.id = $1
      LIMIT 1
      `,
      [applicationId]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const application = applicationResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | CHECK COMPANY OWNERSHIP
    |--------------------------------------------------------------------------
    */

    if (application.company_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to issue a certificate for this application.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK APPLICATION STATUS
    |--------------------------------------------------------------------------
    */

    if (application.status !== "SELECTED") {
      return res.status(400).json({
        success: false,
        message:
          "Certificate can only be issued for a selected student.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE CERTIFICATE
    |--------------------------------------------------------------------------
    */

    const existingCertificate = await pool.query(
      `
      SELECT
        id,
        certificate_id
      FROM certificates
      WHERE application_id = $1
      LIMIT 1
      `,
      [applicationId]
    );

    if (existingCertificate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "A certificate has already been issued for this application.",
        certificate: existingCertificate.rows[0],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GENERATE CERTIFICATE ID
    |--------------------------------------------------------------------------
    */

    const randomCode = crypto
      .randomBytes(5)
      .toString("hex")
      .toUpperCase();

    const certificateId = `ISH-${new Date().getFullYear()}-${randomCode}`;

    /*
    |--------------------------------------------------------------------------
    | INSERT CERTIFICATE
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `
      INSERT INTO certificates (
        certificate_id,
        application_id,
        company_id,
        student_id,
        internship_id,
        certificate_url,
        qr_code_url,
        issue_date,
        is_verified
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        CURRENT_DATE,
        TRUE
      )
      RETURNING *
      `,
      [
        certificateId,
        applicationId,
        application.company_id,
        application.student_id,
        application.internship_id,
        null,
        null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully.",
      certificate: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Issue certificate error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to issue certificate.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET STUDENT CERTIFICATES
|--------------------------------------------------------------------------
| GET /api/certificates/student
|--------------------------------------------------------------------------
| Only STUDENT can view their certificates.
|--------------------------------------------------------------------------
*/

export const getStudentCertificates = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        cert.id,
        cert.certificate_id,
        cert.application_id,
        cert.internship_id,
        cert.certificate_url,
        cert.qr_code_url,
        cert.issue_date,
        cert.is_verified,

        i.title AS internship_title,
        i.duration,
        i.country,
        i.city,
        i.work_mode,

        c.company_name

      FROM certificates cert

      INNER JOIN internships i
        ON cert.internship_id = i.id

      INNER JOIN companies c
        ON cert.company_id = c.id

      WHERE cert.student_id = $1

      ORDER BY cert.issue_date DESC, cert.id DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      certificates: result.rows,
    });
  } catch (error) {
    console.error(
      "Get student certificates error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get student certificates.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| VERIFY CERTIFICATE
|--------------------------------------------------------------------------
| GET /api/certificates/verify/:certificateId
|--------------------------------------------------------------------------
| Public endpoint.
|--------------------------------------------------------------------------
*/

export const verifyCertificate = async (
  req,
  res
) => {
  try {
    const { certificateId } = req.params;

    const result = await pool.query(
      `
      SELECT
        cert.certificate_id,
        cert.issue_date,
        cert.is_verified,

        u.full_name AS student_name,

        i.title AS internship_title,
        i.duration,

        c.company_name,
        c.country AS company_country,
        c.city AS company_city

      FROM certificates cert

      INNER JOIN users u
        ON cert.student_id = u.id

      INNER JOIN internships i
        ON cert.internship_id = i.id

      INNER JOIN companies c
        ON cert.company_id = c.id

      WHERE cert.certificate_id = $1

      LIMIT 1
      `,
      [certificateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
        verified: false,
      });
    }

    const certificate = result.rows[0];

    return res.status(200).json({
      success: true,
      message: certificate.is_verified
        ? "Certificate is valid and verified."
        : "Certificate is not verified.",
      verified: certificate.is_verified,
      certificate,
    });
  } catch (error) {
    console.error(
      "Verify certificate error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify certificate.",
    });
  }
};