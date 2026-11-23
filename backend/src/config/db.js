
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const dbHost = process.env.DB_HOST || "";

const isLocalDatabase =
  dbHost === "localhost" ||
  dbHost === "127.0.0.1" ||
  dbHost === "::1";

const useSSL = process.env.DB_SSL
  ? process.env.DB_SSL.toLowerCase() === "true"
  : !isLocalDatabase;

const pool = new Pool({
  host: dbHost,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: useSSL
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("connect", () => {
  console.log("PostgreSQL database connected successfully.");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

export default pool;