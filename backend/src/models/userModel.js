import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
    `,
    [email]
  );

  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      id,
      full_name,
      email,
      role,
      auth_provider,
      provider_uid,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0];
};

export const createUser = async ({
  fullName,
  email,
  passwordHash,
  role,
}) => {
  const result = await pool.query(
    `
    INSERT INTO users (
      full_name,
      email,
      password_hash,
      role,
      auth_provider
    )
    VALUES ($1, $2, $3, $4, 'EMAIL')
    RETURNING
      id,
      full_name,
      email,
      role,
      auth_provider,
      is_active,
      created_at
    `,
    [fullName, email.toLowerCase(), passwordHash, role]
  );

  return result.rows[0];
};

export const createStudentProfile = async (userId) => {
  const result = await pool.query(
    `
    INSERT INTO student_profiles (
      user_id,
      profile_completion
    )
    VALUES ($1, 10)
    RETURNING *
    `,
    [userId]
  );

  return result.rows[0];
};

export const createCompanyProfile = async (userId, companyName) => {
  const result = await pool.query(
    `
    INSERT INTO companies (
      user_id,
      company_name,
      verification_status
    )
    VALUES ($1, $2, 'PENDING')
    RETURNING *
    `,
    [userId, companyName]
  );

  return result.rows[0];
};