import bcrypt from "bcryptjs";
import pool from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    const fullName = "InternShip Hub Admin";
    const email = "admin@internshiphub.com";
    const password = "Admin@12345";

    const existingAdmin = await pool.query(
      `
      SELECT id, email, role
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("Admin account already exists.");
      console.log(existingAdmin.rows[0]);

      await pool.end();
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        auth_provider,
        is_active
      )
      VALUES (
        $1,
        $2,
        $3,
        'ADMIN',
        'EMAIL',
        TRUE
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
        fullName,
        email.toLowerCase(),
        passwordHash,
      ]
    );

    console.log("Admin account created successfully.");
    console.log(result.rows[0]);

    console.log("");
    console.log("Admin Email: admin@internshiphub.com");
    console.log("Admin Password: Admin@12345");

    await pool.end();
  } catch (error) {
    console.error("Create admin error:", error);
    await pool.end();
    process.exit(1);
  }
};

createAdmin();