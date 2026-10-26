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

const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| CORS CONFIGURATION
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "http://localhost:5173",
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
| HEALTH ROUTE
|--------------------------------------------------------------------------
*/

app.use("/api/health", healthRoutes);

/*
|--------------------------------------------------------------------------
| AUTHENTICATION ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| STUDENT ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/students", studentRoutes);

/*
|--------------------------------------------------------------------------
| STUDENT PROFILE ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/student",
  studentProfileRoutes
);

/*
|--------------------------------------------------------------------------
| COMPANY ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/companies", companyRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN COMPANY VERIFICATION ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/admin", adminCompanyRoutes);

/*
|--------------------------------------------------------------------------
| CATEGORY ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/categories",
  categoryRoutes
);

/*
|--------------------------------------------------------------------------
| INTERNSHIP ROUTES
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
| APPLICATION ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/applications",
  applicationRoutes
);

/*
|--------------------------------------------------------------------------
| COMPANY APPLICATION ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/company",
  companyApplicationRoutes
);

/*
|--------------------------------------------------------------------------
| SAVED INTERNSHIP ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/saved-internships",
  savedInternshipRoutes
);

/*
|--------------------------------------------------------------------------
| CERTIFICATE ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/certificates",
  certificateRoutes
);

/*
|--------------------------------------------------------------------------
| NOTIFICATION ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/notifications",
  notificationRoutes
);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin",
  adminRoutes
);

/*
|--------------------------------------------------------------------------
| 404 - ROUTE NOT FOUND
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

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(
    `InternShip Hub backend running on http://localhost:${PORT}`
  );
});