import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";

import { apiGet, apiPut } from "../../utils/api";

function ManageInternships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/admin/internships");

      const internshipList =
        data.internships ||
        data.data ||
        data.results ||
        [];

      const normalizedInternships = internshipList.map((internship) => {
        const companyName =
          internship.company_name ||
          internship.companyName ||
          internship.company?.name ||
          internship.company?.company_name ||
          "Unknown Company";

        const categoryName =
          internship.category_name ||
          internship.categoryName ||
          internship.category?.name ||
          internship.category ||
          "General";

        const country =
          internship.country ||
          internship.location_country ||
          "";

        const city =
          internship.city ||
          internship.location_city ||
          "";

        let location =
          internship.location ||
          internship.location_name ||
          "";

        if (!location && (city || country)) {
          location = [city, country].filter(Boolean).join(", ");
        }

        if (!location) {
          location = "Not specified";
        }

        const mode = String(
          internship.work_mode ||
            internship.workMode ||
            internship.mode ||
            "Not specified"
        )
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());

        const paymentType = String(
          internship.payment_type ||
            internship.paymentType ||
            "UNPAID"
        ).toUpperCase();

        const stipendValue = internship.stipend;

        let stipend = "Unpaid";

        if (
          paymentType === "PAID" &&
          stipendValue !== null &&
          stipendValue !== undefined &&
          stipendValue !== ""
        ) {
          stipend = `$${stipendValue} / Month`;
        } else if (
          stipendValue !== null &&
          stipendValue !== undefined &&
          stipendValue !== "" &&
          Number(stipendValue) > 0
        ) {
          stipend = `$${stipendValue} / Month`;
        }

        const rawStatus = String(
          internship.status ||
            internship.internship_status ||
            "PENDING"
        ).toUpperCase();

        let status = "Pending";

        if (rawStatus === "APPROVED" || rawStatus === "LIVE") {
          status = "Approved";
        } else if (rawStatus === "REJECTED") {
          status = "Rejected";
        } else {
          status = "Pending";
        }

        return {
          id: internship.id,
          title:
            internship.title ||
            internship.internship_title ||
            "Untitled Internship",
          company: companyName,
          category: categoryName,
          location,
          mode,
          stipend,
          status,
        };
      });

      setInternships(normalizedInternships);
    } catch (err) {
      console.error("Load admin internships error:", err);
      setError(
        err.message || "Unable to load internships."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setActionLoading(id);
      setError("");

      await apiPut(`/admin/internships/${id}`, {
        status: newStatus,
      });

      setInternships((currentInternships) =>
        currentInternships.map((internship) =>
          internship.id === id
            ? {
                ...internship,
                status:
                  newStatus === "APPROVED"
                    ? "Approved"
                    : "Rejected",
              }
            : internship
        )
      );
    } catch (err) {
      console.error("Update internship status error:", err);
      setError(
        err.message ||
          "Unable to update internship status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this internship?"
    );

    if (!confirmed) return;

    await updateStatus(id, "APPROVED");
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this internship?"
    );

    if (!confirmed) return;

    await updateStatus(id, "REJECTED");
  };

  const filteredInternships = internships.filter((internship) => {
    const search = searchTerm.toLowerCase();

    return (
      internship.title.toLowerCase().includes(search) ||
      internship.company.toLowerCase().includes(search) ||
      internship.category.toLowerCase().includes(search) ||
      internship.location.toLowerCase().includes(search) ||
      internship.mode.toLowerCase().includes(search)
    );
  });

  const approvedCount = internships.filter(
    (internship) => internship.status === "Approved"
  ).length;

  const pendingCount = internships.filter(
    (internship) => internship.status === "Pending"
  ).length;

  const rejectedCount = internships.filter(
    (internship) => internship.status === "Rejected"
  ).length;

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
              ADMIN MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              Manage Internships
            </h1>

            <p className="mt-2 text-slate-500">
              Review, approve, reject and manage internship opportunities.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl text-green-600">
            <FaBriefcase />
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Internships
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {internships.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#2563EB]">
                <FaBriefcase />
              </div>

            </div>
          </div>

          {/* Approved */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Approved
                </p>

                <p className="mt-2 text-3xl font-extrabold text-green-600">
                  {approvedCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
                <FaCheckCircle />
              </div>

            </div>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-extrabold text-amber-500">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-500">
                <FaClock />
              </div>

            </div>
          </div>

          {/* Rejected */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Rejected
                </p>

                <p className="mt-2 text-3xl font-extrabold text-red-600">
                  {rejectedCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                <FaTimesCircle />
              </div>

            </div>
          </div>

        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="relative">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search internship by title, company, category, location or mode..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* Internship Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Internship Submissions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Every internship must be approved by an administrator before
              becoming visible to students.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                  <th className="px-6 py-4">
                    Internship
                  </th>

                  <th className="px-6 py-4">
                    Company
                  </th>

                  <th className="px-6 py-4">
                    Category
                  </th>

                  <th className="px-6 py-4">
                    Location
                  </th>

                  <th className="px-6 py-4">
                    Mode
                  </th>

                  <th className="px-6 py-4">
                    Stipend
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" />

                      <p className="mt-4 font-bold text-[#0F172A]">
                        Loading internships...
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Please wait while internship data is loaded.
                      </p>
                    </td>
                  </tr>
                ) : filteredInternships.length > 0 ? (
                  filteredInternships.map((internship) => (

                    <tr
                      key={internship.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Internship */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                            <FaBriefcase />
                          </div>

                          <div>
                            <p className="font-bold text-[#0F172A]">
                              {internship.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Internship #{internship.id}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Company */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                          <FaBuilding className="text-slate-400" />
                          {internship.company}
                        </div>

                      </td>

                      {/* Category */}
                      <td className="px-6 py-5">

                        <span className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-[#6D5DFB]">
                          {internship.category}
                        </span>

                      </td>

                      {/* Location */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <FaMapMarkerAlt className="text-slate-400" />
                          {internship.location}
                        </div>

                      </td>

                      {/* Mode */}
                      <td className="px-6 py-5">

                        <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#2563EB]">
                          {internship.mode}
                        </span>

                      </td>

                      {/* Stipend */}
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                        {internship.stipend}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                            internship.status === "Approved"
                              ? "bg-green-50 text-green-600"
                              : internship.status === "Pending"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                          }`}
                        >

                          <span
                            className={`h-2 w-2 rounded-full ${
                              internship.status === "Approved"
                                ? "bg-green-500"
                                : internship.status === "Pending"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />

                          {internship.status}

                        </span>

                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          {internship.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading === internship.id}
                                onClick={() =>
                                  handleApprove(internship.id)
                                }
                                title="Approve Internship"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionLoading === internship.id ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
                                ) : (
                                  <FaCheckCircle />
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={actionLoading === internship.id}
                                onClick={() =>
                                  handleReject(internship.id)
                                }
                                title="Reject Internship"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}

                          {internship.status === "Rejected" && (
                            <button
                              type="button"
                              disabled={actionLoading === internship.id}
                              onClick={() =>
                                handleApprove(internship.id)
                              }
                              title="Approve Internship"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading === internship.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
                              ) : (
                                <FaCheckCircle />
                              )}
                            </button>
                          )}

                          {internship.status === "Approved" && (
                            <button
                              type="button"
                              disabled={actionLoading === internship.id}
                              onClick={() =>
                                handleReject(internship.id)
                              }
                              title="Reject Internship"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading === internship.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                              ) : (
                                <FaTimesCircle />
                              )}
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>

                  ))
                ) : (
                  <tr>

                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                        <FaSearch />
                      </div>

                      <p className="mt-4 font-bold text-[#0F172A]">
                        No internships found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try searching with a different internship or company
                        name.
                      </p>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* Approval Policy */}
        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
              <FaCheckCircle />
            </div>

            <div>

              <h3 className="font-extrabold text-[#0F172A]">
                Internship Approval Policy
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Companies can submit internship opportunities, but every
                internship must pass administrator review before it becomes
                visible to students. This helps maintain quality and trust
                across InternShip Hub.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                  Company Posts
                </span>

                <span className="text-slate-400">
                  →
                </span>

                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                  Pending Admin Approval
                </span>

                <span className="text-slate-400">
                  →
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                  Approved
                </span>

                <span className="text-slate-400">
                  →
                </span>

                <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                  Live
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ManageInternships;