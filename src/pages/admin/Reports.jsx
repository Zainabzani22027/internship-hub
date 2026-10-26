import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowUp,
  FaBriefcase,
  FaBuilding,
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaUserGraduate,
} from "react-icons/fa";

import { apiGet } from "../../utils/api";

function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet("/admin/reports");

      setReportData(response);
    } catch (err) {
      console.error("Reports loading error:", err);
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAFE DATA HELPERS
  |--------------------------------------------------------------------------
  */

  const reports = Array.isArray(reportData?.reports)
    ? reportData.reports
    : Array.isArray(reportData?.data)
      ? reportData.data
      : [];

  const totalReports =
    Number(
      reportData?.count ??
        reportData?.total ??
        reports.length
    ) || 0;

  const dashboardStats = reportData?.stats || {};

  const totalStudents =
    Number(
      dashboardStats.totalStudents ??
        reportData?.totalStudents ??
        0
    ) || 0;

  const totalCompanies =
    Number(
      dashboardStats.totalCompanies ??
        reportData?.totalCompanies ??
        0
    ) || 0;

  const totalInternships =
    Number(
      dashboardStats.totalInternships ??
        reportData?.totalInternships ??
        0
    ) || 0;

  const totalApplications =
    Number(
      dashboardStats.totalApplications ??
        reportData?.totalApplications ??
        0
    ) || 0;

  const verifiedCompanies =
    Number(
      dashboardStats.verifiedCompanies ??
        reportData?.verifiedCompanies ??
        0
    ) || 0;

  const pendingReviews =
    Number(
      dashboardStats.pendingReviews ??
        reportData?.pendingReviews ??
        0
    ) || 0;

  const liveInternships =
    Number(
      dashboardStats.liveInternships ??
        reportData?.liveInternships ??
        0
    ) || 0;

  const certificates =
    Number(
      dashboardStats.certificates ??
        reportData?.certificates ??
        0
    ) || 0;

  /*
  |--------------------------------------------------------------------------
  | APPLICATION STATISTICS
  |--------------------------------------------------------------------------
  */

  const applicationStats = [
    {
      label: "Applied",
      value: Number(
        dashboardStats.applied ??
          reportData?.applied ??
          0
      ),
      percentage: 70,
      style: "bg-blue-500",
    },
    {
      label: "Under Review",
      value: Number(
        dashboardStats.underReview ??
          reportData?.underReview ??
          0
      ),
      percentage: 52,
      style: "bg-amber-500",
    },
    {
      label: "Shortlisted",
      value: Number(
        dashboardStats.shortlisted ??
          reportData?.shortlisted ??
          0
      ),
      percentage: 38,
      style: "bg-purple-500",
    },
    {
      label: "Selected",
      value: Number(
        dashboardStats.selected ??
          reportData?.selected ??
          0
      ),
      percentage: 25,
      style: "bg-green-500",
    },
    {
      label: "Rejected",
      value: Number(
        dashboardStats.rejected ??
          reportData?.rejected ??
          0
      ),
      percentage: 30,
      style: "bg-red-500",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | CATEGORY STATISTICS
  |--------------------------------------------------------------------------
  */

  const categoryStats = Array.isArray(
    reportData?.categoryStats
  )
    ? reportData.categoryStats
    : Array.isArray(
        dashboardStats.categoryStats
      )
      ? dashboardStats.categoryStats
      : [];

  /*
  |--------------------------------------------------------------------------
  | RECENT ACTIVITY
  |--------------------------------------------------------------------------
  */

  const recentActivity = reports
    .slice(0, 4)
    .map((item, index) => {
      const title =
        item.title ||
        item.report_type ||
        item.type ||
        "Platform Report";

      const description =
        item.description ||
        item.message ||
        "A platform report was created.";

      const time =
        item.created_at ||
        item.createdAt ||
        "Recently";

      const icons = [
        <FaBuilding />,
        <FaBriefcase />,
        <FaUserGraduate />,
        <FaCheckCircle />,
      ];

      const styles = [
        "bg-purple-50 text-[#6D5DFB]",
        "bg-blue-50 text-[#2563EB]",
        "bg-green-50 text-green-600",
        "bg-amber-50 text-amber-600",
      ];

      return {
        title,
        description,
        time,
        icon: icons[index],
        style: styles[index],
      };
    });

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-5 sm:p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#2563EB]"
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>

            <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
              ADMIN ANALYTICS
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 text-slate-500">
              Loading platform reports...
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2563EB]" />

            <p className="mt-4 font-semibold text-slate-500">
              Loading reports...
            </p>
          </div>

        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] transition hover:text-blue-700"
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>

            <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
              ADMIN ANALYTICS
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 text-slate-500">
              Monitor platform activity and understand InternShip Hub
              performance.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-[#2563EB]">
            <FaChartBar />
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Overview Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Students */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {totalStudents}
                </p>

                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600">
                  <FaArrowUp />
                  Platform Users
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#2563EB]">
                <FaUserGraduate />
              </div>

            </div>
          </div>

          {/* Companies */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Companies
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {totalCompanies}
                </p>

                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600">
                  <FaArrowUp />
                  Platform Companies
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl text-[#6D5DFB]">
                <FaBuilding />
              </div>

            </div>
          </div>

          {/* Internships */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Internships
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {totalInternships}
                </p>

                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600">
                  <FaArrowUp />
                  Platform Internships
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
                <FaBriefcase />
              </div>

            </div>
          </div>

          {/* Applications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Applications
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {totalApplications}
                </p>

                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600">
                  <FaArrowUp />
                  Platform Applications
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
                <FaFileAlt />
              </div>

            </div>
          </div>

        </div>

        {/* Application & Category Reports */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Application Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-[#0F172A]">
                Application Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current application distribution.
              </p>
            </div>

            <div className="space-y-5">

              {applicationStats.map((item) => (
                <div key={item.label}>

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-sm font-semibold text-slate-600">
                      {item.label}
                    </span>

                    <span className="text-sm font-bold text-[#0F172A]">
                      {item.value}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className={`h-full rounded-full ${item.style}`}
                      style={{
                        width:
                          item.value > 0
                            ? `${item.percentage}%`
                            : "0%",
                      }}
                    />

                  </div>

                </div>
              ))}

            </div>

          </section>

          {/* Internship Categories */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-xl font-extrabold text-[#0F172A]">
                Internship Categories
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Popular internship fields on the platform.
              </p>

            </div>

            {categoryStats.length > 0 ? (
              <div className="space-y-5">

                {categoryStats.map((item, index) => {

                  const value = Number(
                    item.value ??
                      item.count ??
                      0
                  );

                  const percentage =
                    Number(
                      item.percentage ??
                        Math.min(
                          value * 5,
                          100
                        )
                    ) || 0;

                  return (
                    <div
                      key={
                        item.name ||
                        item.category ||
                        index
                      }
                    >

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-sm font-semibold text-slate-600">
                          {item.name ||
                            item.category ||
                            "Category"}
                        </span>

                        <span className="text-sm font-bold text-[#0F172A]">
                          {value}
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#6D5DFB]"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <FaChartBar className="mx-auto text-2xl text-slate-300" />

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Category analytics are not available yet.
                </p>

              </div>
            )}

          </section>

        </div>

        {/* Platform Health */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Platform Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Important platform performance indicators.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Verified Companies */}
            <div className="rounded-xl bg-green-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm">
                  <FaCheckCircle />
                </div>

                <div>
                  <p className="text-xs font-semibold text-green-700">
                    Verified Companies
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-green-700">
                    {verifiedCompanies}
                  </p>
                </div>

              </div>

            </div>

            {/* Pending Reviews */}
            <div className="rounded-xl bg-amber-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
                  <FaClock />
                </div>

                <div>
                  <p className="text-xs font-semibold text-amber-700">
                    Pending Reviews
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-amber-700">
                    {pendingReviews}
                  </p>
                </div>

              </div>

            </div>

            {/* Live Internships */}
            <div className="rounded-xl bg-blue-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#2563EB] shadow-sm">
                  <FaBriefcase />
                </div>

                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    Live Internships
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-blue-700">
                    {liveInternships}
                  </p>
                </div>

              </div>

            </div>

            {/* Certificates */}
            <div className="rounded-xl bg-purple-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#6D5DFB] shadow-sm">
                  <FaCheckCircle />
                </div>

                <div>
                  <p className="text-xs font-semibold text-purple-700">
                    Certificates
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-purple-700">
                    {certificates}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Recent Activity */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Recent Platform Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest activities across InternShip Hub.
            </p>

          </div>

          {recentActivity.length > 0 ? (
            <div className="divide-y divide-slate-100">

              {recentActivity.map((activity, index) => (
                <div
                  key={`${activity.title}-${index}`}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activity.style}`}
                    >
                      {activity.icon}
                    </div>

                    <div>

                      <p className="font-bold text-[#0F172A]">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {activity.description}
                      </p>

                    </div>

                  </div>

                  <p className="text-xs font-semibold text-slate-400">
                    {activity.time}
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-8 text-center">

              <FaFileAlt className="mx-auto text-3xl text-slate-300" />

              <p className="mt-3 font-semibold text-slate-500">
                No platform reports available yet.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Reports will appear here when platform activity is recorded.
              </p>

            </div>
          )}

        </section>

        {/* Report Count */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-slate-500">
                Total Platform Reports
              </p>

              <p className="mt-1 text-3xl font-extrabold text-[#0F172A]">
                {totalReports}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#2563EB]">
              <FaFileAlt />
            </div>

          </div>

        </section>

        {/* Final Information */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-[#2563EB] to-[#6D5DFB] p-6 text-white sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-blue-100">
                PLATFORM INSIGHTS
              </p>

              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                Monitor growth and maintain platform quality.
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                Use reports to monitor students, companies, internships,
                applications and certificates across InternShip Hub.
              </p>

            </div>

            <Link
              to="/admin"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#2563EB] transition hover:bg-blue-50"
            >
              Back to Dashboard
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

export default Reports;