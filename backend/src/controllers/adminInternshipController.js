import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| GET PENDING INTERNSHIPS
|--------------------------------------------------------------------------
| GET /api/admin/internships
|--------------------------------------------------------------------------
*/

export const getPendingInternships = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        i.id,
        i.company_id,
        c.company_name,

        i.category_id,
        cat.name AS category_name,

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

        i.approval_status,
        i.internship_status,
        i.admin_note,

        i.created_at,
        i.updated_at

      FROM internships i

      INNER JOIN companies c
        ON i.company_id = c.id

      INNER JOIN categories cat
        ON i.category_id = cat.id

      WHERE i.approval_status = 'PENDING'

      ORDER BY i.created_at ASC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      internships: result.rows,
    });
  } catch (error) {
    console.error(
      "Get pending internships error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get pending internships.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| REVIEW INTERNSHIP
|--------------------------------------------------------------------------
| PUT /api/admin/internships/:id
|--------------------------------------------------------------------------
| APPROVED:
| approval_status = APPROVED
| internship_status = LIVE
|
| REJECTED:
| approval_status = REJECTED
| internship_status = DRAFT
|--------------------------------------------------------------------------
*/

export const reviewInternship = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const allowedStatuses = [
      "APPROVED",
      "REJECTED",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "Internship approval status is required.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be APPROVED or REJECTED.",
      });
    }

    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | FIND INTERNSHIP
    |--------------------------------------------------------------------------
    */

    const internshipResult = await client.query(
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
      [id]
    );

    if (internshipResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Internship not found.",
      });
    }

    const internship =
      internshipResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | CHECK ALREADY REVIEWED
    |--------------------------------------------------------------------------
    */

    if (internship.approval_status !== "PENDING") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "This internship has already been reviewed.",
        currentStatus:
          internship.approval_status,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | APPROVE
    |--------------------------------------------------------------------------
    */

    if (status === "APPROVED") {
      const result = await client.query(
        `
        UPDATE internships

        SET
          approval_status = 'APPROVED',
          internship_status = 'LIVE',
          admin_note = $1,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING
          id,
          company_id,
          title,
          approval_status,
          internship_status,
          admin_note,
          updated_at
        `,
        [
          adminNote?.trim() || null,
          id,
        ]
      );

      await client.query("COMMIT");

      return res.status(200).json({
        success: true,
        message:
          "Internship approved successfully and is now live.",
        internship: result.rows[0],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

    const result = await client.query(
      `
      UPDATE internships

      SET
        approval_status = 'REJECTED',
        internship_status = 'DRAFT',
        admin_note = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2

      RETURNING
        id,
        company_id,
        title,
        approval_status,
        internship_status,
        admin_note,
        updated_at
      `,
      [
        adminNote?.trim() || null,
        id,
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Internship rejected successfully.",
      internship: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Review internship error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to review internship.",
    });
  } finally {
    client.release();
  }
};