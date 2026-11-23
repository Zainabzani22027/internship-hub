import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`InternShipHub API running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Backend startup error:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("Shutting down backend server...");
  server.close(() => {
    process.exit(0);
  });
});