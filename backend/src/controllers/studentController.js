import pool from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Calculate Student Profile Completion
|--------------------------------------------------------------------------
*/

const calculateProfileCompletion = ({
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
}) => {
  const fields = [
    fullName,
    phone,
    country,
    city,
    university,
    degree,
    graduationYear,
    about,
    cvUrl,
    profileImageUrl,
  ];

  let completed = fields.filter(
    (field) =>
      field !== null &&
      field !== undefined &&
      String(field).trim() !== ""
  ).length;

  if (Array.isArray(skills) && skills.length > 0) {
    completed += 1;
  }

  const totalFields = 11;

  return Math.round((completed / totalFields) * 100);
};

/*
|--------------------------------------------------------------------------
| GET STUDENT PROFILE
|--------------------------------------------------------------------------
| GET /api/students/profile
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
        u.is_active,

        sp.id AS profile_id,
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

      INNER JOIN student_profiles sp
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
    console.error("Get student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get student profile.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE STUDENT PROFILE
|--------------------------------------------------------------------------
| PUT /api/students/profile
|--------------------------------------------------------------------------
*/

export const updateStudentProfile = async (req, res) => {
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

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!fullName || fullName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Skills Validation
    |--------------------------------------------------------------------------
    */

    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Graduation Year Validation
    |--------------------------------------------------------------------------
    */

    let validGraduationYear = null;

    if (
      graduationYear !== undefined &&
      graduationYear !== null &&
      graduationYear !== ""
    ) {
      validGraduationYear = Number(graduationYear);

      if (
        !Number.isInteger(validGraduationYear) ||
        validGraduationYear < 2000 ||
        validGraduationYear > 2100
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid graduation year.",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Database Transaction
    |--------------------------------------------------------------------------
    */

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /*
      |--------------------------------------------------------------------------
      | Update Users Table
      |--------------------------------------------------------------------------
      */

      const userResult = await client.query(
        `
        UPDATE users

        SET
          full_name = $1,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $2
          AND role = 'STUDENT'

        RETURNING
          id,
          full_name,
          email,
          role,
          is_active
        `,
        [
          fullName.trim(),
          req.user.id,
        ]
      );

      if (userResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Student user account not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Prepare Skills
      |--------------------------------------------------------------------------
      */

      const studentSkills = Array.isArray(skills)
        ? skills
            .filter(
              (skill) =>
                skill !== null &&
                skill !== undefined &&
                String(skill).trim() !== ""
            )
            .map((skill) => String(skill).trim())
        : [];

      /*
      |--------------------------------------------------------------------------
      | Calculate Profile Completion
      |--------------------------------------------------------------------------
      */

      const profileCompletion = calculateProfileCompletion({
        fullName: fullName.trim(),
        phone,
        country,
        city,
        university,
        degree,
        graduationYear: validGraduationYear,
        about,
        skills: studentSkills,
        cvUrl,
        profileImageUrl,
      });

      /*
      |--------------------------------------------------------------------------
      | Update Student Profile
      |--------------------------------------------------------------------------
      */

      const profileResult = await client.query(
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
          profile_image_url = $10,
          profile_completion = $11,
          updated_at = CURRENT_TIMESTAMP

        WHERE user_id = $12

        RETURNING
          id,
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
          profile_completion,
          created_at,
          updated_at
        `,
        [
          phone?.trim() || null,
          country?.trim() || null,
          city?.trim() || null,
          university?.trim() || null,
          degree?.trim() || null,
          validGraduationYear,
          about?.trim() || null,
          studentSkills,
          cvUrl?.trim() || null,
          profileImageUrl?.trim() || null,
          profileCompletion,
          req.user.id,
        ]
      );

      if (profileResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Student profile not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Commit Transaction
      |--------------------------------------------------------------------------
      */

      await client.query("COMMIT");

      /*
      |--------------------------------------------------------------------------
      | Success Response
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,
        message: "Student profile updated successfully.",
        profile: {
          user: userResult.rows[0],
          studentProfile: profileResult.rows[0],
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update student profile.",
    });
  }
};