import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";

// Student
import StudentHome from "./pages/student/StudentHome";
import Internships from "./pages/student/Internships";
import InternshipDetails from "./pages/student/InternshipDetails";
import MyApplications from "./pages/student/MyApplications";
import SavedInternships from "./pages/student/SavedInternships";
import StudentProfile from "./pages/student/StudentProfile";
import Certificates from "./pages/student/Certificates";
import Notifications from "./pages/student/Notifications";

// Company
import CompanyHome from "./pages/company/CompanyHome";
import PostInternship from "./pages/company/PostInternship";
import ManageInternships from "./pages/company/ManageInternships";
import CompanyInternshipDetails from "./pages/company/CompanyInternshipDetails";
import EditInternship from "./pages/company/EditInternship";
import Applications from "./pages/company/Applications";
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyCertificates from "./pages/company/CompanyCertificates";
import ApplicationDetails from "./pages/company/ApplicationDetails";

// Admin
import AdminHome from "./pages/admin/AdminHome";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageAdminInternships from "./pages/admin/ManageInternships";
import ManageCertificates from "./pages/admin/ManageCertificates";
import Reports from "./pages/admin/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC PAGES
        ========================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        {/* =========================
            STUDENT PANEL
        ========================== */}

        <Route
          path="/student"
          element={<StudentLayout />}
        >

          <Route
            index
            element={<StudentHome />}
          />

          <Route
            path="internships"
            element={<Internships />}
          />

          <Route
            path="internships/:id"
            element={<InternshipDetails />}
          />

          <Route
            path="applications"
            element={<MyApplications />}
          />

          <Route
            path="saved"
            element={<SavedInternships />}
          />

          <Route
            path="profile"
            element={<StudentProfile />}
          />

          <Route
            path="certificates"
            element={<Certificates />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

        </Route>

        {/* =========================
            COMPANY PANEL
        ========================== */}

        <Route
          path="/company"
          element={<CompanyHome />}
        />

        <Route
          path="/company/post-internship"
          element={<PostInternship />}
        />

        <Route
          path="/company/internships"
          element={<ManageInternships />}
        />

        <Route
          path="/company/internships/:id"
          element={<CompanyInternshipDetails />}
        />

        <Route
          path="/company/internships/:id/edit"
          element={<EditInternship />}
        />

        <Route
          path="/company/applications"
          element={<Applications />}
        />

        {/* Company Application Details */}
        <Route
          path="/company/applications/:id"
          element={<ApplicationDetails />}
        />

        <Route
          path="/company/profile"
          element={<CompanyProfile />}
        />

        <Route
          path="/company/certificates"
          element={<CompanyCertificates />}
        />

        {/* =========================
            ADMIN PANEL
        ========================== */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          <Route
            index
            element={<AdminHome />}
          />

          <Route
            path="students"
            element={<ManageStudents />}
          />

          <Route
            path="companies"
            element={<ManageCompanies />}
          />

          <Route
            path="internships"
            element={<ManageAdminInternships />}
          />

          <Route
            path="certificates"
            element={<ManageCertificates />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

        </Route>

        {/* =========================
            404 PAGE
        ========================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;