import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Local environment ke liye app.listen chalega
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(
      `InternShip Hub backend running on http://localhost:${PORT}`
    );
  });
}

// Vercel ke liye app export karna zaroori hai
export default app;