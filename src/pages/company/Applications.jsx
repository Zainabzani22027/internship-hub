import React, { useEffect, useState } from "react";
import {
  Search,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock3,
  GraduationCap,
  MapPin,
} from "lucide-react";

import { apiGet, apiPut } from "../../utils/api";

function Applications() {
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/company/applications");

      setApplications(data.applications || []);
    } catch (err) {
      console.error(
        "Load company applications error:",
        err
      );

      setError(
        err.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    const value = String(
      status || "APPLIED"
    ).toUpperCase();

    const statusMap = {
      APPLIED: "Applied",
      UNDER_REVIEW: "Under Review",
      SHORTLISTED: "Shortlisted",
      INTERVIEW: "Interview",
      SELECTED: "Selected",
      REJECTED: "Rejected",
    };

    return (
      statusMap[value] ||
      value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    );
  };

  const getApplicantName = (application) => {
    return (
      application.student_name ||
      application.studentName ||
      application.full_name ||
      application.fullName ||
      application.name ||
      "Student"
    );
  };

  const getInternshipTitle = (application) => {
    return (
      application.internship_title ||
      application.internshipTitle ||
      application.title ||
      "Internship"
    );
  };

  const getUniversity = (application) => {
    return (
      application.university ||
      application.student_university ||
      "University not provided"
    );
  };

  const getLocation = (application) => {
    if (application.location) {
      return application.location;
    }

    const city =
      application.city ||
      application.student_city ||
      "";

    const country =
      application.country ||
      application.student_country ||
      "";

    if (city && country) {
      return `${city}, ${country}`;
    }

    return (
      city ||
      country ||
      "Location not provided"
    );
  };

  const getInitial = (application) => {
    const name = getApplicantName(
      application
    );

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      setUpdatingId(id);
      setError("");

      const data = await apiPut(
        `/applications/${id}/status`,
        {
          status,
        }
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === id
            ? {
                ...application,
                status:
                  data.application?.status ||
                  status,
              }
            : application
        )
      );
    } catch (err) {
      console.error(
        "Update application status error:",
        err
      );

      setError(
        err.message ||
          "Unable to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications =
    applications.filter((application) => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) return true;

      const name =
        getApplicantName(
          application
        ).toLowerCase();

      const internship =
        getInternshipTitle(
          application
        ).toLowerCase();

      const university =
        getUniversity(
          application
        ).toLowerCase();

      const location =
        getLocation(
          application
        ).toLowerCase();

      return (
        name.includes(query) ||
        internship.includes(query) ||
        university.includes(query) ||
        location.includes(query)
      );
    });

  const statusStyles = {
    Applied:
      "bg-blue-50 text-blue-700",

    "Under Review":
      "bg-amber-50 text-amber-700",

    Shortlisted:
      "bg-purple-50 text-purple-700",

    Interview:
      "bg-green-50 text-green-700",

    Selected:
      "bg-green-100 text-green-800",

    Rejected:
      "bg-red-50 text-red-700",
  };

  const statusIcon = {
    Applied: Clock3,
    "Under Review": Clock3,
    Shortlisted: CheckCircle,
    Interview: CheckCircle,
    Selected: CheckCircle,
    Rejected: XCircle,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg">
              <Users size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Applications
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review and manage student internship applications.
              </p>
            </div>

          </div>
        </div>


        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadApplications}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}


        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search applicant, internship, university or location..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

          </div>

        </div>


        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <Users
              size={44}
              className="mx-auto animate-pulse text-purple-400"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              Loading applications...
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we load student applications.
            </p>

          </div>
        )}


        {/* Applications */}
        {!loading && (
          <div className="grid gap-5">

            {filteredApplications.map(
              (application) => {

                const status =
                  formatStatus(
                    application.status
                  );

                const StatusIcon =
                  statusIcon[status] ||
                  Clock3;

                const applicantName =
                  getApplicantName(
                    application
                  );

                const internshipTitle =
                  getInternshipTitle(
                    application
                  );

                const university =
                  getUniversity(
                    application
                  );

                const location =
                  getLocation(
                    application
                  );

                return (
                  <div
                    key={application.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* Applicant */}
                      <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                          {getInitial(
                            application
                          )}
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h2 className="text-lg font-bold text-slate-900">
                              {applicantName}
                            </h2>

                            <span
                              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                statusStyles[
                                  status
                                ] ||
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <StatusIcon
                                size={14}
                              />

                              {status}
                            </span>

                          </div>

                          <p className="mt-2 font-medium text-slate-700">
                            {internshipTitle}
                          </p>

                          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-4">

                            <span className="flex items-center gap-1.5">
                              <GraduationCap
                                size={16}
                              />

                              {university}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <MapPin
                                size={16}
                              />

                              {location}
                            </span>

                          </div>

                        </div>

                      </div>


                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 lg:justify-end">

                        {/* REAL VIEW BUTTON */}
                        <button
                          type="button"
                          onClick={() =>
                            window.location.href =
                              `/company/applications/${application.id}`
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye size={17} />
                          View
                        </button>


                        {/* SHORTLIST */}
                        {(status ===
                          "Applied" ||
                          status ===
                            "Under Review") && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              application.id
                            }
                            onClick={() =>
                              updateStatus(
                                application.id,
                                "SHORTLISTED"
                              )
                            }
                            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <CheckCircle
                              size={17}
                            />

                            {updatingId ===
                            application.id
                              ? "Updating..."
                              : "Shortlist"}

                          </button>
                        )}


                        {/* INTERVIEW */}
                        {status ===
                          "Shortlisted" && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              application.id
                            }
                            onClick={() =>
                              updateStatus(
                                application.id,
                                "INTERVIEW"
                              )
                            }
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <CheckCircle
                              size={17}
                            />

                            {updatingId ===
                            application.id
                              ? "Updating..."
                              : "Interview"}

                          </button>
                        )}


                        {/* SELECT */}
                        {status ===
                          "Interview" && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              application.id
                            }
                            onClick={() =>
                              updateStatus(
                                application.id,
                                "SELECTED"
                              )
                            }
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <CheckCircle
                              size={17}
                            />

                            {updatingId ===
                            application.id
                              ? "Updating..."
                              : "Select"}

                          </button>
                        )}


                        {/* REJECT */}
                        {status !==
                          "Rejected" &&
                          status !==
                            "Selected" && (
                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                application.id
                              }
                              onClick={() =>
                                updateStatus(
                                  application.id,
                                  "REJECTED"
                                )
                              }
                              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <XCircle
                                size={17}
                              />

                              {updatingId ===
                              application.id
                                ? "Updating..."
                                : "Reject"}

                            </button>
                          )}

                      </div>

                    </div>

                  </div>
                );
              }
            )}


            {/* Empty */}
            {filteredApplications.length ===
              0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

                <Users
                  size={44}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-semibold text-slate-800">
                  No applications found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try another search term."
                    : "No students have applied to your internships yet."}
                </p>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Applications;