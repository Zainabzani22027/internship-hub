import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| GET STUDENT PROFILE
|--------------------------------------------------------------------------
| GET /api/student/profile
|--------------------------------------------------------------------------
*/

export const getStudentProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.auth_provider,
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
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get student profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get student profile.",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT PROFILE
|--------------------------------------------------------------------------
| PUT /api/student/profile
|--------------------------------------------------------------------------
*/

export const updateStudentProfile = async (
  req,
  res
) => {
  try {
    const {
      fullName,
      phone,
      country,
      city,
      university,
      degree,
      graduationYear,
      about,
      skills,
      cvUrl,
      profileImageUrl,
    } = req.body;

    // Update user's name
    await pool.query(
      `
      UPDATE users
      SET
        full_name = COALESCE($1, full_name),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND role = 'STUDENT'
      `,
      [
        fullName || null,
        req.user.id,
      ]
    );

    // Check if student profile already exists
    const existingProfile =
      await pool.query(
        `
        SELECT user_id
        FROM student_profiles
        WHERE user_id = $1
        LIMIT 1
        `,
        [req.user.id]
      );

    if (existingProfile.rows.length === 0) {
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
          skills,
          cv_url,
          profile_image_url,
          profile_completion
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
          0
        )
        `,
        [
          req.user.id,
          phone || null,
          country || null,
          city || null,
          university || null,
          degree || null,
          graduationYear || null,
          about || null,
          Array.isArray(skills)
            ? skills
            : [],
          cvUrl || null,
          profileImageUrl || null,
        ]
      );
    } else {
      await pool.query(
        `
        UPDATE student_profiles
        SET
          phone = $1,
          country = $2,
          city = $3,
          university = $4,
          degree = $5,
          graduation_year = $6,
          about = $7,
          skills = $8,
          cv_url = $9,
          profile_image_url = $10
        WHERE user_id = $11
        `,
        [
          phone || null,
          country || null,
          city || null,
          university || null,
          degree || null,
          graduationYear || null,
          about || null,
          Array.isArray(skills)
            ? skills
            : [],
          cvUrl || null,
          profileImageUrl || null,
          req.user.id,
        ]
      );
    }

    // Calculate profile completion
    const profileResult =
      await pool.query(
        `
        SELECT
          u.full_name,
          u.email,
          sp.phone,
          sp.country,
          sp.city,
          sp.university,
          sp.degree,
          sp.graduation_year,
          sp.about,
          sp.skills,
          sp.cv_url,
          sp.profile_image_url
        FROM users u
        LEFT JOIN student_profiles sp
          ON u.id = sp.user_id
        WHERE u.id = $1
          AND u.role = 'STUDENT'
        LIMIT 1
        `,
        [req.user.id]
      );

    const profile =
      profileResult.rows[0];

    const fields = [
      profile.full_name,
      profile.email,
      profile.phone,
      profile.country,
      profile.city,
      profile.university,
      profile.degree,
      profile.graduation_year,
      profile.about,
      profile.skills &&
        profile.skills.length > 0
        ? profile.skills
        : null,
      profile.cv_url,
      profile.profile_image_url,
    ];

    const completedFields =
      fields.filter(
        (field) =>
          field !== null &&
          field !== undefined &&
          field !== ""
      ).length;

    const profileCompletion = Math.round(
      (completedFields / fields.length) * 100
    );

    await pool.query(
      `
      UPDATE student_profiles
      SET profile_completion = $1
      WHERE user_id = $2
      `,
      [
        profileCompletion,
        req.user.id,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Student profile updated successfully.",
      profileCompletion,
    });
  } catch (error) {
    console.error(
      "Update student profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update student profile.",
      error: error.message,
    });
  }
};