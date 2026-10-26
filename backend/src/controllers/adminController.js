import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD STATS
|--------------------------------------------------------------------------
| GET /api/admin/dashboard
|--------------------------------------------------------------------------
*/

export const getDashboardStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') AS total_students,

        (SELECT COUNT(*) FROM users WHERE role = 'COMPANY') AS total_companies,

        (
          SELECT COUNT(*)
          FROM companies
          WHERE verification_status = 'PENDING'
        ) AS pending_companies,

        (SELECT COUNT(*) FROM internships) AS total_internships,

        (
          SELECT COUNT(*)
          FROM internships
          WHERE approval_status = 'PENDING'
        ) AS pending_internships,

        (
          SELECT COUNT(*)
          FROM internships
          WHERE approval_status = 'APPROVED'
            AND internship_status = 'LIVE'
        ) AS live_internships,

        (SELECT COUNT(*) FROM applications) AS total_applications,

        (SELECT COUNT(*) FROM certificates) AS total_certificates,

        (SELECT COUNT(*) FROM reports) AS total_reports
    `);

    const stats = result.rows[0];

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents: Number(stats.total_students),
        totalCompanies: Number(stats.total_companies),
        pendingCompanies: Number(stats.pending_companies),
        totalInternships: Number(stats.total_internships),
        pendingInternships: Number(stats.pending_internships),
        liveInternships: Number(stats.live_internships),
        totalApplications: Number(stats.total_applications),
        totalCertificates: Number(stats.total_certificates),
        totalReports: Number(stats.total_reports),
      },
    });
  } catch (error) {
    console.error(
      "Get admin dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get admin dashboard statistics.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET ALL STUDENTS
|--------------------------------------------------------------------------
| GET /api/admin/students
|--------------------------------------------------------------------------
*/

export const getAdminStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.auth_provider,
        u.is_active,
        u.created_at,

        sp.phone,
        sp.country,
        sp.city,
        sp.university,
        sp.degree,
        sp.graduation_year,
        sp.about,
        sp.skills,
        sp.cv_url,
        sp.profile_image_url,
        sp.profile_completion

      FROM users u

      LEFT JOIN student_profiles sp
        ON u.id = sp.user_id

      WHERE u.role = 'STUDENT'

      ORDER BY u.created_at DESC, u.id DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      students: result.rows,
    });
  } catch (error) {
    console.error(
      "Get admin students error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get students.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
|--------------------------------------------------------------------------
| PUT /api/admin/students/:id
|--------------------------------------------------------------------------
*/

export const updateAdminStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      email,
      phone,
      country,
      city,
      university,
      degree,
      graduationYear,
      about,
      skills,
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Full name and email are required.",
      });
    }

    const userResult = await pool.query(
      `
      SELECT
        id,
        role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    if (userResult.rows[0].role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message:
          "This user is not a student.",
      });
    }

    const existingEmail = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
        AND id <> $2
      LIMIT 1
      `,
      [
        email.trim(),
        id,
      ]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This email is already being used by another account.",
      });
    }

    const normalizedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

    await pool.query(
      `
      UPDATE users
      SET
        full_name = $1,
        email = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [
        fullName.trim(),
        email.trim(),
        id,
      ]
    );

    await pool.query(
      `
      INSERT INTO student_profiles (
        user_id,
        phone,
        country,
        city,
        university,
        degree,
        graduation_year,
        about,
        skills
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
        $9
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        phone = EXCLUDED.phone,
        country = EXCLUDED.country,
        city = EXCLUDED.city,
        university = EXCLUDED.university,
        degree = EXCLUDED.degree,
        graduation_year = EXCLUDED.graduation_year,
        about = EXCLUDED.about,
        skills = EXCLUDED.skills
      `,
      [
        id,
        phone || null,
        country || null,
        city || null,
        university || null,
        degree || null,
        graduationYear || null,
        about || null,
        normalizedSkills,
      ]
    );

    const finalResult = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.auth_provider,
        u.is_active,
        u.created_at,

        sp.phone,
        sp.country,
        sp.city,
        sp.university,
        sp.degree,
        sp.graduation_year,
        sp.about,
        sp.skills,
        sp.cv_url,
        sp.profile_image_url,
        sp.profile_completion

      FROM users u

      LEFT JOIN student_profiles sp
        ON u.id = sp.user_id

      WHERE u.id = $1
        AND u.role = 'STUDENT'

      LIMIT 1
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message:
        "Student updated successfully.",
      student: finalResult.rows[0],
    });
  } catch (error) {
    console.error(
      "Update admin student error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update student.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| ACTIVATE / DEACTIVATE USER
|--------------------------------------------------------------------------
| PUT /api/admin/users/:id/status
|--------------------------------------------------------------------------
*/

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be true or false.",
      });
    }

    const userResult = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        role,
        is_active
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = userResult.rows[0];

    if (user.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "Admin account status cannot be changed.",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET
        is_active = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        full_name,
        email,
        role,
        is_active,
        updated_at
      `,
      [
        isActive,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully."
        : "User deactivated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update user status.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET REPORTS
|--------------------------------------------------------------------------
| GET /api/admin/reports
|--------------------------------------------------------------------------
*/

export const getReports = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM reports
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      reports: result.rows,
    });
  } catch (error) {
    console.error(
      "Get admin reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get reports.",
      error: error.message,
    });
  }
};