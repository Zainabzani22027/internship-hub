import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBriefcase,
  FaBuilding,
  FaCertificate,
  FaChartLine,
  FaCheckCircle,
  FaFileAlt,
  FaUserGraduate,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import { apiGet } from "../../utils/api";

function AdminHome() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet("/admin/dashboard");

      setDashboard(
        response?.dashboard ||
          response?.stats ||
          response?.data ||
          response
      );
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.message || "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const getNumber = (...values) => {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== "") {
        const number = Number(value);

        if (!Number.isNaN(number)) {
          return number;
        }
      }
    }

    return 0;
  };

  const totalStudents = getNumber(
    dashboard?.totalStudents,
    dashboard?.total_students,
    dashboard?.students,
    dashboard?.studentCount,
    dashboard?.student_count
  );

  const totalCompanies = getNumber(
    dashboard?.totalCompanies,
    dashboard?.total_companies,
    dashboard?.companies,
    dashboard?.companyCount,
    dashboard?.company_count
  );

  const totalInternships = getNumber(
    dashboard?.totalInternships,
    dashboard?.total_internships,
    dashboard?.internships,
    dashboard?.internshipCount,
    dashboard?.internship_count
  );

  const totalApplications = getNumber(
    dashboard?.totalApplications,
    dashboard?.total_applications,
    dashboard?.applications,
    dashboard?.applicationCount,
    dashboard?.application_count
  );

  const pendingCompanies = getNumber(
    dashboard?.pendingCompanies,
    dashboard?.pending_companies,
    dashboard?.pendingCompanyVerifications,
    dashboard?.pending_company_verifications
  );

  const pendingInternships = getNumber(
    dashboard?.pendingInternships,
    dashboard?.pending_internships,
    dashboard?.pendingInternshipApprovals,
    dashboard?.pending_internship_approvals
  );

  const statistics = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: <FaUserGraduate />,
      style: "bg-blue-50 text-[#2563EB]",
    },
    {
      title: "Total Companies",
      value: totalCompanies,
      icon: <FaBuilding />,
      style: "bg-purple-50 text-[#6D5DFB]",
    },
    {
      title: "Internships",
      value: totalInternships,
      icon: <FaBriefcase />,
      style: "bg-green-50 text-green-600",
    },
    {
      title: "Applications",
      value: totalApplications,
      icon: <FaFileAlt />,
      style: "bg-amber-50 text-amber-600",
    },
  ];

  const managementCards = [
    {
      title: "Manage Students",
      description: "View, manage and control registered student accounts.",
      icon: <FaUserGraduate />,
      path: "/admin/students",
      style: "bg-blue-50 text-[#2563EB]",
    },
    {
      title: "Manage Companies",
      description: "Review companies and manage company verification.",
      icon: <FaBuilding />,
      path: "/admin/companies",
      style: "bg-purple-50 text-[#6D5DFB]",
    },
    {
      title: "Manage Internships",
      description: "Approve, reject and manage internship postings.",
      icon: <FaBriefcase />,
      path: "/admin/internships",
      style: "bg-green-50 text-green-600",
    },
    {
      title: "Manage Certificates",
      description: "Monitor and manage internship certificates.",
      icon: <FaCertificate />,
      path: "/admin/certificates",
      style: "bg-amber-50 text-amber-600",
    },
    {
      title: "Reports",
      description: "View platform reports and system activity.",
      icon: <FaChartLine />,
      path: "/admin/reports",
      style: "bg-red-50 text-red-600",
    },
  ];

  const totalPendingActions =
    pendingCompanies + pendingInternships;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
              ADMIN PANEL
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Manage students, companies, internships and platform activities.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] font-bold text-white">
              A
            </div>

            <div>
              <p className="text-sm font-bold text-[#0F172A]">
                Administrator
              </p>

              <p className="text-xs text-slate-500">
                Admin Account
              </p>
            </div>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {statistics.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                    {loading ? "..." : item.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.style}`}
                >
                  {item.icon}
                </div>

              </div>
            </div>
          ))}

        </div>

        {/* Quick Management */}
        <section className="mt-8">

          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-[#0F172A]">
              Platform Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage the main areas of InternShip Hub.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {managementCards.map((card) => (
              <Link
                key={card.title}
                to={card.path}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.style}`}
                  >
                    {card.icon}
                  </div>

                  <FaArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2563EB]" />

                </div>

                <h3 className="mt-5 text-lg font-bold text-[#0F172A]">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {card.description}
                </p>

                <p className="mt-4 text-sm font-bold text-[#2563EB]">
                  Open Management →
                </p>

              </Link>
            ))}

          </div>

        </section>

        {/* Pending Actions */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <FaClock />
              </div>

              <div>
                <h2 className="font-extrabold text-[#0F172A]">
                  Pending Admin Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Loading pending actions..."
                    : totalPendingActions > 0
                    ? `${pendingCompanies} company verification(s) and ${pendingInternships} internship approval(s) require attention.`
                    : "There are currently no pending companies or internship submissions."}
                </p>
              </div>

            </div>

            <Link
              to="/admin/internships"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Review Internships
              <FaArrowRight />
            </Link>

          </div>

        </section>

        {/* Admin Responsibilities */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-[#2563EB] to-[#6D5DFB] p-6 text-white sm:p-8">

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-100">
                ADMIN CONTROL
              </p>

              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                Keep InternShip Hub safe and professional.
              </h2>

              <p className="mt-3 max-w-xl leading-7 text-blue-100">
                Admins verify companies, approve internship opportunities,
                manage users and monitor platform activity.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl bg-white/10 p-4">
                <FaCheckCircle className="mb-2" />
                <p className="text-sm font-semibold">
                  Company Verification
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <FaCheckCircle className="mb-2" />
                <p className="text-sm font-semibold">
                  Internship Approval
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <FaCheckCircle className="mb-2" />
                <p className="text-sm font-semibold">
                  User Management
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <FaCheckCircle className="mb-2" />
                <p className="text-sm font-semibold">
                  Reports & Monitoring
                </p>
              </div>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default AdminHome;