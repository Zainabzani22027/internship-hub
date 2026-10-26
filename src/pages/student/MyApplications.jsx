import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";

import { apiGet } from "../../utils/api";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/applications/student");

      setApplications(data.applications || []);
    } catch (err) {
      setError(
        err.message || "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "UNDER_REVIEW":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "SHORTLISTED":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "INTERVIEW":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "SELECTED":
        return "bg-green-50 text-green-700 border-green-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      case "WITHDRAWN":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "APPLIED":
        return "Applied";

      case "UNDER_REVIEW":
        return "Under Review";

      case "SHORTLISTED":
        return "Shortlisted";

      case "INTERVIEW":
        return "Interview";

      case "SELECTED":
        return "Selected";

      case "REJECTED":
        return "Rejected";

      case "WITHDRAWN":
        return "Withdrawn";

      default:
        return status || "Unknown";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
                <FiBriefcase size={22} />
              </div>

              <h1 className="text-3xl font-bold text-[#0F172A]">
                My Applications
              </h1>

            </div>

            <p className="text-[#64748B]">
              Track the internships you have applied for.
            </p>
          </div>

          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2">

            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 h-6 w-3/4 rounded bg-slate-200" />

                <div className="mb-3 h-4 w-1/2 rounded bg-slate-200" />

                <div className="mb-6 h-20 rounded bg-slate-200" />

                <div className="h-10 rounded bg-slate-200" />
              </div>
            ))}

          </div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FiBriefcase size={28} />
            </div>

            <h2 className="text-2xl font-bold text-[#0F172A]">
              No Applications Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-[#64748B]">
              You haven't applied to any internships yet.
              Start exploring internships and apply for
              opportunities that match your skills.
            </p>

            <Link
              to="/student/internships"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition hover:opacity-95"
            >
              Explore Internships
              <FiArrowRight />
            </Link>

          </div>
        )}

        {/* Applications */}
        {!loading && applications.length > 0 && (
          <div className="space-y-5">

            {applications.map((application) => (
              <div
                key={application.application_id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                  {/* Application Information */}
                  <div className="flex-1">

                    {/* Title and Status */}
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">

                      <div>

                        <p className="mb-1 text-sm font-semibold text-blue-600">
                          {application.company_name}
                        </p>

                        <h2 className="text-2xl font-bold text-[#0F172A]">
                          {application.internship_title}
                        </h2>

                        {application.category_name && (
                          <p className="mt-1 text-sm text-slate-500">
                            {application.category_name}
                          </p>
                        )}

                      </div>

                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-bold ${getStatusStyle(
                          application.status
                        )}`}
                      >
                        {getStatusText(application.status)}
                      </span>

                    </div>

                    {/* Details */}
                    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiMapPin className="shrink-0 text-blue-600" />

                        <span>
                          {application.city
                            ? `${application.city}, `
                            : ""}
                          {application.country ||
                            "Location N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiClock className="shrink-0 text-purple-600" />

                        <span>
                          {application.duration ||
                            "Duration N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiBriefcase className="shrink-0 text-blue-600" />

                        <span>
                          {application.work_mode ||
                            "Work mode N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiCalendar className="shrink-0 text-green-600" />

                        <span>
                          Applied{" "}
                          {formatDate(
                            application.applied_at
                          )}
                        </span>
                      </div>

                    </div>

                    {/* Description */}
                    {application.description && (
                      <p className="mb-5 line-clamp-2 text-sm leading-6 text-[#64748B]">
                        {application.description}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">

                      {application.work_mode && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {application.work_mode}
                        </span>
                      )}

                      {application.payment_type && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          {application.payment_type === "PAID"
                            ? "Paid"
                            : "Unpaid"}
                        </span>
                      )}

                      {application.duration && (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          {application.duration}
                        </span>
                      )}

                    </div>

                  </div>

                  {/* View Internship */}
                  <div className="flex shrink-0 lg:w-44">

                    <Link
                      to={`/student/internships/${application.internship_id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                      View Internship
                      <FiArrowRight />
                    </Link>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyApplications;