import pool from "../config/db.js";

const normalizePaymentType = (value) => {
  const normalized = String(value || "UNPAID").trim().toUpperCase();
  return ["PAID", "UNPAID"].includes(normalized) ? normalized : null;
};

const normalizeWorkMode = (value) => {
  const normalized = String(value || "REMOTE")
    .trim()
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return ["REMOTE", "ONSITE", "HYBRID"].includes(normalized)
    ? normalized
    : null;
};

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }
  if (typeof skills === "string") {
    return skills.split(",").map((skill) => skill.trim()).filter(Boolean);
  }
  return [];
};

const getCompanyId = async (userId) => {
  const result = await pool.query(
    "SELECT id FROM companies WHERE user_id = $1 LIMIT 1",
    [userId]
  );
  return result.rows[0]?.id ?? null;
};

const validateInternshipInput = ({ title, categoryId, description, deadline, paymentType, workMode }) => {
  if (!title?.trim() || !description?.trim()) {
    return "Title and description are required.";
  }
  if (!categoryId || !Number.isInteger(Number(categoryId))) {
    return "Please select a valid category.";
  }
  if (!deadline || Number.isNaN(Date.parse(deadline))) {
    return "A valid application deadline is required.";
  }
  if (!normalizePaymentType(paymentType)) {
    return "Payment type must be PAID or UNPAID.";
  }
  if (!normalizeWorkMode(workMode)) {
    return "Work mode must be REMOTE, ONSITE or HYBRID.";
  }
  return null;
};

/*
|--------------------------------------------------------------------------
| CREATE INTERNSHIP
|--------------------------------------------------------------------------
*/

export const createInternship = async (req, res) => {
  try {
    const {
      title, categoryId, description, duration, stipend,
      paymentType, country, city, location, workMode, skills, deadline,
    } = req.body;

    const validationError = validateInternshipInput({
      title, categoryId, description, deadline, paymentType, workMode,
    });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ success: false, message: "Company profile not found." });
    }

    const categoryResult = await pool.query(
      "SELECT id FROM categories WHERE id = $1 AND is_active = TRUE LIMIT 1",
      [Number(categoryId)]
    );
    if (!categoryResult.rows.length) {
      return res.status(400).json({ success: false, message: "Selected category is not available." });
    }

    const companyResult = await pool.query(
      "SELECT verification_status FROM companies WHERE id = $1",
      [companyId]
    );
    if (companyResult.rows[0]?.verification_status !== "VERIFIED") {
      return res.status(403).json({
        success: false,
        message: "Your company must be verified by admin before posting internships.",
      });
    }

    // Backward compatibility: older form versions sent one location string.
    let finalCity = city?.trim() || null;
    let finalCountry = country?.trim() || null;
    if (!finalCity && !finalCountry && location?.trim()) {
      const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
      if (parts.length > 1) {
        finalCity = parts.slice(0, -1).join(", ");
        finalCountry = parts[parts.length - 1];
      } else {
        finalCity = parts[0] || null;
      }
    }

    const result = await pool.query(
      `
      INSERT INTO internships (
        company_id, category_id, title, description, duration,
        stipend, payment_type, country, city, work_mode, skills,
        deadline, approval_status, internship_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING', 'DRAFT')
      RETURNING *
      `,
      [
        companyId,
        Number(categoryId),
        title.trim(),
        description.trim(),
        duration?.trim() || null,
        paymentType.toUpperCase() === "UNPAID" ? 0 : Math.max(0, Number(stipend) || 0),
        normalizePaymentType(paymentType),
        finalCountry,
        finalCity,
        normalizeWorkMode(workMode),
        normalizeSkills(skills),
        deadline,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Internship created successfully and submitted for admin approval.",
      internship: result.rows[0],
    });
  } catch (error) {
    console.error("Create internship error:", error);
    return res.status(500).json({ success: false, message: "Unable to create internship." });
  }
};

/*
|--------------------------------------------------------------------------
| GET COMPANY INTERNSHIPS
|--------------------------------------------------------------------------
*/

export const getCompanyInternships = async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ success: false, message: "Company profile not found." });
    }

    const result = await pool.query(
      `
      SELECT
        i.*,
        cat.name AS category_name,
        COUNT(a.id)::int AS application_count
      FROM internships i
      LEFT JOIN categories cat ON cat.id = i.category_id
      LEFT JOIN applications a ON a.internship_id = i.id
      WHERE i.company_id = $1
      GROUP BY i.id, cat.name
      ORDER BY i.created_at DESC, i.id DESC
      `,
      [companyId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      internships: result.rows,
    });
  } catch (error) {
    console.error("Get company internships error:", error);
    return res.status(500).json({ success: false, message: "Unable to get company internships." });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE INTERNSHIP
|--------------------------------------------------------------------------
*/

export const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT
        i.*,
        cat.name AS category_name,
        co.company_name,
        COUNT(a.id)::int AS application_count
      FROM internships i
      LEFT JOIN categories cat ON cat.id = i.category_id
      LEFT JOIN companies co ON co.id = i.company_id
      LEFT JOIN applications a ON a.internship_id = i.id
      WHERE i.id = $1
      GROUP BY i.id, cat.name, co.company_name
      LIMIT 1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Internship not found." });
    }

    const internship = result.rows[0];
    if (req.user.role === "COMPANY") {
      const companyId = await getCompanyId(req.user.id);
      if (!companyId || Number(internship.company_id) !== Number(companyId)) {
        return res.status(403).json({ success: false, message: "You are not authorized to view this internship." });
      }
    } else if (
      req.user.role === "STUDENT" &&
      (internship.approval_status !== "APPROVED" || internship.internship_status !== "LIVE")
    ) {
      return res.status(404).json({ success: false, message: "Internship not found." });
    }

    return res.status(200).json({ success: true, internship });
  } catch (error) {
    console.error("Get internship by ID error:", error);
    return res.status(500).json({ success: false, message: "Unable to get internship details." });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE COMPANY INTERNSHIP
|--------------------------------------------------------------------------
*/

export const updateCompanyInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, categoryId, description, duration, stipend, paymentType,
      country, city, location, workMode, skills, deadline,
    } = req.body;

    const validationError = validateInternshipInput({
      title, categoryId, description, deadline, paymentType, workMode,
    });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ success: false, message: "Company profile not found." });
    }

    const companyVerification = await pool.query(
      "SELECT verification_status FROM companies WHERE id = $1 LIMIT 1",
      [companyId]
    );
    if (companyVerification.rows[0]?.verification_status !== "VERIFIED") {
      return res.status(403).json({
        success: false,
        message: "Your company must be verified by admin before editing internships.",
      });
    }

    const categoryResult = await pool.query(
      "SELECT id FROM categories WHERE id = $1 AND is_active = TRUE LIMIT 1",
      [Number(categoryId)]
    );
    if (!categoryResult.rows.length) {
      return res.status(400).json({ success: false, message: "Selected category is not available." });
    }

    let finalCity = city?.trim() || null;
    let finalCountry = country?.trim() || null;
    if (!finalCity && !finalCountry && location?.trim()) {
      const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
      if (parts.length > 1) {
        finalCity = parts.slice(0, -1).join(", ");
        finalCountry = parts[parts.length - 1];
      } else {
        finalCity = parts[0] || null;
      }
    }

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
        country = $7,
        city = $8,
        work_mode = $9,
        skills = $10,
        deadline = $11,
        approval_status = 'PENDING',
        internship_status = 'DRAFT',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND company_id = $13
        AND internship_status <> 'CLOSED'
      RETURNING *
      `,
      [
        title.trim(),
        Number(categoryId),
        description.trim(),
        duration?.trim() || null,
        paymentType.toUpperCase() === "UNPAID" ? 0 : Math.max(0, Number(stipend) || 0),
        normalizePaymentType(paymentType),
        finalCountry,
        finalCity,
        normalizeWorkMode(workMode),
        normalizeSkills(skills),
        deadline,
        id,
        companyId,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Internship not found or you are not authorized to edit it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Internship updated and submitted for admin review.",
      internship: result.rows[0],
    });
  } catch (error) {
    console.error("Update company internship error:", error);
    return res.status(500).json({ success: false, message: "Unable to update internship." });
  }
};

/*
|--------------------------------------------------------------------------
| CLOSE COMPANY INTERNSHIP
|--------------------------------------------------------------------------
*/

export const closeCompanyInternship = async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ success: false, message: "Company profile not found." });
    }

    const result = await pool.query(
      `
      UPDATE internships
      SET internship_status = 'CLOSED', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND company_id = $2
        AND approval_status = 'APPROVED'
        AND internship_status = 'LIVE'
      RETURNING id, title, approval_status, internship_status
      `,
      [req.params.id, companyId]
    );

    if (!result.rows.length) {
      return res.status(400).json({ success: false, message: "Only your approved, live internships can be closed." });
    }

    return res.status(200).json({
      success: true,
      message: "Internship closed successfully. Existing applications have been preserved.",
      internship: result.rows[0],
    });
  } catch (error) {
    console.error("Close internship error:", error);
    return res.status(500).json({ success: false, message: "Unable to close internship." });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE COMPANY INTERNSHIP
|--------------------------------------------------------------------------
| Only internships without applications can be permanently deleted.
|--------------------------------------------------------------------------
*/

export const deleteCompanyInternship = async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ success: false, message: "Company profile not found." });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    const internshipResult = await client.query(
      `
      SELECT id
      FROM internships
      WHERE id = $1 AND company_id = $2
      FOR UPDATE
      `,
      [req.params.id, companyId]
    );

    if (!internshipResult.rows.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "Internship not found or you are not authorized to delete it.",
      });
    }

    const applicationResult = await client.query(
      `SELECT 1 FROM applications WHERE internship_id = $1 LIMIT 1`,
      [req.params.id]
    );

    if (applicationResult.rows.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(409).json({
        success: false,
        message: "This internship has applications. Close it instead to preserve student records.",
        requiresClose: true,
      });
    }

    // Remove saved bookmarks first so they cannot block deletion through a foreign key.
    await client.query(
      `DELETE FROM saved_internships WHERE internship_id = $1`,
      [req.params.id]
    );

    const deleteResult = await client.query(
      `
      DELETE FROM internships
      WHERE id = $1 AND company_id = $2
      RETURNING id
      `,
      [req.params.id, companyId]
    );

    if (!deleteResult.rows.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "Internship not found or you are not authorized to delete it.",
      });
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Internship deleted successfully.",
    });
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK");
    console.error("Delete internship error:", error);
    return res.status(500).json({ success: false, message: "Unable to delete internship." });
  } finally {
    client.release();
  }
};
