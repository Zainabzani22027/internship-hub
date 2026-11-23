import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createRemoteJWKSet,
  jwtVerify,
} from "jose";

import pool from "../config/db.js";

import {
  findUserByEmail,
  findUserById,
  findUserByProvider,
} from "../models/userModel.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;

const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:5000/api/auth/google/callback";

const APPLE_CLIENT_ID =
  process.env.APPLE_CLIENT_ID;

const APPLE_TEAM_ID =
  process.env.APPLE_TEAM_ID;

const APPLE_KEY_ID =
  process.env.APPLE_KEY_ID;

const APPLE_PRIVATE_KEY =
  process.env.APPLE_PRIVATE_KEY;

const APPLE_REDIRECT_URI =
  process.env.APPLE_REDIRECT_URI ||
  "http://localhost:5000/api/auth/apple/callback";

/*
|--------------------------------------------------------------------------
| JWT
|--------------------------------------------------------------------------
*/

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/*
|--------------------------------------------------------------------------
| OAUTH STATE
|--------------------------------------------------------------------------
*/

const generateOAuthState = ({
  provider,
  mode,
  role,
  companyName,
}) => {
  return jwt.sign(
    {
      provider,
      mode,
      role,
      companyName:
        companyName || "",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
};

const verifyOAuthState = (state) => {
  return jwt.verify(
    state,
    process.env.JWT_SECRET
  );
};

/*
|--------------------------------------------------------------------------
| REDIRECT HELPER
|--------------------------------------------------------------------------
*/

const redirectWithError = (
  res,
  message
) => {
  const encodedMessage =
    encodeURIComponent(message);

  return res.redirect(
    `${FRONTEND_URL}/auth/callback?error=${encodedMessage}`
  );
};

/*
|--------------------------------------------------------------------------
| ROLE NORMALIZATION
|--------------------------------------------------------------------------
*/

const normalizeRole = (role) => {
  const normalized =
    String(role || "STUDENT")
      .toUpperCase();

  if (
    !["STUDENT", "COMPANY"].includes(
      normalized
    )
  ) {
    return "STUDENT";
  }

  return normalized;
};

/*
|--------------------------------------------------------------------------
| CREATE SOCIAL USER
|--------------------------------------------------------------------------
*/

const createSocialUser = async ({
  fullName,
  email,
  provider,
  providerUid,
  role,
  companyName,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        auth_provider,
        provider_uid
      )
      VALUES (
        $1,
        $2,
        NULL,
        $3,
        $4,
        $5
      )
      RETURNING
        id,
        full_name,
        email,
        role,
        auth_provider,
        provider_uid,
        is_active,
        created_at
      `,
      [
        fullName.trim(),
        email.trim().toLowerCase(),
        role,
        provider,
        providerUid,
      ]
    );

    const user =
      result.rows[0];

    if (role === "STUDENT") {
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

    if (role === "COMPANY") {
      const finalCompanyName =
        companyName?.trim() ||
        fullName.trim();

      await client.query(
        `
        INSERT INTO companies (
          user_id,
          company_name,
          verification_status
        )
        VALUES ($1, $2, 'PENDING')
        `,
        [
          user.id,
          finalCompanyName,
        ]
      );
    }

    await client.query("COMMIT");

    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/*
|--------------------------------------------------------------------------
| COMPLETE SOCIAL LOGIN
|--------------------------------------------------------------------------
*/

const completeSocialAuthentication = async ({
  provider,
  providerUid,
  email,
  fullName,
  mode,
  role,
  companyName,
}) => {
  let user =
    await findUserByProvider(
      provider,
      providerUid
    );

  /*
  |--------------------------------------------------------------------------
  | Existing provider account
  |--------------------------------------------------------------------------
  */

  if (user) {
    if (!user.is_active) {
      throw new Error(
        "Your account is currently inactive."
      );
    }

    return user;
  }

  /*
  |--------------------------------------------------------------------------
  | Existing email account
  |--------------------------------------------------------------------------
  */

  user =
    await findUserByEmail(email);

  if (user) {
    if (!user.is_active) {
      throw new Error(
        "Your account is currently inactive."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Link verified social account with existing email
    |--------------------------------------------------------------------------
    */

    const result =
      await pool.query(
        `
        UPDATE users
        SET
          provider_uid = $1,
          auth_provider = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING
          id,
          full_name,
          email,
          role,
          auth_provider,
          provider_uid,
          is_active,
          created_at,
          updated_at
        `,
        [
          providerUid,
          provider,
          user.id,
        ]
      );

    return result.rows[0];
  }

  /*
  |--------------------------------------------------------------------------
  | Login mode should NOT silently create account
  |--------------------------------------------------------------------------
  */

  if (mode === "login") {
    throw new Error(
      "No account was found for this social account. Please use Sign Up first."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Create new social account
  |--------------------------------------------------------------------------
  */

  const normalizedRole =
    normalizeRole(role);

  return createSocialUser({
    fullName:
      fullName || "InternShipHub User",
    email,
    provider,
    providerUid,
    role: normalizedRole,
    companyName,
  });
};

/*
|--------------------------------------------------------------------------
| EMAIL REGISTER
|--------------------------------------------------------------------------
*/

export const register = async (
  req,
  res
) => {
  const client =
    await pool.connect();

  try {
    const {
      fullName,
      email,
      password,
      role,
      companyName,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, email, password and role are required.",
      });
    }

    const normalizedRole =
      role.toUpperCase();

    if (
      !["STUDENT", "COMPANY"].includes(
        normalizedRole
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Role must be STUDENT or COMPANY.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    if (
      normalizedRole === "COMPANY" &&
      !companyName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name is required.",
      });
    }

    const existingUser =
      await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    await client.query("BEGIN");

    const userResult =
      await client.query(
        `
        INSERT INTO users (
          full_name,
          email,
          password_hash,
          role,
          auth_provider
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          'EMAIL'
        )
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

    const user =
      userResult.rows[0];

    if (
      normalizedRole === "STUDENT"
    ) {
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

    if (
      normalizedRole === "COMPANY"
    ) {
      await client.query(
        `
        INSERT INTO companies (
          user_id,
          company_name,
          verification_status
        )
        VALUES (
          $1,
          $2,
          'PENDING'
        )
        `,
        [
          user.id,
          companyName.trim(),
        ]
      );
    }

    await client.query("COMMIT");

    const token =
      generateToken(user);

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create account.",
    });
  } finally {
    client.release();
  }
};

/*
|--------------------------------------------------------------------------
| EMAIL LOGIN
|--------------------------------------------------------------------------
*/

export const login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const user =
      await findUserByEmail(
        email.trim()
      );

    if (
      !user ||
      !user.password_hash
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is currently inactive.",
      });
    }

    const token =
      generateToken(user);

    return res.status(200).json({
      success: true,
      message:
        "Login successful.",
      token,
      user: {
        id: user.id,
        fullName:
          user.full_name,
        email: user.email,
        role: user.role,
        authProvider:
          user.auth_provider,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to login.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GOOGLE LOGIN / SIGNUP
|--------------------------------------------------------------------------
*/

export const googleAuth = async (
  req,
  res
) => {
  try {
    if (
      !GOOGLE_CLIENT_ID ||
      !GOOGLE_CLIENT_SECRET
    ) {
      return redirectWithError(
        res,
        "Google authentication is not configured yet."
      );
    }

    const mode =
      req.query.mode === "signup"
        ? "signup"
        : "login";

    const role =
      normalizeRole(
        req.query.role
      );

    const companyName =
      String(
        req.query.companyName || ""
      );

    const state =
      generateOAuthState({
        provider: "GOOGLE",
        mode,
        role,
        companyName,
      });

    const params =
      new URLSearchParams({
        client_id:
          GOOGLE_CLIENT_ID,
        redirect_uri:
          GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope:
          "openid email profile",
        state,
        access_type: "online",
        prompt: "select_account",
      });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  } catch (error) {
    console.error(
      "Google auth start error:",
      error
    );

    return redirectWithError(
      res,
      "Unable to start Google authentication."
    );
  }
};

/*
|--------------------------------------------------------------------------
| GOOGLE CALLBACK
|--------------------------------------------------------------------------
*/

export const googleCallback =
  async (req, res) => {
    try {
      const {
        code,
        state,
        error,
      } = req.query;

      if (error) {
        return redirectWithError(
          res,
          "Google authentication was cancelled."
        );
      }

      if (!code || !state) {
        return redirectWithError(
          res,
          "Invalid Google authentication response."
        );
      }

      const stateData =
        verifyOAuthState(state);

      if (
        stateData.provider !==
        "GOOGLE"
      ) {
        return redirectWithError(
          res,
          "Invalid authentication state."
        );
      }

      const tokenResponse =
        await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body:
              new URLSearchParams({
                code,
                client_id:
                  GOOGLE_CLIENT_ID,
                client_secret:
                  GOOGLE_CLIENT_SECRET,
                redirect_uri:
                  GOOGLE_REDIRECT_URI,
                grant_type:
                  "authorization_code",
              }),
          }
        );

      const tokenData =
        await tokenResponse.json();

      if (
        !tokenResponse.ok ||
        !tokenData.access_token
      ) {
        console.error(
          "Google token error:",
          tokenData
        );

        return redirectWithError(
          res,
          "Unable to complete Google authentication."
        );
      }

      const userInfoResponse =
        await fetch(
          "https://openidconnect.googleapis.com/v1/userinfo",
          {
            headers: {
              Authorization:
                `Bearer ${tokenData.access_token}`,
            },
          }
        );

      const googleUser =
        await userInfoResponse.json();

      if (
        !userInfoResponse.ok ||
        !googleUser.email ||
        !googleUser.sub
      ) {
        return redirectWithError(
          res,
          "Unable to read Google account information."
        );
      }

      const user =
        await completeSocialAuthentication(
          {
            provider: "GOOGLE",
            providerUid:
              googleUser.sub,
            email:
              googleUser.email,
            fullName:
              googleUser.name ||
              googleUser.email.split("@")[0],
            mode:
              stateData.mode,
            role:
              stateData.role,
            companyName:
              stateData.companyName,
          }
        );

      const appToken =
        generateToken(user);

      return res.redirect(
        `${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(appToken)}`
      );
    } catch (error) {
      console.error(
        "Google callback error:",
        error
      );

      return redirectWithError(
        res,
        error.message ||
          "Google authentication failed."
      );
    }
  };

/*
|--------------------------------------------------------------------------
| APPLE CLIENT SECRET
|--------------------------------------------------------------------------
*/

const createAppleClientSecret =
  () => {
    if (
      !APPLE_TEAM_ID ||
      !APPLE_KEY_ID ||
      !APPLE_CLIENT_ID ||
      !APPLE_PRIVATE_KEY
    ) {
      throw new Error(
        "Apple authentication environment variables are missing."
      );
    }

    const privateKey =
      APPLE_PRIVATE_KEY.replace(
        /\\n/g,
        "\n"
      );

    const now =
      Math.floor(
        Date.now() / 1000
      );

    return jwt.sign(
      {
        iss: APPLE_TEAM_ID,
        iat: now,
        exp:
          now + 60 * 60 * 24 * 150,
        aud:
          "https://appleid.apple.com",
        sub:
          APPLE_CLIENT_ID,
      },
      privateKey,
      {
        algorithm: "ES256",
        keyid: APPLE_KEY_ID,
      }
    );
  };

/*
|--------------------------------------------------------------------------
| APPLE AUTH START
|--------------------------------------------------------------------------
*/

export const appleAuth = async (
  req,
  res
) => {
  try {
    const mode =
      req.query.mode === "signup"
        ? "signup"
        : "login";

    const role =
      normalizeRole(
        req.query.role
      );

    const companyName =
      String(
        req.query.companyName || ""
      );

    const state =
      generateOAuthState({
        provider: "APPLE",
        mode,
        role,
        companyName,
      });

    const params =
      new URLSearchParams({
        client_id:
          APPLE_CLIENT_ID,
        redirect_uri:
          APPLE_REDIRECT_URI,
        response_type: "code",
        response_mode: "form_post",
        scope: "name email",
        state,
      });

    return res.redirect(
      `https://appleid.apple.com/auth/authorize?${params.toString()}`
    );
  } catch (error) {
    console.error(
      "Apple auth start error:",
      error
    );

    return redirectWithError(
      res,
      "Unable to start Apple authentication."
    );
  }
};

/*
|--------------------------------------------------------------------------
| APPLE PUBLIC KEYS
|--------------------------------------------------------------------------
*/

const appleJWKS =
  createRemoteJWKSet(
    new URL(
      "https://appleid.apple.com/auth/keys"
    )
  );

/*
|--------------------------------------------------------------------------
| APPLE CALLBACK
|--------------------------------------------------------------------------
*/

export const appleCallback =
  async (req, res) => {
    try {
      const {
        code,
        state,
        error,
        user: appleUserData,
      } = req.body;

      if (error) {
        return redirectWithError(
          res,
          "Apple authentication was cancelled."
        );
      }

      if (!code || !state) {
        return redirectWithError(
          res,
          "Invalid Apple authentication response."
        );
      }

      const stateData =
        verifyOAuthState(state);

      if (
        stateData.provider !==
        "APPLE"
      ) {
        return redirectWithError(
          res,
          "Invalid authentication state."
        );
      }

      const clientSecret =
        createAppleClientSecret();

      const tokenResponse =
        await fetch(
          "https://appleid.apple.com/auth/token",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body:
              new URLSearchParams({
                client_id:
                  APPLE_CLIENT_ID,
                client_secret:
                  clientSecret,
                code,
                grant_type:
                  "authorization_code",
                redirect_uri:
                  APPLE_REDIRECT_URI,
              }),
          }
        );

      const tokenData =
        await tokenResponse.json();

      if (
        !tokenResponse.ok ||
        !tokenData.id_token
      ) {
        console.error(
          "Apple token error:",
          tokenData
        );

        return redirectWithError(
          res,
          "Unable to complete Apple authentication."
        );
      }

      const verified =
        await jwtVerify(
          tokenData.id_token,
          appleJWKS,
          {
            issuer:
              "https://appleid.apple.com",
            audience:
              APPLE_CLIENT_ID,
          }
        );

      const claims =
        verified.payload;

      const providerUid =
        String(claims.sub || "");

      const email =
        claims.email ||
        "";

      if (!providerUid || !email) {
        return redirectWithError(
          res,
          "Apple did not provide the required account information."
        );
      }

      let firstName = "";
      let lastName = "";

      if (appleUserData) {
        try {
          const parsed =
            typeof appleUserData ===
            "string"
              ? JSON.parse(
                  appleUserData
                )
              : appleUserData;

          firstName =
            parsed?.name?.firstName ||
            "";

          lastName =
            parsed?.name?.lastName ||
            "";
        } catch {
          // Ignore invalid optional Apple name data.
        }
      }

      const fullName =
        `${firstName} ${lastName}`
          .trim() ||
        email.split("@")[0];

      const user =
        await completeSocialAuthentication(
          {
            provider: "APPLE",
            providerUid,
            email,
            fullName,
            mode:
              stateData.mode,
            role:
              stateData.role,
            companyName:
              stateData.companyName,
          }
        );

      const appToken =
        generateToken(user);

      return res.redirect(
        `${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(appToken)}`
      );
    } catch (error) {
      console.error(
        "Apple callback error:",
        error
      );

      return redirectWithError(
        res,
        error.message ||
          "Apple authentication failed."
      );
    }
  };

/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
*/

export const getMe = async (
  req,
  res
) => {
  try {
    const user =
      await findUserById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get user information.",
    });
  }
};