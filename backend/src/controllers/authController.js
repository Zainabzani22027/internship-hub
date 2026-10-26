import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import pool from "../config/db.js";

import {
  findUserByEmail,
  findUserById,
  createUser,
  createStudentProfile,
  createCompanyProfile,
} from "../models/userModel.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

export const register = async (req, res) => {
  const client = await pool.connect();

  try {
    const { fullName, email, password, role, companyName } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password and role are required.",
      });
    }

    const normalizedRole = role.toUpperCase();

    if (!["STUDENT", "COMPANY"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be STUDENT or COMPANY.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    if (normalizedRole === "COMPANY" && !companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await client.query("BEGIN");

    const userResult = await client.query(
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
      [
        fullName.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        normalizedRole,
      ]
    );

    const user = userResult.rows[0];

    if (normalizedRole === "STUDENT") {
      await client.query(
        `
        INSERT INTO student_profiles (
          user_id,
          profile_completion
        )
        VALUES ($1, 10)
        `,
        [user.id]
      );
    }

    if (normalizedRole === "COMPANY") {
      await client.query(
        `
        INSERT INTO companies (
          user_id,
          company_name,
          verification_status
        )
        VALUES ($1, $2, 'PENDING')
        `,
        [user.id, companyName.trim()]
      );
    }

    await client.query("COMMIT");

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  } finally {
    client.release();
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await findUserByEmail(email.trim());

    if (!user || !user.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        authProvider: user.auth_provider,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get user information.",
    });
  }
};