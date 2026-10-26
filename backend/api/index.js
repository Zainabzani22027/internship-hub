import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Agar hum local machine par hain (Vercel par nahi), toh server start karo
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`InternShip Hub backend running on http://localhost:${PORT}`);
  });
}

// Vercel ke liye app export karna lazmi hai
export default app;