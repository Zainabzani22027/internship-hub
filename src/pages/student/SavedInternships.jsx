import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookmark,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiTrash2,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";

import {
  apiGet,
  apiDelete,
} from "../../utils/api";

function SavedInternships() {
  const [savedInternships, setSavedInternships] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [removingId, setRemovingId] =
    useState(null);

  const loadSavedInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet(
        "/saved-internships"
      );

      setSavedInternships(
        data.savedInternships || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load saved internships."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedInternships();
  }, []);

  const handleRemove = async (
    internshipId
  ) => {
    try {
      setRemovingId(internshipId);
      setError("");

      await apiDelete(
        `/saved-internships/${internshipId}`
      );

      setSavedInternships((previous) =>
        previous.filter(
          (internship) =>
            internship.internship_id !==
            internshipId
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to remove saved internship."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
                <FiBookmark size={22} />
              </div>

              <h1 className="text-3xl font-bold text-[#0F172A]">
                Saved Internships
              </h1>
            </div>

            <p className="text-[#64748B]">
              Keep track of internships you
              want to apply for.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSavedInternships}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              {error}
            </p>

            <button
              type="button"
              onClick={loadSavedInternships}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 h-6 w-3/4 rounded bg-slate-200" />

                <div className="mb-3 h-4 w-1/2 rounded bg-slate-200" />

                <div className="mb-6 h-16 w-full rounded bg-slate-200" />

                <div className="mb-3 h-4 w-2/3 rounded bg-slate-200" />

                <div className="h-10 w-full rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          savedInternships.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FiBookmark size={28} />
              </div>

              <h2 className="text-2xl font-bold text-[#0F172A]">
                No Saved Internships
              </h2>

              <p className="mx-auto mt-2 max-w-md text-[#64748B]">
                You haven't saved any internships
                yet. Explore available internships
                and save the ones you like.
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

        {/* Saved Internship Cards */}
        {!loading &&
          savedInternships.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedInternships.map(
                (internship) => (
                  <div
                    key={internship.saved_id}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    {/* Top */}
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-bold text-white">
                          {(
                            internship.company_name ||
                            "C"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-blue-600">
                            {
                              internship.company_name
                            }
                          </p>

                          <p className="truncate text-xs text-slate-400">
                            {
                              internship.category_name
                            }
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            internship.internship_id
                          )
                        }
                        disabled={
                          removingId ===
                          internship.internship_id
                        }
                        title="Remove saved internship"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    {/* Title */}
                    <h2 className="mb-3 line-clamp-2 text-xl font-bold text-[#0F172A]">
                      {internship.title}
                    </h2>

                    {/* Description */}
                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-[#64748B]">
                      {internship.description ||
                        "No description available."}
                    </p>

                    {/* Details */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiMapPin className="shrink-0 text-blue-600" />

                        <span>
                          {internship.city
                            ? `${internship.city}, `
                            : ""}
                          {internship.country ||
                            "Location not specified"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiClock className="shrink-0 text-purple-600" />

                        <span>
                          {internship.duration ||
                            "Duration not specified"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiDollarSign className="shrink-0 text-green-600" />

                        <span>
                          {internship.payment_type ===
                          "PAID"
                            ? internship.stipend
                              ? `Paid — ${internship.stipend}`
                              : "Paid"
                            : "Unpaid"}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      {internship.work_mode && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {internship.work_mode}
                        </span>
                      )}

                      {internship.category_name && (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          {
                            internship.category_name
                          }
                        </span>
                      )}

                      {Array.isArray(
                        internship.skills
                      ) &&
                        internship.skills
                          .slice(0, 3)
                          .map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              {skill}
                            </span>
                          ))}
                    </div>

                    {/* Bottom */}
                    <div className="mt-auto flex gap-3">
                      <Link
                        to={`/student/internships/${internship.internship_id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                      >
                        View Details
                        <FiArrowRight />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            internship.internship_id
                          )
                        }
                        disabled={
                          removingId ===
                          internship.internship_id
                        }
                        className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Remove"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}

export default SavedInternships;