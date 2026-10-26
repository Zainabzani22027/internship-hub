import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| APPLY FOR INTERNSHIP
|--------------------------------------------------------------------------
| POST /api/applications/:internshipId
|--------------------------------------------------------------------------
*/

export const applyForInternship = async (
  req,
  res
) => {
  try {
    const { internshipId } = req.params;
    const { coverLetter } = req.body;

    // Check internship
    const internshipResult = await pool.query(
      `
      SELECT
        id,
        company_id,
        title,
        approval_status,
        internship_status
      FROM internships
      WHERE id = $1
      LIMIT 1
      `,
      [internshipId]
    );

    if (internshipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found.",
      });
    }

    const internship =
      internshipResult.rows[0];

    // Only live internships can receive applications
    if (
      internship.approval_status !==
        "APPROVED" ||
      internship.internship_status !== "LIVE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This internship is not currently available for applications.",
      });
    }

    // Check duplicate application
    const existingApplication =
      await pool.query(
        `
        SELECT
          id,
          status
        FROM applications
        WHERE internship_id = $1
          AND student_id = $2
        LIMIT 1
        `,
        [
          internshipId,
          req.user.id,
        ]
      );

    if (
      existingApplication.rows.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already applied for this internship.",
        application:
          existingApplication.rows[0],
      });
    }

    // Create application
    const result = await pool.query(
      `
      INSERT INTO applications (
        internship_id,
        student_id,
        status,
        cover_letter
      )
      VALUES ($1, $2, 'APPLIED', $3)
      RETURNING *
      `,
      [
        internshipId,
        req.user.id,
        coverLetter || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Application submitted successfully.",
      application: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Apply internship error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit application.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET STUDENT APPLICATIONS
|--------------------------------------------------------------------------
| GET /api/applications/student
|--------------------------------------------------------------------------
*/

export const getStudentApplications = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      SELECT
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

        c.id AS company_id,
        c.company_name,
        c.logo_url,

        cat.id AS category_id,
        cat.name AS category_name

      FROM applications a

      INNER JOIN internships i
        ON a.internship_id = i.id

      INNER JOIN companies c
        ON i.company_id = c.id

      LEFT JOIN categories cat
        ON i.category_id = cat.id

      WHERE a.student_id = $1

      ORDER BY
        a.applied_at DESC,
        a.id DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      applications: result.rows,
    });
  } catch (error) {
    console.error(
      "Get student applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get student applications.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE APPLICATION STATUS
|--------------------------------------------------------------------------
| PUT /api/applications/:id/status
|--------------------------------------------------------------------------
*/

export const updateApplicationStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "UNDER_REVIEW",
        "SHORTLISTED",
        "INTERVIEW",
        "SELECTED",
        "REJECTED",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application status.",
        });
      }

      // Check application and company ownership
      const applicationResult =
        await pool.query(
          `
          SELECT
            a.id,
            a.status,
            a.internship_id,
            i.company_id
          FROM applications a

          INNER JOIN internships i
            ON a.internship_id = i.id

          INNER JOIN companies c
            ON i.company_id = c.id

          WHERE a.id = $1
            AND c.user_id = $2

          LIMIT 1
          `,
          [
            id,
            req.user.id,
          ]
        );

      if (
        applicationResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found or you are not authorized to update it.",
        });
      }

      // Update status
      const result = await pool.query(
        `
        UPDATE applications
        SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [
          status,
          id,
        ]
      );

      return res.status(200).json({
        success: true,
        message:
          "Application status updated successfully.",
        application: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update application status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update application status.",
        error: error.message,
      });
    }
  };