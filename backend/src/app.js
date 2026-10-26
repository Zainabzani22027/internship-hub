import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// API Routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import adminCompanyRoutes from "./routes/adminCompanyRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminInternshipRoutes from "./routes/adminInternshipRoutes.js";
import studentInternshipRoutes from "./routes/studentInternshipRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import companyApplicationRoutes from "./routes/companyApplicationRoutes.js";
import savedInternshipRoutes from "./routes/savedInternshipRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| BODY PARSING
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| UPLOADED FILES
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

/*
|--------------------------------------------------------------------------
| ROOT API
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to InternShip Hub API",
    status: "Backend is running",
  });
});

/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

app.use("/api/health", healthRoutes);

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| STUDENT
|--------------------------------------------------------------------------
*/

app.use("/api/students", studentRoutes);

app.use(
  "/api/student",
  studentProfileRoutes
);

/*
|--------------------------------------------------------------------------
| COMPANY
|--------------------------------------------------------------------------
*/

app.use("/api/companies", companyRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN COMPANY VERIFICATION
|--------------------------------------------------------------------------
*/

app.use("/api/admin", adminCompanyRoutes);

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/categories",
  categoryRoutes
);

/*
|--------------------------------------------------------------------------
| INTERNSHIPS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/internships",
  internshipRoutes
);

app.use(
  "/api/admin",
  adminInternshipRoutes
);

app.use(
  "/api/student",
  studentInternshipRoutes
);

/*
|--------------------------------------------------------------------------
| APPLICATIONS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/company",
  companyApplicationRoutes
);

/*
|--------------------------------------------------------------------------
| SAVED INTERNSHIPS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/saved-internships",
  savedInternshipRoutes
);

/*
|--------------------------------------------------------------------------
| CERTIFICATES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/certificates",
  certificateRoutes
);

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/notifications",
  notificationRoutes
);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin",
  adminRoutes
);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error(
    "Global server error:",
    error
  );

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

export default app;