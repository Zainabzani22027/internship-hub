import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| CREATE INTERNSHIP
|--------------------------------------------------------------------------
*/

export const createInternship = async (req, res) => {
  try {
    const {
      title,
      categoryId,
      description,
      duration,
      stipend,
      paymentType,
      location,
      workMode,
      skills,
      deadline,
    } = req.body;

    if (!title || !categoryId || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Title, category and description are required.",
      });
    }

    const companyResult = await pool.query(
      `
      SELECT id
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

    const companyId = companyResult.rows[0].id;

    const companyVerificationResult =
      await pool.query(
        `
        SELECT verification_status
        FROM companies
        WHERE id = $1
        LIMIT 1
        `,
        [companyId]
      );

    if (
      companyVerificationResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    const verificationStatus =
      companyVerificationResult.rows[0]
        .verification_status;

    if (
      verificationStatus &&
      String(verificationStatus).toUpperCase() !==
        "VERIFIED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your company must be verified by admin before posting internships.",
      });
    }

    const normalizedPaymentType = paymentType
      ? String(paymentType).toUpperCase()
      : "UNPAID";

    const normalizedWorkMode = workMode
      ? String(workMode).toUpperCase()
      : "ON_SITE";

    const normalizedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

    const result = await pool.query(
      `
      INSERT INTO internships (
        company_id,
        category_id,
        title,
        description,
        duration,
        stipend,
        payment_type,
        location,
        work_mode,
        skills,
        deadline,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        'PENDING'
      )
      RETURNING *
      `,
      [
        companyId,
        categoryId,
        title,
        description,
        duration || null,
        Number(stipend) || 0,
        normalizedPaymentType,
        location || null,
        normalizedWorkMode,
        normalizedSkills,
        deadline || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Internship created successfully and submitted for admin approval.",
      internship: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create internship error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create internship.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET COMPANY INTERNSHIPS
|--------------------------------------------------------------------------
*/

export const getCompanyInternships = async (
  req,
  res
) => {
  try {
    const companyResult = await pool.query(
      `
      SELECT id
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

    const companyId = companyResult.rows[0].id;

    const result = await pool.query(
      `
      SELECT
        i.*,
        c.name AS category_name,
        COUNT(a.id)::int AS application_count
      FROM internships i
      LEFT JOIN categories c
        ON c.id = i.category_id
      LEFT JOIN applications a
        ON a.internship_id = i.id
      WHERE i.company_id = $1
      GROUP BY
        i.id,
        c.name
      ORDER BY i.id DESC
      `,
      [companyId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      internships: result.rows,
    });
  } catch (error) {
    console.error(
      "Get company internships error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get company internships.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET SINGLE INTERNSHIP
|--------------------------------------------------------------------------
*/

export const getInternshipById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        i.*,
        c.name AS category_name,
        co.company_name,
        COUNT(a.id)::int AS application_count
      FROM internships i
      LEFT JOIN categories c
        ON c.id = i.category_id
      LEFT JOIN companies co
        ON co.id = i.company_id
      LEFT JOIN applications a
        ON a.internship_id = i.id
      WHERE i.id = $1
      GROUP BY
        i.id,
        c.name,
        co.company_name
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found.",
      });
    }

    return res.status(200).json({
      success: true,
      internship: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get internship by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get internship details.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE COMPANY INTERNSHIP
|--------------------------------------------------------------------------
*/

export const updateCompanyInternship = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      title,
      categoryId,
      description,
      duration,
      stipend,
      paymentType,
      location,
      workMode,
      skills,
      deadline,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Title and description are required.",
      });
    }

    const companyResult = await pool.query(
      `
      SELECT id
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

    const companyId = companyResult.rows[0].id;

    const internshipResult = await pool.query(
      `
      SELECT id
      FROM internships
      WHERE id = $1
        AND company_id = $2
      LIMIT 1
      `,
      [id, companyId]
    );

    if (internshipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Internship not found or you are not authorized to edit it.",
      });
    }

    const normalizedPaymentType = paymentType
      ? String(paymentType).toUpperCase()
      : "UNPAID";

    const normalizedWorkMode = workMode
      ? String(workMode).toUpperCase()
      : "ON_SITE";

    const normalizedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

    const result = await pool.query(
      `
      UPDATE internships
      SET
        title = $1,
        category_id = $2,
        description = $3,
        duration = $4,
        stipend = $5,
        payment_type = $6,
        location = $7,
        work_mode = $8,
        skills = $9,
        deadline = $10
      WHERE id = $11
        AND company_id = $12
      RETURNING *
      `,
      [
        title,
        categoryId || null,
        description,
        duration || null,
        Number(stipend) || 0,
        normalizedPaymentType,
        location || null,
        normalizedWorkMode,
        normalizedSkills,
        deadline || null,
        id,
        companyId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Internship could not be updated.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Internship updated successfully.",
      internship: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update company internship error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update internship.",
      error: error.message,
    });
  }
};