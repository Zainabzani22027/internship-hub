import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| GET COMPANY PROFILE
|--------------------------------------------------------------------------
| GET /api/companies/profile
|--------------------------------------------------------------------------
*/

export const getCompanyProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.is_active,

        c.id AS company_id,
        c.company_name,
        c.official_email,
        c.website,
        c.country,
        c.city,
        c.industry,
        c.company_size,
        c.linkedin_url,
        c.description,
        c.logo_url,
        c.verification_status

      FROM users u

      INNER JOIN companies c
        ON u.id = c.user_id

      WHERE u.id = $1
        AND u.role = 'COMPANY'

      LIMIT 1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get company profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get company profile.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE COMPANY PROFILE
|--------------------------------------------------------------------------
| PUT /api/companies/profile
|--------------------------------------------------------------------------
*/

export const updateCompanyProfile = async (req, res) => {
  try {
    const {
      companyName,
      officialEmail,
      website,
      country,
      city,
      industry,
      companySize,
      linkedinUrl,
      description,
      logoUrl,
    } = req.body;

    if (!companyName || companyName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const userResult = await client.query(
        `
        UPDATE users
        SET
          full_name = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
          AND role = 'COMPANY'
        RETURNING
          id,
          full_name,
          email,
          role,
          is_active
        `,
        [
          companyName.trim(),
          req.user.id,
        ]
      );

      if (userResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Company user account not found.",
        });
      }

      const companyResult = await client.query(
        `
        UPDATE companies
        SET
          company_name = $1,
          official_email = $2,
          website = $3,
          country = $4,
          city = $5,
          industry = $6,
          company_size = $7,
          linkedin_url = $8,
          description = $9,
          logo_url = $10,
          updated_at = CURRENT_TIMESTAMP

        WHERE user_id = $11

        RETURNING
          id,
          user_id,
          company_name,
          official_email,
          website,
          country,
          city,
          industry,
          company_size,
          linkedin_url,
          description,
          logo_url,
          verification_status,
          created_at,
          updated_at
        `,
        [
          companyName.trim(),
          officialEmail?.trim() || null,
          website?.trim() || null,
          country?.trim() || null,
          city?.trim() || null,
          industry?.trim() || null,
          companySize?.trim() || null,
          linkedinUrl?.trim() || null,
          description?.trim() || null,
          logoUrl?.trim() || null,
          req.user.id,
        ]
      );

      if (companyResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Company profile not found.",
        });
      }

      await client.query("COMMIT");

      return res.status(200).json({
        success: true,
        message: "Company profile updated successfully.",
        profile: {
          user: userResult.rows[0],
          company: companyResult.rows[0],
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      "Update company profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update company profile.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SUBMIT COMPANY VERIFICATION
|--------------------------------------------------------------------------
| POST /api/companies/verification
|--------------------------------------------------------------------------
*/

export const submitCompanyVerification = async (req, res) => {
  try {
    const {
      verificationType,
      documentUrl,
      evidenceText,
    } = req.body;

    const allowedTypes = [
      "NTN",
      "WEBSITE",
      "DOMAIN_EMAIL",
      "OTHER",
    ];

    if (!verificationType) {
      return res.status(400).json({
        success: false,
        message: "Verification type is required.",
      });
    }

    if (!allowedTypes.includes(verificationType)) {
      return res.status(400).json({
        success: false,
        message:
          "Verification type must be NTN, WEBSITE, DOMAIN_EMAIL or OTHER.",
      });
    }

    if (!documentUrl && !evidenceText) {
      return res.status(400).json({
        success: false,
        message:
          "Document URL or verification evidence is required.",
      });
    }

    const companyResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        company_name,
        verification_status
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

    const company = companyResult.rows[0];

    const verificationResult = await pool.query(
      `
      INSERT INTO company_verifications (
        company_id,
        verification_type,
        document_url,
        evidence_text,
        status,
        submitted_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        'PENDING',
        CURRENT_TIMESTAMP
      )
      RETURNING
        id,
        company_id,
        verification_type,
        document_url,
        evidence_text,
        status,
        admin_note,
        submitted_at,
        reviewed_at
      `,
      [
        company.id,
        verificationType,
        documentUrl?.trim() || null,
        evidenceText?.trim() || null,
      ]
    );

    await pool.query(
      `
      UPDATE companies
      SET
        verification_status = 'PENDING',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [company.id]
    );

    return res.status(201).json({
      success: true,
      message:
        "Company verification submitted successfully. Waiting for admin approval.",
      verification: verificationResult.rows[0],
    });
  } catch (error) {
    console.error(
      "Submit company verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to submit company verification.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET COMPANY VERIFICATION
|--------------------------------------------------------------------------
| GET /api/companies/verification
|--------------------------------------------------------------------------
*/

export const getCompanyVerification = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        cv.id,
        cv.company_id,
        cv.verification_type,
        cv.document_url,
        cv.evidence_text,
        cv.status,
        cv.admin_note,
        cv.submitted_at,
        cv.reviewed_at,

        c.company_name,
        c.verification_status

      FROM company_verifications cv

      INNER JOIN companies c
        ON cv.company_id = c.id

      WHERE c.user_id = $1

      ORDER BY cv.submitted_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      verifications: result.rows,
    });
  } catch (error) {
    console.error(
      "Get company verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get company verification.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN — GET PENDING COMPANY VERIFICATIONS
|--------------------------------------------------------------------------
| GET /api/admin/company-verifications
|--------------------------------------------------------------------------
*/

export const getPendingCompanyVerifications = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        cv.id AS verification_id,
        cv.company_id,
        cv.verification_type,
        cv.document_url,
        cv.evidence_text,
        cv.status,
        cv.admin_note,
        cv.submitted_at,
        cv.reviewed_at,

        c.company_name,
        c.official_email,
        c.website,
        c.country,
        c.city,
        c.industry,
        c.company_size,
        c.linkedin_url,
        c.verification_status,

        u.id AS user_id,
        u.full_name,
        u.email,
        u.is_active

      FROM company_verifications cv

      INNER JOIN companies c
        ON cv.company_id = c.id

      INNER JOIN users u
        ON c.user_id = u.id

      WHERE cv.status = 'PENDING'

      ORDER BY cv.submitted_at ASC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      verifications: result.rows,
    });
  } catch (error) {
    console.error(
      "Get pending company verifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get pending company verifications.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN — REVIEW COMPANY VERIFICATION
|--------------------------------------------------------------------------
| PUT /api/admin/company-verifications/:id
|--------------------------------------------------------------------------
*/

export const reviewCompanyVerification = async (
  req,
  res
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const allowedStatuses = [
      "VERIFIED",
      "REJECTED",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Verification status is required.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be VERIFIED or REJECTED.",
      });
    }

    await client.query("BEGIN");

    const verificationResult =
      await client.query(
        `
        SELECT
          id,
          company_id,
          status
        FROM company_verifications
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

    if (verificationResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message:
          "Company verification request not found.",
      });
    }

    const verification =
      verificationResult.rows[0];

    if (verification.status !== "PENDING") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "This company verification has already been reviewed.",
      });
    }

    const updatedVerification =
      await client.query(
        `
        UPDATE company_verifications

        SET
          status = $1,
          admin_note = $2,
          reviewed_at = CURRENT_TIMESTAMP

        WHERE id = $3

        RETURNING
          id,
          company_id,
          verification_type,
          document_url,
          evidence_text,
          status,
          admin_note,
          submitted_at,
          reviewed_at
        `,
        [
          status,
          adminNote?.trim() || null,
          id,
        ]
      );

    const companyResult =
      await client.query(
        `
        UPDATE companies

        SET
          verification_status = $1,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING
          id,
          user_id,
          company_name,
          verification_status
        `,
        [
          status,
          verification.company_id,
        ]
      );

    if (companyResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        status === "VERIFIED"
          ? "Company verification approved successfully."
          : "Company verification rejected successfully.",

      verification:
        updatedVerification.rows[0],

      company:
        companyResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Review company verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to review company verification.",
    });
  } finally {
    client.release();
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE COMPANY
|--------------------------------------------------------------------------
| PUT /api/admin/companies/:id
|--------------------------------------------------------------------------
*/

export const updateAdminCompany = async (
  req,
  res
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      companyName,
      officialEmail,
      industry,
      country,
      city,
      website,
    } = req.body;

    if (
      !companyName ||
      companyName.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    if (
      !officialEmail ||
      officialEmail.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Official email is required.",
      });
    }

    await client.query("BEGIN");

    const companyResult =
      await client.query(
        `
        SELECT
          id,
          user_id,
          company_name,
          official_email,
          verification_status
        FROM companies
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

    if (companyResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    const company =
      companyResult.rows[0];

    const duplicateEmail =
      await client.query(
        `
        SELECT
          id
        FROM companies
        WHERE LOWER(official_email) = LOWER($1)
          AND id != $2
        LIMIT 1
        `,
        [
          officialEmail.trim(),
          id,
        ]
      );

    if (
      duplicateEmail.rows.length > 0
    ) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message:
          "This official email is already used by another company.",
      });
    }

    await client.query(
      `
      UPDATE users
      SET
        full_name = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND role = 'COMPANY'
      `,
      [
        companyName.trim(),
        company.user_id,
      ]
    );

    const updatedCompany =
      await client.query(
        `
        UPDATE companies

        SET
          company_name = $1,
          official_email = $2,
          industry = $3,
          country = $4,
          city = $5,
          website = $6,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $7

        RETURNING
          id,
          user_id,
          company_name,
          official_email,
          website,
          country,
          city,
          industry,
          company_size,
          linkedin_url,
          description,
          logo_url,
          verification_status,
          created_at,
          updated_at
        `,
        [
          companyName.trim(),
          officialEmail.trim(),
          industry?.trim() || null,
          country?.trim() || null,
          city?.trim() || null,
          website?.trim() || null,
          id,
        ]
      );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Company information updated successfully.",
      company:
        updatedCompany.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Update admin company error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update company information.",
      error: error.message,
    });
  } finally {
    client.release();
  }
};